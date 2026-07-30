# envgen

> A fast, production-ready Node.js CLI to generate `.env.example` files from existing `.env` files while preserving formatting, ordering, and comments.

![npm](https://img.shields.io/npm/v/envgen)
![license](https://img.shields.io/npm/l/envgen)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![GitHub Actions](https://github.com/sudhucodes/envgen/actions/workflows/ci.yml/badge.svg)

## Features

- **Preserves formatting & comments**: Keeps your blank lines and comments exactly where they belong.
- **Alphabetical sorting**: Optionally sorts variables while keeping comments attached to their variables.
- **Dry-run mode**: Check outputs without writing to the disk.
- **CI / Check mode**: Ensure your examples are always in sync with your .env files on GitHub Actions.
- **Watch mode**: Regenerates `.env.example` on the fly when you modify `.env` files.
- **Zero runtime dependencies (mostly)**: Uses only `commander`, `chokidar`, and `picocolors`.
- **Configurable**: Configurable via `envgen.config.json`.

## Installation

You can use it with `npx` without installing:

```bash
npx envgen generate
```

Or install it locally as a dev dependency:

```bash
npm install -D envgen
```

## Usage

### Generate `.env.example`

By default, this command reads `.env` and generates `.env.example`.

```bash
envgen generate
```

### Options

- `-i, --input <file>`: Custom input file
- `-o, --output <file>`: Custom output file
- `-a, --all`: Generate for all matched `.env*` files
- `--sort [asc|desc]`: Sort variables alphabetically
- `--no-sort`: Disable sorting
- `-f, --force`: Force overwrite if output exists
- `--dry-run`: Print to stdout instead of writing file
- `--verbose`: Print verbose logs
- `-q, --quiet`: Only output errors
- `--check`: Check if output matches existing file (for CI)

### Validation

Check if `.env.example` is missing keys from `.env` or has extra/duplicate keys.

```bash
envgen validate
```

### Watch Mode

Watch supported `.env*` files and automatically regenerate outputs.

```bash
envgen watch
```

## Config file

You can configure defaults using `envgen.config.json` in your project root:

```json
{
    "sort": true,
    "force": false,
    "watch": false,
    "inputs": [".env", ".env.production"]
}
```

## FAQ

**Why another env generator?**
Other tools often strip comments or blank lines, messing up well-documented configurations. `envgen` is built with a custom parser to retain your exact formatting.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute.

## License

MIT License
