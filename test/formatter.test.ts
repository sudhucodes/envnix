import { describe, it, expect } from 'vitest';
import { parseEnv } from '../src/parser/parse.js';
import { formatEnv } from '../src/formatter/format.js';

describe('Formatter', () => {
    it('should format simple env', () => {
        const parsed = parseEnv('A=1\nB=2');
        const formatted = formatEnv(parsed);
        expect(formatted).toBe('A=\nB=');
    });

    it('should keep blank lines and comments in original order', () => {
        const parsed = parseEnv('# c1\nA=1\n\nB=2');
        const formatted = formatEnv(parsed);
        expect(formatted).toBe('# c1\nA=\n\nB=');
    });

    it('should sort alphabetically', () => {
        const parsed = parseEnv('Z=1\nA=2\nM=3');
        const formatted = formatEnv(parsed, { sort: 'asc' });
        expect(formatted).toBe('A=\nM=\nZ=');
    });

    it('should sort alphabetically desc', () => {
        const parsed = parseEnv('A=1\nZ=2\nM=3');
        const formatted = formatEnv(parsed, { sort: 'desc' });
        expect(formatted).toBe('Z=\nM=\nA=');
    });

    it('should format inline comments', () => {
        const parsed = parseEnv('A=1 # test');
        const formatted = formatEnv(parsed);
        expect(formatted).toBe('A= # test');
    });
});
