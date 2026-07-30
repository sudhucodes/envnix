# Build `envnix` – Production-Ready Node.js CLI

## Overview

Build a production-ready open-source npm package named **envnix**.

The goal is to provide a fast, dependency-light CLI that generates `.env.example` files from existing `.env` files while preserving formatting and comments.

The package should be written in **TypeScript**, compiled to JavaScript, and published to npm so users can execute it with:

```bash
npx envnix generate
```

The project should follow modern Node.js best practices, include excellent DX, comprehensive tests, CI, linting, formatting, documentation, and be ready for open-source contributions.

---

# Tech Stack

- Language: TypeScript
- Runtime: Node.js 20+
- Module System: ESM
- Build: tsup
- CLI Parser: commander
- Testing: Vitest
- Linting: ESLint
- Formatting: Prettier
- Git Hooks: Husky + lint-staged
- CI: GitHub Actions
- License: MIT

The final package should have minimal runtime dependencies.

---

# CLI

```
envnix generate
envnix g
envnix validate
envnix watch
envnix --help
envnix --version
```

---

# Primary Feature

## Generate `.env.example`

Input:

```env
DATABASE_URL=postgres://localhost/db
JWT_SECRET=my-secret
PORT=3000
```

Output:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```

Only keys should remain.

Values should always be removed.

---

# Features

## 1. Preserve comments

Input

```env
# Database
DATABASE_URL=postgres://...

# Authentication
JWT_SECRET=secret
```

Output

```env
# Database
DATABASE_URL=

# Authentication
JWT_SECRET=
```

---

## 2. Preserve blank lines

Blank lines must remain exactly where they were.

---

## 3. Preserve ordering by default

Without flags, variables stay in their original order.

---

## 4. Alphabetical sorting

```
envnix generate --sort
```

Sort only variable entries.

Comments should remain attached to the variable they describe whenever practical.

Support

```
--sort asc
--sort desc
```

---

## 5. No sorting

```
envnix generate --no-sort
```

Explicitly preserve original ordering.

---

## 6. Force overwrite

```
envnix generate --force
```

If output exists:

Without `--force`

```
Output file already exists.
Use --force to overwrite.
```

Exit with non-zero status.

---

## 7. Custom input

```
envnix generate --input .env.production
```

Short flag

```
-i
```

---

## 8. Custom output

```
envnix generate --output env.sample
```

Short flag

```
-o
```

---

## 9. Generate all env files

```
envnix generate --all
```

Automatically detect

```
.env
.env.local
.env.production
.env.development
.env.test
.env.staging
.env.*
```

Generate

```
.env.example
.env.local.example
.env.production.example
.env.development.example
...
```

Skip already-generated `.example` files.

---

## 10. Dry Run

```
envnix generate --dry-run
```

Print generated content to stdout.

Do not create any file.

---

## 11. Verbose mode

```
--verbose
```

Example

```
Reading .env
Found 23 variables
Preserved 7 comments
Writing .env.example
Done in 9 ms
```

---

## 12. Quiet mode

```
--quiet
```

Only output errors.

---

## 13. Validate

```
envnix validate
```

Compare

```
.env
```

against

```
.env.example
```

Show

Missing keys

Extra keys

Duplicate keys

Exit code

0 = valid

1 = invalid

Example

```
Missing

JWT_SECRET
API_KEY

Extra

OLD_VAR
```

---

## 14. Check mode (CI)

```
envnix generate --check
```

Do not write.

Instead compare generated output with existing file.

If different

Exit code 1.

Perfect for GitHub Actions.

---

## 15. Watch Mode

```
envnix watch
```

Watch every supported `.env*` file.

Automatically regenerate outputs.

Display concise logs.

---

## 16. Multiple outputs

Allow

```
envnix generate \
  -i .env.production \
  -o env.sample
```

---

## 17. Config file

Support optional

```
envnix.config.json
```

Example

```json
{
    "sort": true,
    "force": false,
    "watch": false,
    "inputs": [".env", ".env.production"]
}
```

CLI flags override config values.

---

## 18. Ignore patterns

Support

```
.env.example
.env.backup
.env.old
```

Never process output/example files as inputs.

---

## 19. Duplicate detection

Warn

```
Duplicate variable

DATABASE_URL
```

---

## 20. Unicode support

Support UTF-8 comments.

---

## 21. Windows compatibility

Support

Windows

macOS

Linux

---

## 22. Large file support

Efficiently process env files with thousands of variables.

---

## Error Handling

Provide professional error messages.

Examples

```
Input file not found

.env.production
```

```
Permission denied

.env.example
```

```
Invalid env syntax on line 17
```

Never crash with stack traces during normal CLI usage.

---

# Help

```
envnix --help
```

Display polished help similar to npm, git, or pnpm.

---

# Package Structure

```
envnix/
 ├── src/
 │    ├── cli.ts
 │    ├── commands/
 │    ├── parser/
 │    ├── formatter/
 │    ├── watcher/
 │    ├── validator/
 │    ├── config/
 │    ├── utils/
 │    └── index.ts
 │
 ├── test/
 ├── examples/
 ├── .github/
 │     └── workflows/
 ├── package.json
 ├── tsconfig.json
 ├── tsup.config.ts
 ├── README.md
 ├── LICENSE
 ├── CHANGELOG.md
 └── CONTRIBUTING.md
```

---

# README

Generate a professional README including

- Features
- Installation
- Usage
- Commands
- Options
- Examples
- CI example
- Watch mode
- Validate mode
- Config file
- FAQ
- Contributing
- License

Include badges for

- npm version
- downloads
- GitHub Actions
- license
- TypeScript

---

# Testing

Write comprehensive Vitest tests covering

- parsing
- formatting
- comments
- blank lines
- sorting
- validation
- duplicate keys
- watch mode
- config loading
- CLI behavior
- snapshot tests
- error handling

Aim for >95% coverage.

---

# GitHub Actions

Create workflows for

- Install
- Build
- Lint
- Test
- Type check
- Publish (manual release)
- Release artifacts

---

# Code Quality

- Strict TypeScript
- No `any` unless absolutely necessary
- Clean architecture
- Modular design
- Small reusable functions
- Comprehensive JSDoc comments
- Strong typing throughout
- Consistent naming
- ESLint passes with zero warnings
- Prettier formatting
- Zero TypeScript errors

---

# Performance

Optimize for

- Fast startup
- Low memory usage
- Streaming where appropriate
- Minimal dependencies
- Efficient file operations

---

# Deliverables

Produce a complete, production-ready repository containing:

- All source code
- Tests
- Documentation
- GitHub workflows
- Configuration files
- npm configuration
- Release-ready package
- Example files
- Sample outputs
- MIT license

The generated project should be ready to run with:

```bash
npm install
npm run build
npm test
npm run lint
npm pack
```

without requiring additional manual setup.
