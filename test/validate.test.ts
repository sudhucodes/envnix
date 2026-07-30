import { describe, it, expect } from 'vitest';
import { parseEnv } from '../src/parser/parse.js';
import { validateEnvs } from '../src/validator/validate.js';

describe('Validator', () => {
    it('should pass on identical keys', () => {
        const env = parseEnv('A=1\nB=2');
        const example = parseEnv('A=\nB=');
        const result = validateEnvs(env, example);
        expect(result.valid).toBe(true);
    });

    it('should detect missing keys', () => {
        const env = parseEnv('A=1');
        const example = parseEnv('A=\nB=');
        const result = validateEnvs(env, example);
        expect(result.valid).toBe(false);
        expect(result.missing).toEqual(['B']);
    });

    it('should detect extra keys', () => {
        const env = parseEnv('A=1\nB=2');
        const example = parseEnv('A=');
        const result = validateEnvs(env, example);
        expect(result.valid).toBe(false);
        expect(result.extra).toEqual(['B']);
    });

    it('should forward duplicate keys', () => {
        const env = parseEnv('A=1\nA=2');
        const example = parseEnv('A=');
        const result = validateEnvs(env, example);
        expect(result.valid).toBe(false);
        expect(result.duplicates).toEqual(['A']);
    });
});
