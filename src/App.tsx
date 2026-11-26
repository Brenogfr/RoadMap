import { useCallback, useEffect, useRef, useState } from 'react'
import { RoadmapHeader } from './components/roadmap/RoadmapHeader'
import { Roadmap } from './components/roadmap/Roadmap'
import { Drawer } from './components/ui/Drawer'
import { ModulePanel } from './components/study/ModulePanel'
import { TopicPanel } from './components/study/TopicPanel'
import { modules } from './data'
import { useProgress } from './hooks/useProgress'
import { MODULE_TITLE_ID, TOPIC_TITLE_ID } from './lib/layout'
import { attemptsOf, completedTopicCount, moduleStatus, nextTopic, overallProgress } from './lib/progress'
import type { Selection } from './types/ui'

export default function App() {
  const { state: progress, toggleCheck, setLastTopic } = useProgress()
  const [selection, setSelection] = useState<Selection>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setSelection(null), [])

  const moduleIndex = selection ? modules.findIndex((m) => m.id === selection.moduleId) : -1
  const module = moduleIndex >= 0 ? modules[moduleIndex] : undefined
  const topic = selection?.kind === 'topic' ? module?.topics.find((t) => t.id === selection.topicId) : undefined
  const next = nextTopic(progress, modules)

  const openTopic = useCallback((moduleId: string, topicId: string) => {
    setSelection({ kind: 'topic', moduleId, topicId })
  }, [])

  // Lembra o último conteúdo aberto, para "continuar de onde parei".
  useEffect(() => {
    if (selection?.kind === 'topic') setLastTopic(selection.moduleId, selection.topicId)
  }, [selection, setLastTopic])

  // Ao trocar de conteúdo, volta ao topo do painel.
  const selectionKey = selection ? (selection.kind === 'topic' ? selection.topicId : selection.moduleId) : ''
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [selectionKey])

  return (
    <div className="min-h-screen bg-ink">
      <main
        inert={Boolean(module)}
        className="mx-auto flex w-full max-w-[1280px] flex-col gap-14 px-4 pt-12 pb-24 sm:px-8 lg:gap-16 lg:pt-16"
      >
        <RoadmapHeader
          progress={overallProgress(progress, modules)}
          nextTitle={next?.topic.title}
          started={Boolean(progress.lastTopic) || Object.keys(progress.checklists).length > 0}
          onContinue={() => next && openTopic(next.module.id, next.topic.id)}
        />
        <Roadmap modules={modules} progress={progress} onSelect={setSelection} />
      </main>

      <Drawer
        open={Boolean(module)}
        onClose={close}
        labelledBy={topic ? TOPIC_TITLE_ID : MODULE_TITLE_ID}
        scrollRef={scrollRef}
      >
        {module && topic && (
          <TopicPanel
            module={module}
            topic={topic}
            onClose={close}
            scrollRef={scrollRef}
            onNavigate={(topicId) => openTopic(module.id, topicId)}
            checked={progress.checklists[topic.id] ?? []}
            onToggle={(itemId) => toggleCheck(topic.id, itemId)}
          />
        )}
        {module && !topic && (
          <ModulePanel
            module={module}
            status={moduleStatus(progress, modules, moduleIndex)}
            completed={completedTopicCount(progress, module)}
            attempts={attemptsOf(progress, module.id)}
            progress={progress}
            onClose={close}
            onOpenTopic={(topicId) => openTopic(module.id, topicId)}
          />
        )}
      </Drawer>
    </div>
  )
}
