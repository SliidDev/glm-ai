export type TokenType =
  | 'plain'
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'function'
  | 'operator'
  | 'punctuation';

export interface CodeToken {
  text: string;
  type: TokenType;
}

const KEYWORDS = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
  'class', 'import', 'export', 'default', 'from', 'def', 'lambda', 'print',
  'true', 'false', 'null', 'undefined', 'none', 'nil',
  'async', 'await', 'try', 'catch', 'except', 'finally', 'new', 'this', 'self',
  'public', 'private', 'protected', 'static', 'readonly', 'interface', 'type',
  'enum', 'switch', 'case', 'break', 'continue', 'throw', 'extends', 'implements',
  'in', 'of', 'as', 'yield', 'delete', 'typeof', 'instanceof', 'void', 'with',
  'package', 'struct', 'fn', 'impl', 'match', 'use', 'mod', 'pub', 'mut', 'ref',
];
const KEYWORD_SET = new Set(KEYWORDS);

const PUNCTUATION_CHARS = new Set(['{', '}', '(', ')', '[', ']', ';', ':', ',', '.']);

// Order matters: comments and strings are matched first so keyword-
// looking text inside them never gets re-tokenized as a keyword.
const TOKEN_REGEX = new RegExp(
  [
    '(?<comment>//.*|#.*|/\\*[\\s\\S]*?\\*/)',
    '(?<string>"(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)',
    '(?<number>\\b\\d+\\.?\\d*\\b)',
    '(?<identifier>\\b[A-Za-z_$][\\w$]*\\b)',
    '(?<punctuation>[{}()\\[\\];:,.<>=+\\-*/%!&|^~?])',
  ].join('|'),
  'g'
);

export function tokenizeCode(code: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  TOKEN_REGEX.lastIndex = 0;
  while ((match = TOKEN_REGEX.exec(code)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: code.slice(lastIndex, match.index), type: 'plain' });
    }

    const groups = match.groups ?? {};
    const text = match[0];
    const nextChar = code[TOKEN_REGEX.lastIndex] ?? '';

    if (groups.comment) {
      tokens.push({ text, type: 'comment' });
    } else if (groups.string) {
      tokens.push({ text, type: 'string' });
    } else if (groups.number) {
      tokens.push({ text, type: 'number' });
    } else if (groups.identifier) {
      const lower = text.toLowerCase();
      if (KEYWORD_SET.has(lower)) {
        tokens.push({ text, type: 'keyword' });
      } else if (nextChar === '(') {
        tokens.push({ text, type: 'function' });
      } else {
        tokens.push({ text, type: 'plain' });
      }
    } else if (groups.punctuation) {
      tokens.push({ text, type: PUNCTUATION_CHARS.has(text) ? 'punctuation' : 'operator' });
    }

    lastIndex = TOKEN_REGEX.lastIndex;
  }

  if (lastIndex < code.length) {
    tokens.push({ text: code.slice(lastIndex), type: 'plain' });
  }

  return tokens;
}
