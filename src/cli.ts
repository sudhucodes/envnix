#!/usr/bin/env node
import { Command } from 'commander';
import { cleanCommand } from './commands/clean.js';
import { formatCommand } from './commands/format.js';
import { generateCommand } from './commands/generate.js';
import { validateCommand } from './commands/validate.js';
import { watchCommand } from './commands/watch.js';
import { loadConfig } from './config/load.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
    const program = new Command();
    const cwd = process.cwd();
    const config = await loadConfig(cwd);
    const PKG_VERSION = '0.0.6';

    program
        .name('envnix')
        .description(
            'A fast, production-ready Node.js CLI to generate .env.example files from existing .env files.',
        )
        .version(PKG_VERSION);

    program
        .command('generate')
        .alias('g')
        .description('Generate .env.example from input')
        .option('--sort [order]', 'Sort variables (asc or desc)')
        .option('--no-sort', 'Do not sort variables')
        .option('--comments', 'Include comments in output')
        .option('--no-comments', 'Remove comments from generated output')
        .option('--strip-comments', 'Strip comments from generated output')
        .option('-f, --force', 'Force overwrite if output exists')
        .option('-i, --input <file>', 'Custom input file')
        .option('-o, --output <file>', 'Custom output file')
        .option('-a, --all', 'Generate for all matched .env* files')
        .option('--dry-run', 'Print to stdout instead of writing file')
        .option('--verbose', 'Print verbose logs')
        .option('-q, --quiet', 'Only output errors')
        .option('--check', 'Check if output matches existing file (for CI)')
        .action(async (options) => {
            // Merge config with CLI flags. CLI flags override config.
            const sortOpt =
                options.sort !== undefined
                    ? options.sort
                    : options.sort === false
                      ? false
                      : config.sort;

            const commentsOpt = options.stripComments
                ? false
                : options.comments !== undefined
                  ? options.comments
                  : config.comments !== undefined
                    ? config.comments
                    : config.stripComments !== undefined
                      ? !config.stripComments
                      : config.noComments !== undefined
                        ? !config.noComments
                        : true;

            const mergedOptions = {
                ...config,
                ...options,
                sort: sortOpt,
                comments: commentsOpt,
                force: options.force ?? config.force,
                all: options.all ?? config.all,
                dryRun: options.dryRun ?? config.dryRun,
                verbose: options.verbose ?? config.verbose,
                quiet: options.quiet ?? config.quiet,
                check: options.check ?? config.check,
                input: options.input ?? config.inputs,
                output: options.output ?? config.output,
            };

            await generateCommand(cwd, mergedOptions);
        });

    program
        .command('clean')
        .alias('c')
        .description('Remove comments from .env files')
        .option('-f, --force', 'Clean directly in-place instead of creating .clean file')
        .option('-i, --input <file>', 'Custom input file')
        .option('-o, --output <file>', 'Custom output file')
        .option('-a, --all', 'Clean all matched .env* files')
        .option('--dry-run', 'Print to stdout instead of writing file')
        .option('--verbose', 'Print verbose logs')
        .option('-q, --quiet', 'Only output errors')
        .action(async (options) => {
            const mergedOptions = {
                ...config,
                ...options,
                force: options.force ?? config.force,
                all: options.all ?? config.all,
                dryRun: options.dryRun ?? config.dryRun,
                verbose: options.verbose ?? config.verbose,
                quiet: options.quiet ?? config.quiet,
                input: options.input ?? config.inputs,
                output: options.output ?? config.output,
            };

            await cleanCommand(cwd, mergedOptions);
        });

    program
        .command('format')
        .alias('fmt')
        .description('Format .env files (quote values, normalize spacing, optional sorting)')
        .option('-w, --write', 'Format directly in-place (overwrites input file)')
        .option('-f, --force', 'Format directly in-place (alias for --write)')
        .option('-i, --input <file>', 'Custom input file')
        .option('-o, --output <file>', 'Custom output file')
        .option('-a, --all', 'Format all matched .env* files')
        .option('--sort [order]', 'Sort variables (asc or desc)')
        .option('--no-sort', 'Do not sort variables')
        .option('--comments', 'Include comments in output')
        .option('--no-comments', 'Remove comments from formatted output')
        .option('--strip-comments', 'Strip comments from formatted output')
        .option('--quotes <mode>', 'Quotes mode: always, as-needed, or never', 'always')
        .option('--quote-type <type>', 'Quote type: double or single', 'double')
        .option('--dry-run', 'Print to stdout instead of writing file')
        .option('--verbose', 'Print verbose logs')
        .option('-q, --quiet', 'Only output errors')
        .option('--check', 'Check if input files are formatted (for CI)')
        .action(async (options) => {
            const sortOpt =
                options.sort !== undefined
                    ? options.sort
                    : options.sort === false
                      ? false
                      : config.sort;

            const commentsOpt = options.stripComments
                ? false
                : options.comments !== undefined
                  ? options.comments
                  : config.comments !== undefined
                    ? config.comments
                    : config.stripComments !== undefined
                      ? !config.stripComments
                      : config.noComments !== undefined
                        ? !config.noComments
                        : true;

            const mergedOptions = {
                ...config,
                ...options,
                sort: sortOpt,
                comments: commentsOpt,
                force: options.force ?? config.force,
                write: options.write ?? config.write,
                all: options.all ?? config.all,
                dryRun: options.dryRun ?? config.dryRun,
                verbose: options.verbose ?? config.verbose,
                quiet: options.quiet ?? config.quiet,
                check: options.check ?? config.check,
                input: options.input ?? config.inputs,
                output: options.output ?? config.output,
                quotes: options.quotes ?? config.quotes ?? 'always',
                quoteType: options.quoteType ?? config.quoteType ?? 'double',
            };

            await formatCommand(cwd, mergedOptions);
        });

    program
        .command('validate')
        .description('Validate .env against .env.example')
        .action(async () => {
            await validateCommand(cwd);
        });

    program
        .command('watch')
        .description('Watch supported .env* files and regenerate')
        .action(async () => {
            await watchCommand(cwd, config);
        });

    // Handle global options or just pass to parse
    program.parse(process.argv);
}

bootstrap().catch((err) => {
    logger.error(`Fatal error: ${err.message}`);
    process.exitCode = 1;
});
