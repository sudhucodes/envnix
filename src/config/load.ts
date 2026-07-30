import { resolve } from 'node:path';
import { fileExists, readFile } from '../utils/file.js';

export interface EnvgenConfig {
    sort?: 'asc' | 'desc' | boolean;
    force?: boolean;
    watch?: boolean;
    inputs?: string[];
    output?: string;
    all?: boolean;
    dryRun?: boolean;
    verbose?: boolean;
    quiet?: boolean;
    check?: boolean;
}

export async function loadConfig(cwd: string): Promise<EnvgenConfig> {
    const configPath = resolve(cwd, 'envnix.config.json');
    if (!(await fileExists(configPath))) {
        return {};
    }

    const content = await readFile(configPath);
    if (!content) return {};

    try {
        const parsed = JSON.parse(content);
        return parsed as EnvgenConfig;
    } catch (err: any) {
        throw new Error(`Failed to parse envnix.config.json: ${err.message}`);
    }
}
