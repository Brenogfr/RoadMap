import type { CodeLanguage } from '../types/roadmap'

/**
 * Realce de sintaxe mínimo, sem dependências.
 * Não é um parser: reconhece comentários, strings, números, palavras-chave,
 * tipos (identificadores com inicial maiúscula) e chamadas de função.
 */

export type TokenKind = 'plain' | 'comment' | 'string' | 'number' | 'keyword' | 'type' | 'fn' | 'prop'

export interface Token {
  kind: TokenKind
  text: string
}

const KEYWORDS = new Set([
  'import', 'from', 'export', 'default', 'const', 'let', 'var', 'function', 'return', 'if', 'else',
  'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'class', 'extends', 'super',
  'this', 'typeof', 'instanceof', 'in', 'of', 'async', 'await', 'try', 'catch', 'finally', 'throw',
  'type', 'interface', 'implements', 'readonly', 'private', 'public', 'protected', 'static', 'as',
  'enum', 'void', 'null', 'undefined', 'true', 'false', 'yield', 'delete', 'satisfies', 'keyof',
  'string', 'number', 'boolean', 'unknown', 'never', 'any', 'object', 'declare',
])

const JS_PATTERN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\[\s\S]|[^`\\])*`)|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g

const JSON_PATTERN = /("(?:\\.|[^"\\\n])*"(?=\s*:))|("(?:\\.|[^"\\\n])*")|(-?\b\d+(?:\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)/g

const BASH_PATTERN = /(#[^\n]*)|('(?:[^'\n])*'|"(?:\\.|[^"\\\n])*")|(^|\s)(npm|npx|node|curl|cd|mkdir|openssl|touch)(?=\s)/gm

const HTTP_PATTERN = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|HTTP\/[\d.]+)(?=\s)|^([\w-]+)(?=:)|(\b\d{3}\b)/gm

function tokenizeJs(code: string): Token[] {
  const out: Token[] = []
  let last = 0
  for (const m of code.matchAll(JS_PATTERN)) {
    const i = m.index ?? 0
    if (i > last) out.push({ kind: 'plain', text: code.slice(last, i) })
    const [text, comment, str, num, ident] = m
    if (comment) out.push({ kind: 'comment', text })
    else if (str) out.push({ kind: 'string', text })
    else if (num) out.push({ kind: 'number', text })
    else if (ident) {
      const next = code.slice(i + text.length).match(/^\s*(.)/)?.[1]
      const prev = code.slice(0, i).trimEnd().slice(-1)
      if (KEYWORDS.has(ident)) out.push({ kind: 'keyword', text })
      else if (/^[A-Z]/.test(ident)) out.push({ kind: 'type', text })
      else if (next === '(') out.push({ kind: 'fn', text })
      else if (prev === '.') out.push({ kind: 'prop', text })
      else out.push({ kind: 'plain', text })
    }
    last = i + text.length
  }
  if (last < code.length) out.push({ kind: 'plain', text: code.slice(last) })
  return out
}

function tokenizeWith(code: string, pattern: RegExp, kinds: (TokenKind | null)[]): Token[] {
  const out: Token[] = []
  let last = 0
  for (const m of code.matchAll(pattern)) {
    const i = m.index ?? 0
    if (i > last) out.push({ kind: 'plain', text: code.slice(last, i) })
    let consumed = 0
    for (let g = 1; g < m.length; g++) {
      const part = m[g]
      if (part === undefined) continue
      out.push({ kind: kinds[g - 1] ?? 'plain', text: part })
      consumed += part.length
    }
    if (consumed === 0) out.push({ kind: 'plain', text: m[0] })
    last = i + m[0].length
  }
  if (last < code.length) out.push({ kind: 'plain', text: code.slice(last) })
  return out
}

function tokenize(code: string, language: CodeLanguage): Token[] {
  switch (language) {
    case 'ts':
    case 'js':
      return tokenizeJs(code)
    case 'json':
      return tokenizeWith(code, JSON_PATTERN, ['prop', 'string', 'number', 'keyword'])
    case 'bash':
      return tokenizeWith(code, BASH_PATTERN, ['comment', 'string', null, 'fn'])
    case 'http':
      return tokenizeWith(code, HTTP_PATTERN, ['keyword', 'prop', 'number'])
    default:
      return [{ kind: 'plain', text: code }]
  }
}

/** Divide os tokens em linhas, quebrando tokens que atravessam linhas. */
export function highlightLines(code: string, language: CodeLanguage): Token[][] {
  const lines: Token[][] = [[]]
  for (const token of tokenize(code, language)) {
    const parts = token.text.split('\n')
    parts.forEach((part, idx) => {
      if (idx > 0) lines.push([])
      if (part) lines[lines.length - 1].push({ kind: token.kind, text: part })
    })
  }
  return lines
}
