<div align="center">
  <picture>
    <img src="https://raw.githubusercontent.com/sudhucodes/envnix/main/banner.png" alt="ENVNIX Logo"/>
  </picture>

[![npm](https://img.shields.io/npm/dm/envnix?style=flat&colorA=000000&colorB=000000)](https://npm.chart.dev/envnix?primary=neutral&gray=neutral&theme=dark)
[![npm version](https://img.shields.io/npm/v/envnix.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/envnix)
[![GitHub stars](https://img.shields.io/github/stars/sudhucodes/envnix?style=flat&colorA=000000&colorB=000000)](https://github.com/sudhucodes/envnix/stargazers)

<p>
  <a href="https://npmjs.com/package/envnix">NPMJS</a>
  ·
  <a href="https://envnix.sudhucodes.com">WEBSITE</a>
  ·
  <a href="https://github.com/sudhucodes/envnix/issues">ISSUES</a>
</p>
</div>

# ENVNIX

A fast, production-ready Node.js CLI to generate `.env.example` files from existing `.env` files.

## Features

- **Preserves formatting & comments**: Keeps your blank lines and comments exactly where they belong.
- **Comment cleaning**: Easily strip comments from `.env` files using `envnix clean` (in-place with `--force` or to `.env.clean`).
- **Alphabetical sorting**: Optionally sorts variables while keeping comments attached to their variables.
- **Dry-run mode**: Check outputs without writing to the disk.
- **CI / Check mode**: Ensure your examples are always in sync with your .env files on GitHub Actions.
- **Watch mode**: Regenerates `.env.example` on the fly when you modify `.env` files.
- **Zero runtime dependencies (mostly)**: Uses only `commander`, `chokidar` and `picocolors`.
- **Configurable**: Configurable via `envnix.config.json`.

## Installation

You can use it with `npx` without installing:

```bash
npx envnix generate
```

Or install it locally as a dev dependency:

```bash
npm install -D envnix
```

## Usage

### Generate `.env.example`

By default, this command reads `.env` and generates `.env.example`.

```bash
envnix generate
```

### Options

- `-i, --input <file>`: Custom input file
- `-o, --output <file>`: Custom output file
- `-a, --all`: Generate for all matched `.env*` files
- `--sort [asc|desc]`: Sort variables alphabetically
- `--no-sort`: Disable sorting
- `--no-comments`: Remove all comments from output
- `--strip-comments`: Alternative flag to strip comments from output
- `-f, --force`: Force overwrite if output exists
- `--dry-run`: Print to stdout instead of writing file
- `--verbose`: Print verbose logs
- `-q, --quiet`: Only output errors
- `--check`: Check if output matches existing file (for CI)

### Validation

Check if `.env.example` is missing keys from `.env` or has extra/duplicate keys.

```bash
envnix validate
```

### Clean Comments

Remove comment lines and inline comments from `.env` files while preserving all variable values and structure spacing.

```bash
# Create .env.clean without modifying original .env
envnix clean

# Clean directly in-place (overwrites .env)
envnix clean --force
```

### Watch Mode

Watch supported `.env*` files and automatically regenerate outputs.

```bash
envnix watch
```

## Config file

You can configure defaults using `envnix.config.json` in your project root:

```json
{
    "sort": true,
    "comments": true,
    "force": false,
    "watch": false,
    "inputs": [".env", ".env.production"]
}
```

## FAQ

**Why another env generator?**
Other tools often strip comments or blank lines, messing up well-documented configurations. `envnix` is built with a custom parser to retain your exact formatting.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute.

## License

MIT License
