import fs from 'node:fs';
import path from 'node:path';

const isAll = process.argv.includes('--all');

const TARGET_DIRS = ['.next', 'dist', 'build', '.out'];
const CACHE_DIRS = ['node_modules/.cache'];

function removePath(targetPath) {
    if (fs.existsSync(targetPath)) {
        try {
            fs.rmSync(targetPath, { recursive: true, force: true });
            console.log(`[CLEAN] Removed: ${path.relative(process.cwd(), targetPath)}`);
        } catch (err) {
            console.error(`[CLEAN ERROR] Failed to remove ${targetPath}:`, err.message);
        }
    }
}

function cleanSubdirectory(baseDir) {
    if (!fs.existsSync(baseDir)) return;
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const itemPath = path.join(baseDir, entry.name);

        // Remove target output folders
        TARGET_DIRS.forEach((dirName) => {
            removePath(path.join(itemPath, dirName));
        });

        // Remove node_modules/.cache inside package
        CACHE_DIRS.forEach((cacheDir) => {
            removePath(path.join(itemPath, cacheDir));
        });

        // If --all is specified, remove node_modules inside package as well
        if (isAll) {
            removePath(path.join(itemPath, 'node_modules'));
        }
    }
}

console.log(
    `🧹 Cleaning monorepo ${isAll ? '(FULL CLEAN including node_modules)' : 'caches and build outputs'}...\n`,
);

// 1. Clean root target folders
TARGET_DIRS.forEach((dirName) => {
    removePath(path.join(process.cwd(), dirName));
});
CACHE_DIRS.forEach((cacheDir) => {
    removePath(path.join(process.cwd(), cacheDir));
});
if (isAll) {
    removePath(path.join(process.cwd(), 'node_modules'));
}

// 2. Clean apps/* and packages/* folders
cleanSubdirectory(path.join(process.cwd(), 'apps'));
cleanSubdirectory(path.join(process.cwd(), 'packages'));

console.log('\n✨ Cache and build cleanup complete!');
