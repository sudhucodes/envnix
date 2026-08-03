import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = pkg.version;

const files = [
    "web/app/page.tsx",
    "src/cli.ts",
];

for (const file of files) {
    let content = fs.readFileSync(file, "utf8");
    content = content.replace(
        /(PKG_VERSION\s*=\s*["'])[^"']+(["'])/,
        `$1${version}$2`
    );

    fs.writeFileSync(file, content);
}

console.log(`Updated version to ${version}`);