import type { HttpTest } from '../../types/roadmap'
import { CodeBlock } from './CodeBlock'

const methodColor: Record<HttpTest['method'], string> = {
  GET: 'text-[#5fc28a] border-[#1d3a2a]',
  POST: 'text-accent-gold border-[#3a2f17]',
  PUT: 'text-accent-blue-soft border-[#2e3b52]',
  PATCH: 'text-accent-purple-soft border-[#2f2750]',
  DELETE: 'text-[#ef8a6a] border-[#46241a]',
  HEAD: 'text-fg-muted border-line-strong',
  OPTIONS: 'text-fg-muted border-line-strong',
}

export function HttpTestCard({ test }: { test: HttpTest }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[11px] font-medium ${methodColor[test.method]}`}>
          {test.method}
        </span>
        <code className="min-w-0 truncate font-mono text-[13px] text-fg">{test.url}</code>
      </div>
      {test.headers && (
        <div className="flex flex-col gap-1 font-mono text-xs text-fg-muted">
          {Object.entries(test.headers).map(([k, v]) => (
            <span key={k}>
              <span className="text-fg-subtle">{k}:</span> {v}
            </span>
          ))}
        </div>
      )}
      {test.body && <CodeBlock sample={{ language: 'json', code: test.body, filename: 'Body · JSON' }} />}
      <p className="text-[13px] leading-relaxed text-fg-muted">
        <span className="font-semibold text-fg">Esperado: </span>
        {test.expected}
      </p>
    </div>
  )
}
