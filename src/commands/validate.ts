import { resolve } from 'node:path';
import { parseEnv } from '../parser/parse.js';
import { fileExists, readFile } from '../utils/file.js';
import { logger } from '../utils/logger.js';
import { printValidationResult, validateEnvs } from '../validator/validate.js';

export async function validateCommand(cwd: string) {
    const envPath = resolve(cwd, '.env');
    const examplePath = resolve(cwd, '.env.example');

    if (!(await fileExists(envPath))) {
        logger.error('Input file not found\n\n.env');
        process.exitCode = 1;
        return;
    }

    if (!(await fileExists(examplePath))) {
        logger.error('Example file not found\n\n.env.example');
        process.exitCode = 1;
        return;
    }

    const envContent = await readFile(envPath);
    const exampleContent = await readFile(examplePath);

    if (envContent === null || exampleContent === null) {
        process.exitCode = 1;
        return;
    }

    try {
        const envParsed = parseEnv(envContent);
        const exampleParsed = parseEnv(exampleContent);

        const result = validateEnvs(envParsed, exampleParsed);

        if (result.valid) {
            logger.success('Validation passed. No missing or extra keys.');
        } else {
            printValidationResult(result);
            process.exitCode = 1;
        }
    } catch (err: any) {
        logger.error(`Validation failed: ${err.message}`);
        process.exitCode = 1;
    }
}
