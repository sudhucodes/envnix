import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { EnvgenConfig } from '../config/load.js';
import { formatEnv, FormatOptions, QuoteMode, QuoteType } from '../formatter/format.js';
import { parseEnv } from '../parser/parse.js';
import {
    determineFormatOutputFilePath,
    fileExists,
    findEnvFiles,
    readFile,
    writeFile,
} from '../utils/file.js';
import { logger } from '../utils/logger.js';

export interface FormatCommandOptions extends EnvgenConfig {
    input?: string | string[];
    output?: string;
    sort?: 'asc' | 'desc' | boolean;
    comments?: boolean;
    stripComments?: boolean;
    noComments?: boolean;
    force?: boolean;
    write?: boolean;
    dryRun?: boolean;
    verbose?: boolean;
    quiet?: boolean;
    check?: boolean;
    quotes?: QuoteMode;
    quoteType?: QuoteType;
}

/**
 * Formats raw .env string content directly.
 */
export function formatContent(content: string, options: FormatOptions = {}): string {
    const parsed = parseEnv(content);
    return formatEnv(parsed, {
        preserveValues: true,
        quotes: options.quotes ?? 'always',
        quoteType: options.quoteType ?? 'double',
        ...options,
    });
}

export async function formatCommand(cwd: string, options: FormatCommandOptions): Promise<void> {
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

    const isForceOrWrite = Boolean(options.force || options.write);

    for (const input of inputs) {
        const inputPath = resolve(cwd, input);

        if (!(await fileExists(inputPath))) {
            logger.error(`Input file not found\n\n${input}`);
            process.exitCode = 1;
            return;
        }

        let outputPath = '';
        if (isForceOrWrite) {
            outputPath = inputPath;
        } else if (options.output && inputs.length === 1) {
            outputPath = resolve(cwd, options.output);
        } else {
            outputPath = determineFormatOutputFilePath(inputPath);
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

            const formatted = formatEnv(parsed, {
                sort: sortOpt,
                comments: commentsOpt,
                preserveValues: true,
                quotes: options.quotes ?? 'always',
                quoteType: options.quoteType ?? 'double',
            });

            if (options.dryRun) {
                logger.log(`\n--- Dry Run: ${outputPath} ---`);
                logger.log(formatted);
                continue;
            }

            if (options.check) {
                if (content.trim() !== formatted.trim()) {
                    logger.error(`Check failed: ${input} is not formatted.`);
                    process.exitCode = 1;
                } else {
                    logger.success(`Check passed: ${input} is properly formatted.`);
                }
                continue;
            }

            logger.debug(`Writing ${outputPath}`);
            const success = await writeFile(outputPath, formatted);
            if (!success) {
                process.exitCode = 1;
                return;
            }

            if (isForceOrWrite) {
                logger.success(`Formatted ${input} in-place.`);
            } else {
                logger.success(`Formatted ${input} -> ${outputPath}`);
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
