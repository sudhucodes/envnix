import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { EnvgenConfig } from '../config/load.js';
import { formatEnv } from '../formatter/format.js';
import { parseEnv } from '../parser/parse.js';
import {
    determineOutputFilePath,
    fileExists,
    findEnvFiles,
    readFile,
    writeFile,
} from '../utils/file.js';
import { logger } from '../utils/logger.js';

export interface GenerateOptions extends EnvgenConfig {
    input?: string | string[];
    output?: string;
}

export async function generateCommand(cwd: string, options: GenerateOptions): Promise<void> {
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
            return; // Exit early per spec on normal CLI usage errors
        }

        let outputPath = '';
        if (options.output && inputs.length === 1) {
            outputPath = resolve(cwd, options.output);
        } else {
            outputPath = determineOutputFilePath(inputPath);
        }

        logger.debug(`Reading ${input}`);
        const content = await readFile(inputPath);
        if (content === null) {
            process.exitCode = 1;
            return;
        }

        try {
            const parsed = parseEnv(content);
            const commentsOpt =
                options.comments !== undefined
                    ? options.comments
                    : options.stripComments !== undefined
                      ? !options.stripComments
                      : options.noComments !== undefined
                        ? !options.noComments
                        : true;

            logger.debug(`Found ${parsed.variablesCount} variables`);
            if (commentsOpt) {
                logger.debug(`Preserved ${parsed.commentsCount} comments`);
            } else {
                logger.debug(`Stripped ${parsed.commentsCount} comments`);
            }

            if (parsed.duplicateKeys.length > 0) {
                logger.warn(`Duplicate variable\n\n${parsed.duplicateKeys.join('\n')}`);
            }

            const sortOpt =
                typeof options.sort === 'boolean' ? (options.sort ? 'asc' : false) : options.sort;
            const formatted = formatEnv(parsed, { sort: sortOpt, comments: commentsOpt });

            if (options.dryRun) {
                logger.log(`\n--- Dry Run: ${outputPath} ---`);
                logger.log(formatted);
                continue;
            }

            if (options.check) {
                if (!(await fileExists(outputPath))) {
                    logger.error(`Check failed: ${outputPath} does not exist.`);
                    process.exitCode = 1;
                    continue;
                }
                const existingContent = await readFile(outputPath);
                if (existingContent === null || existingContent.trim() !== formatted.trim()) {
                    logger.error(`Check failed: ${outputPath} is out of sync.`);
                    process.exitCode = 1;
                } else {
                    logger.success(`Check passed: ${outputPath} is in sync.`);
                }
                continue;
            }

            if (!options.force && (await fileExists(outputPath))) {
                logger.error(
                    `Output file already exists.\nUse --force to overwrite.\n\n${outputPath}`,
                );
                process.exitCode = 1;
                return;
            }

            logger.debug(`Writing ${outputPath}`);
            const success = await writeFile(outputPath, formatted);
            if (!success) {
                process.exitCode = 1;
                return;
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
