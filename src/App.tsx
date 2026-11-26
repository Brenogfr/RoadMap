import { useCallback, useEffect, useRef, useState } from 'react'
import { RoadmapHeader } from './components/roadmap/RoadmapHeader'
import { Roadmap } from './components/roadmap/Roadmap'
import { Drawer } from './components/ui/Drawer'
import { ModulePanel } from './components/study/ModulePanel'
import { TopicPanel } from './components/study/TopicPanel'
import { MODULE_TITLE_ID, TOPIC_TITLE_ID } from './lib/layout'
import { modules, totalTopics } from './data'
import type { Selection } from './types/ui'

export default function App() {
  const [selection, setSelection] = useState<Selection>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setSelection(null), [])

  const module = selection ? modules.find((m) => m.id === selection.moduleId) : undefined
  const topic = selection?.kind === 'topic' ? module?.topics.find((t) => t.id === selection.topicId) : undefined

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
          completedTopics={0}
          totalTopics={totalTopics}
          approvedModules={0}
          totalModules={modules.length}
        />
        <Roadmap modules={modules} onSelect={setSelection} />
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
            onNavigate={(topicId) => setSelection({ kind: 'topic', moduleId: module.id, topicId })}
          />
        )}
        {module && !topic && (
          <ModulePanel
            module={module}
            onClose={close}
            onOpenTopic={(topicId) => setSelection({ kind: 'topic', moduleId: module.id, topicId })}
          />
        )}
      </Drawer>
    </div>
  )
}
