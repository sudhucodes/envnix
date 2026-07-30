import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateCommand } from '../src/commands/generate.js';
import * as fileUtils from '../src/utils/file.js';
import { logger } from '../src/utils/logger.js';

vi.mock('../src/utils/file.js');
vi.mock('../src/utils/logger.js');

describe('CLI Generate Command', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.exitCode = undefined;
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should generate output file correctly', async () => {
        vi.mocked(fileUtils.fileExists).mockResolvedValue(true);
        vi.mocked(fileUtils.readFile).mockResolvedValue('A=1\nB=2');
        vi.mocked(fileUtils.determineOutputFilePath).mockReturnValue('/fake/.env.example');
        vi.mocked(fileUtils.writeFile).mockResolvedValue(true);
        // Simulate that the output file doesn't exist yet
        vi.mocked(fileUtils.fileExists).mockImplementation(async (p: string) => {
            if (p.includes('.example')) return false;
            return true;
        });

        await generateCommand('/fake', { input: '.env' });

        expect(fileUtils.writeFile).toHaveBeenCalledWith('/fake/.env.example', 'A=\nB=');
    });

    it('should error if input file not found', async () => {
        vi.mocked(fileUtils.fileExists).mockResolvedValue(false);

        await generateCommand('/fake', { input: '.env' });

        expect(logger.error).toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });
});
