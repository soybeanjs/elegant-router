export type TokenType = 'static' | 'param' | 'group';

export type TokenizerState = 'static' | 'param' | 'paramRegExp' | 'paramRegExpEnd' | 'escapeNext';

interface TokenStatic {
  type: 'static';
  value: string;
}

interface TokenParam {
  type: 'param';
  regexp?: string;
  value: string;
  optional: boolean;
  repeatable: boolean;
}

interface TokenGroup {
  type: 'group';
  value: Exclude<Token, TokenGroup>[];
}

export type Token = TokenStatic | TokenParam | TokenGroup;

const ROOT_TOKEN: Token = {
  type: 'static',
  value: ''
};

const VALID_PARAM_RE = /[a-zA-Z0-9_]/;
// After some profiling, the cache seems to be unnecessary because tokenizePath
// (the slowest part of adding a route) is very fast

// const tokenCache = new Map<string, Token[][]>()

// eslint-disable-next-line complexity
export function tokenizePath(path: string): Array<Token[]> {
  if (!path) return [[]];
  if (path === '/') return [[ROOT_TOKEN]];
  if (!path.startsWith('/')) {
    throw new Error(`Route paths should start with a "/": "${path}" should be "/${path}".`);
  }

  let state: TokenizerState = 'static';
  let previousState: TokenizerState = state;
  const tokens: Array<Token[]> = [];
  // the segment will always be valid because we get into the initial state
  // with the leading /
  let segment!: Token[];

  function finalizeSegment() {
    if (segment) {
      tokens.push(segment);
    }
    segment = [];
  }

  // index on the path
  let i = 0;
  // char at index
  let char: string;
  // buffer of the value read
  let buffer: string = '';
  // custom regexp for a param
  let customRe: string = '';

  function crash(message: string) {
    throw new Error(`ERR (${state})/"${buffer}": ${message}`);
  }

  function consumeBuffer() {
    if (!buffer) return;

    if (state === 'static') {
      segment.push({
        type: 'static',
        value: buffer
      });
    } else if (state === 'param' || state === 'paramRegExp' || state === 'paramRegExpEnd') {
      if (segment.length > 1 && (char === '*' || char === '+'))
        crash(`A repeatable param (${buffer}) must be alone in its segment. eg: '/:ids+.`);
      segment.push({
        type: 'param',
        value: buffer,
        regexp: customRe,
        repeatable: char === '*' || char === '+',
        optional: char === '*' || char === '?'
      });
    } else {
      crash('Invalid state to consume buffer');
    }
    buffer = '';
  }

  function addCharToBuffer() {
    buffer += char;
  }

  while (i < path.length) {
    char = path[i];
    i += 1;

    if (char === '\\' && state !== 'paramRegExp') {
      previousState = state;
      state = 'escapeNext';
      continue;
    }

    switch (state) {
      case 'static':
        if (char === '/') {
          if (buffer) {
            consumeBuffer();
          }
          finalizeSegment();
        } else if (char === ':') {
          consumeBuffer();
          state = 'param';
        } else {
          addCharToBuffer();
        }
        break;

      case 'escapeNext':
        addCharToBuffer();
        state = previousState;
        break;

      case 'param':
        if (char === '(') {
          state = 'paramRegExp';
        } else if (VALID_PARAM_RE.test(char)) {
          addCharToBuffer();
        } else {
          consumeBuffer();
          state = 'static';
          // go back one character if we were not modifying
          if (char !== '*' && char !== '?' && char !== '+') {
            i -= 1;
          }
        }
        break;

      case 'paramRegExp':
        if (char === ')') {
          // handle the escaped )
          if (customRe[customRe.length - 1] === '\\') customRe = customRe.slice(0, -1) + char;
          else state = 'paramRegExpEnd';
        } else {
          customRe += char;
        }
        break;

      case 'paramRegExpEnd':
        // same as finalizing a param
        consumeBuffer();
        state = 'static';
        // go back one character if we were not modifying
        if (char !== '*' && char !== '?' && char !== '+') {
          i -= 1;
        }
        customRe = '';
        break;

      default:
        crash('Unknown state');
        break;
    }
  }

  if (state === 'paramRegExp') {
    crash(`Unfinished custom RegExp for param "${buffer}"`);
  }

  consumeBuffer();
  finalizeSegment();

  return tokens;
}
