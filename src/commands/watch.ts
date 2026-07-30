import chokidar from 'chokidar';
import { resolve } from 'node:path';
import { EnvgenConfig } from '../config/load.js';
import { logger } from '../utils/logger.js';
import { generateCommand } from './generate.js';

export async function watchCommand(cwd: string, config: EnvgenConfig) {
    logger.info('Starting watch mode...');

    // By default watch .env* files except ignores
    const watcher = chokidar.watch('.env*', {
        cwd,
        ignored: [
            '**/*.example',
            '**/*.backup',
            '**/*.old',
            '**/*.sample',
            'node_modules/**',
            '.git/**',
        ],
        persistent: true,
        ignoreInitial: true,
    });

    const handleEvent = async (event: string, path: string) => {
        logger.info(`Detected ${event} on ${path}. Regenerating...`);
        const fullPath = resolve(cwd, path);
        try {
            // Force generation for the single file changed to be fast
            const opts = {
                ...config,
                input: fullPath,
                output: undefined,
                all: false,
                force: true, // Auto overwrite during watch
                quiet: true, // Keep it concise unless verbose is on
            };

            await generateCommand(cwd, opts);
            logger.success(`Regenerated example for ${path}`);
        } catch (err: any) {
            logger.error(`Error regenerating ${path}: ${err.message}`);
        }
    };

    watcher
        .on('add', (path) => handleEvent('add', path))
        .on('change', (path) => handleEvent('change', path))
        .on('unlink', (path) => logger.debug(`File removed: ${path}`));

    logger.info('Watching for changes in .env files...');

    // To keep process alive (though chokidar does it)
    return new Promise(() => {});
}
