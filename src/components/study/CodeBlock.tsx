import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { highlightLines, type TokenKind } from '../../lib/highlight'
import type { CodeSample } from '../../types/roadmap'

const tokenClass: Record<TokenKind, string> = {
  plain: '',
  comment: 'text-[#7d7d7d] italic',
  string: 'text-[#e8b04a]',
  number: 'text-[#7fb0f7]',
  keyword: 'text-[#b39cf5]',
  type: 'text-[#f0f0f0] font-medium',
  fn: 'text-[#9ec3fa]',
  prop: 'text-[#d6d6d6]',
}

const languageLabel: Record<CodeSample['language'], string> = {
  ts: 'TypeScript',
  js: 'JavaScript',
  json: 'JSON',
  bash: 'Terminal',
  http: 'HTTP',
  text: 'Texto',
}

export function CodeBlock({ sample }: { sample: CodeSample }) {
  const [copied, setCopied] = useState(false)
  const lines = highlightLines(sample.code, sample.language)
  const hasNotes = Boolean(sample.lineNotes?.length)
  const numbered = lines.length > 1 && (hasNotes || (sample.language !== 'bash' && sample.language !== 'text'))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sample.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <figure className="overflow-hidden rounded-lg border border-line bg-ink">
      <figcaption className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-2">
        <span className="truncate font-mono text-xs text-fg-muted">{sample.filename ?? languageLabel[sample.language]}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Código copiado' : 'Copiar código'}
          className="flex h-8 items-center gap-1.5 rounded px-2 text-xs text-fg-subtle transition-colors hover:bg-raised hover:text-fg"
        >
          {copied ? <Check aria-hidden="true" className="size-3.5" /> : <Copy aria-hidden="true" className="size-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </figcaption>
      <pre className="overflow-x-auto py-3 font-mono text-[12.5px] leading-[1.7] text-[#c9c9c9]">
        <code className="block min-w-max">
          {lines.map((tokens, i) => (
            <span key={i} className="flex px-3.5">
              {numbered && (
                <span aria-hidden="true" className="mr-4 inline-block w-6 shrink-0 select-none text-right text-[#5c5c5c]">
                  {i + 1}
                </span>
              )}
              <span className="whitespace-pre">
                {tokens.length === 0 ? ' ' : tokens.map((t, j) => <span key={j} className={tokenClass[t.kind]}>{t.text}</span>)}
              </span>
            </span>
          ))}
        </code>
      </pre>
      {sample.lineNotes && sample.lineNotes.length > 0 && (
        <dl className="flex flex-col gap-2 border-t border-line bg-[#060606] px-3.5 py-3 text-[13px] leading-relaxed">
          {sample.lineNotes.map((n) => (
            <div key={n.line + n.note} className="flex gap-3">
              <dt className="w-14 shrink-0 font-mono text-xs leading-[1.6rem] text-accent-blue-soft">L{n.line}</dt>
              <dd className="text-fg-muted">{n.note}</dd>
            </div>
          ))}
        </dl>
      )}
    </figure>
  )
}
