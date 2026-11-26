import { ChevronRight } from 'lucide-react'
import type { Topic } from '../../types/roadmap'

interface TopicCardProps {
  topic: Topic
  onOpen: () => void
}

/** Card clicável de um conteúdo. Altura fixa (44px) para o cálculo das conexões. */
export function TopicCard({ topic, onOpen }: TopicCardProps) {
  const ready = Boolean(topic.lesson)
  return (
    <button
      type="button"
      onClick={onOpen}
      title={topic.summary || topic.title}
      className="group flex h-11 w-full items-center gap-3 rounded-md border border-line bg-surface px-3.5 text-left text-sm font-semibold text-fg transition-colors hover:border-line-strong hover:bg-raised"
    >
      <span
        aria-hidden="true"
        className="size-[7px] shrink-0 rounded-full border border-[#6a6a6a]"
      />
      <span className="min-w-0 flex-1 truncate">{topic.title}</span>
      {!ready && <span className="shrink-0 font-mono text-[11px] font-normal text-fg-subtle">em breve</span>}
      <ChevronRight
        aria-hidden="true"
        className="size-4 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
      />
    </button>
  )
}
