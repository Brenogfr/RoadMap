import { Check, ChevronRight } from 'lucide-react'
import { CHECKLIST_SIZE } from '../../lib/progress'
import { topicStatusMeta } from '../../lib/status'
import type { TopicStatus } from '../../types/progress'
import type { Topic } from '../../types/roadmap'
import { StatusDot } from '../ui/StatusDot'

interface TopicCardProps {
  topic: Topic
  status: TopicStatus
  checked: number
  onOpen: () => void
}

/** Card clicável de um conteúdo. Altura fixa (44px) para o cálculo das conexões. */
export function TopicCard({ topic, status, checked, onOpen }: TopicCardProps) {
  const meta = topicStatusMeta[status]
  return (
    <button
      type="button"
      onClick={onOpen}
      title={topic.summary || topic.title}
      aria-label={`${topic.title}: ${meta.label}`}
      className={`group flex h-11 w-full items-center gap-3 rounded-md border bg-surface px-3.5 text-left text-sm font-semibold text-fg transition-colors hover:border-line-strong hover:bg-raised ${
        status === 'em-andamento' ? 'border-[#2e3b52]' : 'border-line'
      }`}
    >
      <StatusDot className={meta.dot} />
      <span className="min-w-0 flex-1 truncate">{topic.title}</span>
      {!topic.lesson && <span className="shrink-0 font-mono text-[11px] font-normal text-fg-subtle">em breve</span>}
      {status === 'em-andamento' && (
        <span className={`shrink-0 font-mono text-xs font-medium ${meta.text}`}>
          {checked}/{CHECKLIST_SIZE}
        </span>
      )}
      {status === 'concluido' && <Check aria-hidden="true" className="size-4 shrink-0 text-ok" />}
      <ChevronRight
        aria-hidden="true"
        className="size-4 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
      />
    </button>
  )
}
