#!/usr/bin/env node
import { Command } from 'commander';
import { generateCommand } from './commands/generate.js';
import { validateCommand } from './commands/validate.js';
import { watchCommand } from './commands/watch.js';
import { loadConfig } from './config/load.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
    const program = new Command();
    const cwd = process.cwd();
    const config = await loadConfig(cwd);

    program
        .name('envnix')
        .description('Generate .env.example files from existing .env files')
        .version('1.0.0'); // Ideally imported from package.json in a real scenario

    program
        .command('generate')
        .alias('g')
        .description('Generate .env.example from input')
        .option('--sort [order]', 'Sort variables (asc or desc)')
        .option('--no-sort', 'Do not sort variables')
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

            const mergedOptions = {
                ...config,
                ...options,
                sort: sortOpt,
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
