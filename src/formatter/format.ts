import { EnvToken, ParseResult } from '../parser/parse.js';

export interface FormatOptions {
    sort?: 'asc' | 'desc' | false;
    comments?: boolean;
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
        return tokens.map(formatToken).join('\n');
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

    return sortedTokens.map(formatToken).join('\n');
}

function formatToken(token: EnvToken): string {
    if (token.type === 'BlankLine') {
        return '';
    }
    if (token.type === 'Comment') {
        return token.raw;
    }
    // Variable
    const inline = token.inlineComment ? ` ${token.inlineComment}` : '';
    // Reconstruct keeping only the key
    // Handle `export ` prefix if it existed in raw
    const exportPrefix = token.raw.trim().startsWith('export ') ? 'export ' : '';
    return `${exportPrefix}${token.key}=${inline}`;
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
