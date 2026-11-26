import { accentStyles, pad2 } from '../../lib/accent'
import { CARD_GAP, CONNECTOR_WIDTH, blockHeight } from '../../lib/layout'
import { checkedCount, topicStatus } from '../../lib/progress'
import { moduleStatusMeta } from '../../lib/status'
import type { ModuleStatus, ProgressState } from '../../types/progress'
import type { Module } from '../../types/roadmap'
import { Connectors } from './Connectors'
import { ModuleNode } from './ModuleNode'
import { TopicCard } from './TopicCard'

interface ModuleRowProps {
  module: Module
  status: ModuleStatus
  completed: number
  progress: ProgressState
  onOpenModule: () => void
  onOpenTopic: (topicId: string) => void
}

/**
 * Um módulo no roadmap: conteúdos à esquerda e à direita, ligados ao nó central.
 * No celular vira uma lista vertical, sem conexões.
 */
export function ModuleRow({ module, status, completed, progress, onOpenModule, onOpenTopic }: ModuleRowProps) {
  const a = accentStyles[module.accent]
  const meta = moduleStatusMeta[status]
  const locked = status === 'bloqueado'
  const half = Math.ceil(module.topics.length / 2)
  const left = module.topics.slice(0, half)
  const right = module.topics.slice(half)
  const height = blockHeight(Math.max(left.length, right.length))

  const card = (topic: (typeof module.topics)[number]) => (
    <TopicCard
      key={topic.id}
      topic={topic}
      status={topicStatus(progress, topic)}
      checked={checkedCount(progress, topic.id)}
      onOpen={() => onOpenTopic(topic.id)}
    />
  )

  const statusLine = (
    <span className={`font-mono text-[11px] uppercase tracking-[0.08em] ${meta.text}`}>
      {completed} / {module.topics.length} · {meta.label}
    </span>
  )

  return (
    <section aria-label={`Módulo ${pad2(module.number)}: ${module.title}`}>
      {/* Desktop: árvore com conexões */}
      <div
        className="hidden lg:grid"
        style={{
          height,
          gridTemplateColumns: `minmax(0,1fr) ${CONNECTOR_WIDTH}px 220px ${CONNECTOR_WIDTH}px minmax(0,1fr)`,
        }}
      >
        <div className="flex h-full flex-col justify-center" style={{ gap: CARD_GAP }}>
          {left.map(card)}
        </div>
        <Connectors count={left.length} height={height} side="left" stroke={a.stroke} />
        <div className="relative flex items-center">
          <ModuleNode module={module} locked={locked} onOpen={onOpenModule} className="relative z-10" />
          <div className="absolute inset-x-[-20px] top-1/2 mt-8 flex justify-center bg-ink py-0.5 text-center">{statusLine}</div>
        </div>
        <Connectors count={right.length} height={height} side="right" stroke={a.stroke} />
        <div className="flex h-full flex-col justify-center" style={{ gap: CARD_GAP }}>
          {right.map(card)}
        </div>
      </div>

      {/* Celular e tablet: lista */}
      <div className="lg:hidden">
        <ModuleNode module={module} locked={locked} onOpen={onOpenModule} />
        <div className="mt-3 flex flex-col gap-1">
          <p className="text-sm leading-relaxed text-fg-muted">{module.title}</p>
          {statusLine}
        </div>
        <div className={`mt-3 ml-3 flex flex-col gap-2 border-l pl-4 ${a.border}`}>{module.topics.map(card)}</div>
      </div>
    </section>
  )
}
