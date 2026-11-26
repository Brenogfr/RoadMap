import { attemptsOf, bestScore, completedTopicCount, moduleStatus } from '../../lib/progress'
import type { ProgressState } from '../../types/progress'
import type { Module } from '../../types/roadmap'
import type { Selection } from '../../types/ui'
import { ModuleExtras } from './ModuleExtras'
import { ModuleRow } from './ModuleRow'

interface RoadmapProps {
  modules: Module[]
  progress: ProgressState
  onSelect: (selection: Selection) => void
}

export function Roadmap({ modules, progress, onSelect }: RoadmapProps) {
  return (
    <div className="relative">
      {/* Linha central que atravessa o roadmap */}
      <div aria-hidden="true" className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-line lg:block" />
      <div className="relative flex flex-col gap-14 lg:gap-16">
        {modules.map((module, index) => {
          const status = moduleStatus(progress, modules, index)
          const completed = completedTopicCount(progress, module)
          const attempts = attemptsOf(progress, module.id)
          const openModule = () => onSelect({ kind: 'module', moduleId: module.id })
          return (
            <div key={module.id} className="flex flex-col gap-8 lg:gap-10">
              <ModuleRow
                module={module}
                status={status}
                completed={completed}
                progress={progress}
                onOpenModule={openModule}
                onOpenTopic={(topicId) => onSelect({ kind: 'topic', moduleId: module.id, topicId })}
              />
              <ModuleExtras
                module={module}
                status={status}
                completed={completed}
                bestScore={bestScore(progress, module.id)}
                lastScore={attempts.at(-1)?.score ?? null}
                onOpenModule={openModule}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
