import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fileExists, determineOutputFilePath } from '../src/utils/file.js';
import { logger } from '../src/utils/logger.js';
import { promises as fs } from 'node:fs';

vi.mock('node:fs', () => ({
    promises: {
        access: vi.fn(),
        readFile: vi.fn(),
        writeFile: vi.fn(),
        readdir: vi.fn(),
    },
}));

describe('Utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('file.ts', () => {
        it('fileExists should return true if exists', async () => {
            vi.mocked(fs.access).mockResolvedValue(undefined);
            expect(await fileExists('.env')).toBe(true);
        });

        it('fileExists should return false if not exists', async () => {
            vi.mocked(fs.access).mockRejectedValue(new Error());
            expect(await fileExists('.env.missing')).toBe(false);
        });

        it('determineOutputFilePath should handle existing examples', () => {
            expect(determineOutputFilePath('.env.example')).toContain('.env.example');
            expect(determineOutputFilePath('.env')).toContain('.env.example');
            expect(determineOutputFilePath('.env.production')).toContain('.env.production.example');
        });
    });

    describe('logger.ts', () => {
        it('should respect quiet mode', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            logger.setOptions({ quiet: true });
            logger.log('test');
            expect(consoleSpy).not.toHaveBeenCalled();
            logger.setOptions({ quiet: false });
        });

        it('should log correctly', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            logger.setOptions({ quiet: false });
            logger.log('test');
            expect(consoleSpy).toHaveBeenCalledWith('test');
        });
    });
});
