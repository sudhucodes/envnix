import { readFile, fileExists } from '../utils/file.js';
import { resolve } from 'node:path';

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
    const configPath = resolve(cwd, 'envgen.config.json');
    if (!(await fileExists(configPath))) {
        return {};
    }

    const content = await readFile(configPath);
    if (!content) return {};

    try {
        const parsed = JSON.parse(content);
        return parsed as EnvgenConfig;
    } catch (err: any) {
        throw new Error(`Failed to parse envgen.config.json: ${err.message}`);
    }
}
