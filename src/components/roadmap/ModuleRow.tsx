import { accentStyles, pad2 } from '../../lib/accent'
import type { Module } from '../../types/roadmap'
import { CARD_GAP, CONNECTOR_WIDTH, blockHeight } from '../../lib/layout'
import { Connectors } from './Connectors'
import { ModuleNode } from './ModuleNode'
import { TopicCard } from './TopicCard'

interface ModuleRowProps {
  module: Module
  onOpenModule: () => void
  onOpenTopic: (topicId: string) => void
}

/**
 * Um módulo no roadmap: conteúdos à esquerda e à direita, ligados ao nó central.
 * No celular vira uma lista vertical, sem conexões.
 */
export function ModuleRow({ module, onOpenModule, onOpenTopic }: ModuleRowProps) {
  const a = accentStyles[module.accent]
  const half = Math.ceil(module.topics.length / 2)
  const left = module.topics.slice(0, half)
  const right = module.topics.slice(half)
  const height = blockHeight(Math.max(left.length, right.length))

  const column = (topics: typeof left) => (
    <div className="flex h-full flex-col justify-center" style={{ gap: CARD_GAP }}>
      {topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} onOpen={() => onOpenTopic(topic.id)} />
      ))}
    </div>
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
        {column(left)}
        <Connectors count={left.length} height={height} side="left" stroke={a.stroke} />
        <div className="relative flex items-center">
          <ModuleNode module={module} onOpen={onOpenModule} className="relative z-10" />
        </div>
        <Connectors count={right.length} height={height} side="right" stroke={a.stroke} />
        {column(right)}
      </div>

      {/* Celular e tablet: lista */}
      <div className="lg:hidden">
        <ModuleNode module={module} onOpen={onOpenModule} />
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">{module.title}</p>
        <div className={`mt-3 ml-3 flex flex-col gap-2 border-l pl-4 ${a.border}`}>
          {module.topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} onOpen={() => onOpenTopic(topic.id)} />
          ))}
        </div>
      </div>
    </section>
  )
}
