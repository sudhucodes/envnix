import { promises as fs } from 'node:fs';
import { parse, resolve } from 'node:path';
import { logger } from './logger.js';

export async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function readFile(filePath: string): Promise<string | null> {
    try {
        return await fs.readFile(filePath, 'utf-8');
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            logger.error(`Input file not found: ${filePath}`);
        } else if (err.code === 'EACCES') {
            logger.error(`Permission denied: ${filePath}`);
        } else {
            logger.error(`Failed to read file ${filePath}: ${err.message}`);
        }
        return null;
    }
}

export async function writeFile(filePath: string, content: string): Promise<boolean> {
    try {
        await fs.writeFile(filePath, content, 'utf-8');
        return true;
    } catch (err: any) {
        if (err.code === 'EACCES') {
            logger.error(`Permission denied: ${filePath}`);
        } else {
            logger.error(`Failed to write file ${filePath}: ${err.message}`);
        }
        return false;
    }
}

export async function findEnvFiles(cwd: string): Promise<string[]> {
    const files = await fs.readdir(cwd);
    return files.filter(
        (file) =>
            file.startsWith('.env') &&
            !file.endsWith('.example') &&
            !file.endsWith('.backup') &&
            !file.endsWith('.old') &&
            !file.endsWith('.sample'),
    );
}

export function determineOutputFilePath(inputPath: string): string {
    const parsed = parse(inputPath);
    if (parsed.name.endsWith('.example')) {
        return inputPath;
    }
    return resolve(parsed.dir, `${parsed.base}.example`);
}
