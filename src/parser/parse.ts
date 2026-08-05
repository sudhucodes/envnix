export type TokenType = 'BlankLine' | 'Comment' | 'Variable';

export interface TokenBase {
    type: TokenType;
    line: number;
    raw: string;
}

export interface BlankLineToken extends TokenBase {
    type: 'BlankLine';
}

export interface CommentToken extends TokenBase {
    type: 'Comment';
    text: string;
}

export interface VariableToken extends TokenBase {
    type: 'Variable';
    key: string;
    value: string;
    inlineComment?: string;
}

export type EnvToken = BlankLineToken | CommentToken | VariableToken;

export interface ParseResult {
    tokens: EnvToken[];
    variablesCount: number;
    commentsCount: number;
    duplicateKeys: string[];
}

export function parseEnv(content: string): ParseResult {
    const lines = content.split(/\r?\n/);
    const tokens: EnvToken[] = [];
    let variablesCount = 0;
    let commentsCount = 0;

    const keySet = new Set<string>();
    const duplicateKeys: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const trimmed = raw.trim();
        const line = i + 1;

        // Blank line
        if (trimmed === '') {
            tokens.push({ type: 'BlankLine', line, raw });
            continue;
        }

        // Comment line
        if (trimmed.startsWith('#')) {
            tokens.push({ type: 'Comment', line, raw, text: trimmed.substring(1) });
            commentsCount++;
            continue;
        }

        // Variable line
        // Regex matches KEY=VALUE or KEY="VALUE" or export KEY=VALUE
        const match = raw.match(/^(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(.*)?$/);

        if (match) {
            const key = match[1];
            let value = match[2] || '';
            let inlineComment: string | undefined;

            // Extract inline comment if present
            // This is a simplified extraction: assumes # outside quotes is a comment
            const commentIndex = findInlineCommentIndex(value);
            if (commentIndex !== -1) {
                inlineComment = value.substring(commentIndex).trim();
                value = value.substring(0, commentIndex).trim();
            }

            if (keySet.has(key)) {
                duplicateKeys.push(key);
            } else {
                keySet.add(key);
            }

            tokens.push({ type: 'Variable', line, raw, key, value, inlineComment });
            variablesCount++;

            if (inlineComment) {
                commentsCount++;
            }
        } else {
            // If it doesn't match normal var syntax but isn't empty or comment, treat as a raw line,
            // though typically this would be a syntax error. For robustness we can just keep it as a comment-like token or throw.
            // The GOAL says "Invalid env syntax on line X"
            throw new Error(`Invalid env syntax on line ${line}`);
        }
    }

    return {
        tokens,
        variablesCount,
        commentsCount,
        duplicateKeys,
    };
}

/**
 * Finds the index of an inline comment `#` that is not inside quotes.
 */
export function findInlineCommentIndex(val: string): number {
    let inSingleQuotes = false;
    let inDoubleQuotes = false;

    for (let i = 0; i < val.length; i++) {
        const char = val[i];
        if (char === "'" && !inDoubleQuotes) {
            inSingleQuotes = !inSingleQuotes;
        } else if (char === '"' && !inSingleQuotes) {
            // Very basic escape checking
            if (i > 0 && val[i - 1] === '\\') {
                continue;
            }
            inDoubleQuotes = !inDoubleQuotes;
        } else if (char === '#' && !inSingleQuotes && !inDoubleQuotes) {
            return i;
        }
    }
    return -1;
}
