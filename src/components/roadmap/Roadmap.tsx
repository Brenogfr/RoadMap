import type { Module } from '../../types/roadmap'
import type { Selection } from '../../types/ui'
import { ModuleExtras } from './ModuleExtras'
import { ModuleRow } from './ModuleRow'

interface RoadmapProps {
  modules: Module[]
  onSelect: (selection: Selection) => void
}

export function Roadmap({ modules, onSelect }: RoadmapProps) {
  return (
    <div className="relative">
      {/* Linha central que atravessa o roadmap */}
      <div aria-hidden="true" className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-line lg:block" />
      <div className="relative flex flex-col gap-14 lg:gap-16">
        {modules.map((module) => (
          <div key={module.id} className="flex flex-col gap-8 lg:gap-10">
            <ModuleRow
              module={module}
              onOpenModule={() => onSelect({ kind: 'module', moduleId: module.id })}
              onOpenTopic={(topicId) => onSelect({ kind: 'topic', moduleId: module.id, topicId })}
            />
            <ModuleExtras module={module} onOpenPractice={() => onSelect({ kind: 'module', moduleId: module.id })} />
          </div>
        ))}
      </div>
    </div>
  )
}
