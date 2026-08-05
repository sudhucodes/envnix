import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { EnvgenConfig } from '../config/load.js';
import { findInlineCommentIndex } from '../parser/parse.js';
import {
    determineCleanOutputFilePath,
    fileExists,
    findEnvFiles,
    readFile,
    writeFile,
} from '../utils/file.js';
import { logger } from '../utils/logger.js';

export interface CleanOptions extends EnvgenConfig {
    input?: string | string[];
    output?: string;
}

export function cleanContent(content: string): string {
    const lines = content.split(/\r?\n/);
    const resultLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const trimmed = raw.trim();

        // 1. Skip comment lines
        if (trimmed.startsWith('#')) {
            continue;
        }

        // 2. Handle variable / non-comment lines
        let processedLine = raw;

        if (trimmed !== '') {
            const match = raw.match(/^(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(.*)?$/);
            if (match) {
                const val = match[2] || '';
                const commentIdx = findInlineCommentIndex(val);
                if (commentIdx !== -1) {
                    const valWithoutComment = val.substring(0, commentIdx).trimEnd();
                    const keyPart = raw.substring(0, raw.length - val.length);
                    processedLine = `${keyPart}${valWithoutComment}`;
                }
            }
        }

        resultLines.push(processedLine);
    }

    // Collapse successive blank lines into a single blank line
    const finalLines: string[] = [];
    let prevIsBlank = false;

    for (const line of resultLines) {
        const isBlank = line.trim() === '';
        if (isBlank) {
            if (prevIsBlank) continue;
            prevIsBlank = true;
        } else {
            prevIsBlank = false;
        }
        finalLines.push(line);
    }

    // Also remove leading blank lines if any
    while (finalLines.length > 0 && finalLines[0].trim() === '') {
        finalLines.shift();
    }

    return finalLines.join('\n');
}

export async function cleanCommand(cwd: string, options: CleanOptions): Promise<void> {
    logger.setOptions({ quiet: options.quiet, verbose: options.verbose });

    const start = performance.now();
    let inputs: string[] = [];

    if (options.all) {
        inputs = await findEnvFiles(cwd);
        if (inputs.length === 0) {
            logger.error('No .env files found.');
            process.exitCode = 1;
            return;
        }
    } else if (options.input) {
        inputs = Array.isArray(options.input) ? options.input : [options.input];
    } else if (options.inputs && options.inputs.length > 0) {
        inputs = options.inputs;
    } else {
        inputs = ['.env'];
    }

    for (const input of inputs) {
        const inputPath = resolve(cwd, input);

        if (!(await fileExists(inputPath))) {
            logger.error(`Input file not found\n\n${input}`);
            process.exitCode = 1;
            return;
        }

        let outputPath = '';
        if (options.force) {
            outputPath = inputPath;
        } else if (options.output && inputs.length === 1) {
            outputPath = resolve(cwd, options.output);
        } else {
            outputPath = determineCleanOutputFilePath(inputPath);
        }

        logger.debug(`Reading ${input}`);
        const content = await readFile(inputPath);
        if (content === null) {
            process.exitCode = 1;
            return;
        }

        try {
            const cleaned = cleanContent(content);

            if (options.dryRun) {
                logger.log(`\n--- Dry Run: ${outputPath} ---`);
                logger.log(cleaned);
                continue;
            }

            logger.debug(`Writing ${outputPath}`);
            const success = await writeFile(outputPath, cleaned);
            if (!success) {
                process.exitCode = 1;
                return;
            }

            if (options.force) {
                logger.success(`Cleaned ${input} in-place.`);
            } else {
                logger.success(`Cleaned ${input} -> ${outputPath}`);
            }
        } catch (err: any) {
            logger.error(err);
            process.exitCode = 1;
            return;
        }
    }

    const end = performance.now();
    logger.debug(`Done in ${Math.round(end - start)} ms`);
}
