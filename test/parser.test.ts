import { describe, it, expect } from 'vitest';
import { parseEnv } from '../src/parser/parse.js';

describe('Parser', () => {
    it('should parse blank lines', () => {
        const parsed = parseEnv('\n\n');
        expect(parsed.tokens.length).toBe(3);
        expect(parsed.tokens[0].type).toBe('BlankLine');
    });

    it('should parse comments', () => {
        const parsed = parseEnv('# comment 1\n  # comment 2');
        expect(parsed.tokens.length).toBe(2);
        expect(parsed.tokens[0].type).toBe('Comment');
        expect((parsed.tokens[0] as any).text).toBe(' comment 1');
    });

    it('should parse variables', () => {
        const parsed = parseEnv('A=1\nB="2"');
        expect(parsed.variablesCount).toBe(2);
        expect((parsed.tokens[0] as any).key).toBe('A');
        expect((parsed.tokens[0] as any).value).toBe('1');
    });

    it('should parse variables with inline comments', () => {
        const parsed = parseEnv('A=1 # inline');
        expect(parsed.commentsCount).toBe(1);
        expect((parsed.tokens[0] as any).value).toBe('1');
        expect((parsed.tokens[0] as any).inlineComment).toBe('# inline');
    });

    it('should detect duplicate keys', () => {
        const parsed = parseEnv('A=1\nA=2');
        expect(parsed.duplicateKeys).toEqual(['A']);
    });

    it('should throw on invalid syntax', () => {
        expect(() => parseEnv('INVALID LINE')).toThrow('Invalid env syntax on line 1');
    });

    it('should support export prefix', () => {
        const parsed = parseEnv('export A=1');
        expect((parsed.tokens[0] as any).key).toBe('A');
    });
});
