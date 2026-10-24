import { EnvToken, ParseResult } from '../parser/parse.js';

export type QuoteMode = 'always' | 'as-needed' | 'never';
export type QuoteType = 'double' | 'single';

export interface FormatOptions {
    sort?: 'asc' | 'desc' | false;
    comments?: boolean;
    preserveValues?: boolean;
    quoteType?: QuoteType;
    quotes?: QuoteMode;
}

/**
 * Escapes unescaped double quotes inside a string.
 */
export function escapeDoubleQuotes(str: string): string {
    let result = '';
    let backslashCount = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === '\\') {
            backslashCount++;
            result += char;
        } else if (char === '"') {
            if (backslashCount % 2 === 0) {
                // Not escaped, so escape it
                result += '\\"';
            } else {
                // Already escaped
                result += '"';
            }
            backslashCount = 0;
        } else {
            backslashCount = 0;
            result += char;
        }
    }
    return result;
}

/**
 * Escapes unescaped single quotes inside a string.
 */
export function escapeSingleQuotes(str: string): string {
    let result = '';
    let backslashCount = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === '\\') {
            backslashCount++;
            result += char;
        } else if (char === "'") {
            if (backslashCount % 2 === 0) {
                result += "\\'";
            } else {
                result += "'";
            }
            backslashCount = 0;
        } else {
            backslashCount = 0;
            result += char;
        }
    }
    return result;
}

/**
 * Checks if a string value is fully enclosed in double or single quotes.
 */
export function isWrappedInQuotes(val: string): {
    isQuoted: boolean;
    quoteChar?: '"' | "'";
    inner?: string;
} {
    const trimmed = val.trim();
    if (trimmed.length < 2) {
        return { isQuoted: false };
    }

    const firstChar = trimmed[0];
    if (firstChar !== '"' && firstChar !== "'") {
        return { isQuoted: false };
    }

    const quoteChar = firstChar;
    let isEscaped = false;

    for (let i = 1; i < trimmed.length; i++) {
        const char = trimmed[i];

        if (isEscaped) {
            isEscaped = false;
            continue;
        }

        if (char === '\\') {
            isEscaped = true;
            continue;
        }

        if (char === quoteChar) {
            if (i === trimmed.length - 1) {
                return {
                    isQuoted: true,
                    quoteChar,
                    inner: trimmed.substring(1, trimmed.length - 1),
                };
            }
            return { isQuoted: false };
        }
    }

    return { isQuoted: false };
}

/**
 * Formats an environment variable value according to quote settings.
 */
export function formatEnvValue(
    value: string,
    quoteType: QuoteType = 'double',
    quotes: QuoteMode = 'always',
): string {
    const trimmed = value.trim();
    const { isQuoted, quoteChar, inner } = isWrappedInQuotes(trimmed);

    if (quotes === 'never') {
        if (isQuoted && inner !== undefined) {
            return inner;
        }
        return trimmed;
    }

    if (quotes === 'as-needed') {
        const needsQuotes = /[\s#=:"']/.test(trimmed) || trimmed === '';
        if (!needsQuotes) {
            if (isQuoted && inner !== undefined && !/[\s#=:"']/.test(inner)) {
                return inner;
            }
            return trimmed;
        }
    }

    // Default or quotes === 'always' (or quotes === 'as-needed' with needsQuotes=true)
    if (quoteType === 'double') {
        if (isQuoted && quoteChar === '"') {
            return trimmed;
        }

        if (isQuoted && quoteChar === "'") {
            const content = inner ?? '';
            return `"${escapeDoubleQuotes(content)}"`;
        }

        return `"${escapeDoubleQuotes(trimmed)}"`;
    } else {
        if (isQuoted && quoteChar === "'") {
            return trimmed;
        }

        if (isQuoted && quoteChar === '"') {
            const content = inner ?? '';
            return `'${escapeSingleQuotes(content)}'`;
        }

        return `'${escapeSingleQuotes(trimmed)}'`;
    }
}

export function formatEnv(parsed: ParseResult, options: FormatOptions = {}): string {
    let { tokens } = parsed;
    const includeComments = options.comments !== false;

    if (!includeComments) {
        tokens = tokens
            .filter((t) => t.type !== 'Comment')
            .map((t) => {
                if (t.type === 'Variable') {
                    return {
                        ...t,
                        inlineComment: undefined,
                    };
                }
                return t;
            });
        tokens = removeSuccessiveBlankLines(tokens);
    }

    if (!options.sort) {
        return tokens.map((t) => formatToken(t, options)).join('\n');
    }

    // Sorting logic
    // We want to keep comments attached to their variables.
    // We can group tokens into "blocks". A block ends with a Variable.
    interface Block {
        tokens: EnvToken[];
        key: string;
    }

    const blocks: Block[] = [];
    let currentBlock: EnvToken[] = [];

    for (const token of tokens) {
        currentBlock.push(token);
        if (token.type === 'Variable') {
            blocks.push({
                tokens: currentBlock,
                key: token.key,
            });
            currentBlock = [];
        }
    }

    // Any remaining tokens (e.g. trailing comments/blank lines) that didn't end with a variable
    const trailingBlock = currentBlock;

    // Sort blocks that have a key
    blocks.sort((a, b) => {
        const cmp = a.key.localeCompare(b.key);
        return options.sort === 'desc' ? -cmp : cmp;
    });

    let sortedTokens: EnvToken[] = [];
    for (const block of blocks) {
        sortedTokens.push(...block.tokens);
    }
    sortedTokens.push(...trailingBlock);

    // Clean up excessive blank lines that might result from sorting
    sortedTokens = removeSuccessiveBlankLines(sortedTokens);

    return sortedTokens.map((t) => formatToken(t, options)).join('\n');
}

function formatToken(token: EnvToken, options: FormatOptions = {}): string {
    if (token.type === 'BlankLine') {
        return '';
    }
    if (token.type === 'Comment') {
        return token.raw;
    }
    // Variable
    const inline = token.inlineComment ? ` ${token.inlineComment}` : '';
    // Handle `export ` prefix if it existed in raw
    const exportPrefix = token.raw.trim().startsWith('export ') ? 'export ' : '';

    if (!options.preserveValues) {
        return `${exportPrefix}${token.key}=${inline}`;
    }

    const formattedValue = formatEnvValue(
        token.value,
        options.quoteType ?? 'double',
        options.quotes ?? 'always',
    );
    return `${exportPrefix}${token.key}=${formattedValue}${inline}`;
}

function removeSuccessiveBlankLines(tokens: EnvToken[]): EnvToken[] {
    const result: EnvToken[] = [];
    let prevIsBlank = false;

    for (const token of tokens) {
        if (token.type === 'BlankLine') {
            if (prevIsBlank) continue;
            prevIsBlank = true;
        } else {
            prevIsBlank = false;
        }
        result.push(token);
    }

    // Also remove leading blank lines if they exist after sorting
    while (result.length > 0 && result[0].type === 'BlankLine') {
        result.shift();
    }

    return result;
}
