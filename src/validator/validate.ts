import { ParseResult } from '../parser/parse.js';
import { logger } from '../utils/logger.js';

export interface ValidationResult {
    valid: boolean;
    missing: string[];
    extra: string[];
    duplicates: string[];
}

export function validateEnvs(envParsed: ParseResult, exampleParsed: ParseResult): ValidationResult {
    const envKeys = new Set(
        envParsed.tokens.filter((t) => t.type === 'Variable').map((t) => (t as any).key),
    );
    const exampleKeys = new Set(
        exampleParsed.tokens.filter((t) => t.type === 'Variable').map((t) => (t as any).key),
    );

    const missing: string[] = [];
    const extra: string[] = [];
    const duplicates = envParsed.duplicateKeys;

    for (const exKey of exampleKeys) {
        if (!envKeys.has(exKey)) {
            missing.push(exKey);
        }
    }

    for (const envKey of envKeys) {
        if (!exampleKeys.has(envKey)) {
            extra.push(envKey);
        }
    }

    return {
        valid: missing.length === 0 && extra.length === 0 && duplicates.length === 0,
        missing,
        extra,
        duplicates,
    };
}

export function printValidationResult(result: ValidationResult) {
    if (result.missing.length > 0) {
        logger.log('\nMissing');
        logger.log('');
        for (const key of result.missing) {
            logger.log(key);
        }
    }

    if (result.extra.length > 0) {
        logger.log('\nExtra');
        logger.log('');
        for (const key of result.extra) {
            logger.log(key);
        }
    }

    if (result.duplicates.length > 0) {
        logger.log('\nDuplicate variable');
        logger.log('');
        for (const key of result.duplicates) {
            logger.log(key);
        }
    }
}
