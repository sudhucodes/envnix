import test from 'node:test';
import assert from 'node:assert/strict';
import {
    escapeDoubleQuotes,
    escapeSingleQuotes,
    formatContent,
    formatEnvValue,
    isWrappedInQuotes,
} from '../dist/index.js';

test('isWrappedInQuotes checks enclosing quotes correctly', () => {
    assert.deepEqual(isWrappedInQuotes('"http://localhost:3000"'), {
        isQuoted: true,
        quoteChar: '"',
        inner: 'http://localhost:3000',
    });
    assert.deepEqual(isWrappedInQuotes("'http://localhost:3000'"), {
        isQuoted: true,
        quoteChar: "'",
        inner: 'http://localhost:3000',
    });
    assert.deepEqual(isWrappedInQuotes('""'), {
        isQuoted: true,
        quoteChar: '"',
        inner: '',
    });
    assert.deepEqual(isWrappedInQuotes('http://localhost:3000'), {
        isQuoted: false,
    });
    assert.deepEqual(isWrappedInQuotes('"foo" "bar"'), {
        isQuoted: false,
    });
    assert.deepEqual(isWrappedInQuotes('"escaped \\" quote"'), {
        isQuoted: true,
        quoteChar: '"',
        inner: 'escaped \\" quote',
    });
});

test('escapeDoubleQuotes and escapeSingleQuotes escape properly', () => {
    assert.equal(escapeDoubleQuotes('foo"bar'), 'foo\\"bar');
    assert.equal(escapeDoubleQuotes('foo\\"bar'), 'foo\\"bar');
    assert.equal(escapeSingleQuotes("foo'bar"), "foo\\'bar");
    assert.equal(escapeSingleQuotes("foo\\'bar"), "foo\\'bar");
});

test('formatEnvValue quotes values properly', () => {
    // Unquoted URL
    assert.equal(formatEnvValue('http://localhost:3000'), '"http://localhost:3000"');
    // Already double-quoted
    assert.equal(formatEnvValue('"http://localhost:3000"'), '"http://localhost:3000"');
    // Single quoted converted to double quoted
    assert.equal(formatEnvValue("'http://localhost:3000'"), '"http://localhost:3000"');
    // Empty value
    assert.equal(formatEnvValue(''), '""');
    // Single quote mode
    assert.equal(formatEnvValue('http://localhost:3000', 'single'), "'http://localhost:3000'");
    // Quotes as-needed
    assert.equal(formatEnvValue('3000', 'double', 'as-needed'), '3000');
    assert.equal(
        formatEnvValue('http://localhost:3000', 'double', 'as-needed'),
        '"http://localhost:3000"',
    );
    // Quotes never
    assert.equal(
        formatEnvValue('"http://localhost:3000"', 'double', 'never'),
        'http://localhost:3000',
    );
});

test('formatContent formats NEXT_PUBLIC_BASE_URL=http://localhost:3000 to NEXT_PUBLIC_BASE_URL="http://localhost:3000"', () => {
    const input = 'NEXT_PUBLIC_BASE_URL=http://localhost:3000';
    const output = formatContent(input);
    assert.equal(output, 'NEXT_PUBLIC_BASE_URL="http://localhost:3000"');
});

test('formatContent preserves already quoted variables and comments', () => {
    const input = [
        '# Server configuration',
        'PORT=3000',
        'NEXT_PUBLIC_BASE_URL=http://localhost:3000 # Public frontend URL',
        '',
        '# Secret token',
        'SECRET="already-quoted-secret"',
        'EMPTY=',
        'export API_URL=http://api.internal:8080',
    ].join('\n');

    const expected = [
        '# Server configuration',
        'PORT="3000"',
        'NEXT_PUBLIC_BASE_URL="http://localhost:3000" # Public frontend URL',
        '',
        '# Secret token',
        'SECRET="already-quoted-secret"',
        'EMPTY=""',
        'export API_URL="http://api.internal:8080"',
    ].join('\n');

    const result = formatContent(input);
    assert.equal(result, expected);
});

test('formatContent handles sorting and stripping comments', () => {
    const input = ['# Z comment', 'Z_VAR=last', '', '# A comment', 'A_VAR=first'].join('\n');

    const sorted = formatContent(input, { sort: 'asc' });
    const expectedSorted = ['# A comment', 'A_VAR="first"', '# Z comment', 'Z_VAR="last"'].join(
        '\n',
    );
    assert.equal(sorted, expectedSorted);

    const noComments = formatContent(input, { comments: false });
    const expectedNoComments = ['Z_VAR="last"', '', 'A_VAR="first"'].join('\n');
    assert.equal(noComments, expectedNoComments);
});

test('formatCommand formats file to .formatted by default and in-place with write:true', async () => {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const os = await import('node:os');
    const { formatCommand } = await import('../dist/index.js');

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'envnix-format-test-'));
    try {
        const envPath = path.join(tempDir, '.env');
        await fs.writeFile(envPath, 'NEXT_PUBLIC_BASE_URL=http://localhost:3000\n');

        // Test default (writes to .env.formatted)
        await formatCommand(tempDir, { quiet: true });
        const formattedPath = path.join(tempDir, '.env.formatted');
        const formattedContent = await fs.readFile(formattedPath, 'utf-8');
        assert.equal(formattedContent.trim(), 'NEXT_PUBLIC_BASE_URL="http://localhost:3000"');

        // Test in-place with write: true
        await formatCommand(tempDir, { write: true, quiet: true });
        const inPlaceContent = await fs.readFile(envPath, 'utf-8');
        assert.equal(inPlaceContent.trim(), 'NEXT_PUBLIC_BASE_URL="http://localhost:3000"');

        // Test check mode
        process.exitCode = 0;
        await formatCommand(tempDir, { check: true, quiet: true });
        assert.equal(process.exitCode, 0);
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
});
