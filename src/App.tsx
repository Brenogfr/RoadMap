import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { RoadmapHeader } from './components/roadmap/RoadmapHeader'
import { Roadmap } from './components/roadmap/Roadmap'
import { Drawer } from './components/ui/Drawer'
import { ModulePanel } from './components/study/ModulePanel'
import { TopicPanel } from './components/study/TopicPanel'
import { modules } from './data'
import { useProgress } from './hooks/useProgress'
import { ASSESSMENT_TITLE_ID, MODULE_TITLE_ID, TOPIC_TITLE_ID } from './lib/layout'
import {
  attemptsOf,
  completedTopicCount,
  isAssessmentUnlocked,
  moduleStatus,
  nextTopic,
  overallProgress,
} from './lib/progress'
import type { Selection } from './types/ui'
import { preloadLessonView, whenIdle } from './lib/prefetch'

// A avaliação só é baixada quando alguém a abre.
const AssessmentPanel = lazy(() =>
  import('./components/assessment/AssessmentPanel').then((m) => ({ default: m.AssessmentPanel })),
)

const topicTitles = new Map(modules.flatMap((m) => m.topics.map((t) => [t.id, t.title] as const)))
const moduleOfTopic = new Map(modules.flatMap((m) => m.topics.map((t) => [t.id, m.id] as const)))

export default function App() {
  const { state: progress, toggleCheck, setLastTopic, addAttempt } = useProgress()
  const [selection, setSelection] = useState<Selection>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setSelection(null), [])

  // Depois que a página carrega, baixa o leitor de aulas (~3 KB gzip) e a próxima aula a estudar.
  useEffect(() => {
    whenIdle(preloadLessonView)
  }, [])

  const moduleIndex = selection ? modules.findIndex((m) => m.id === selection.moduleId) : -1
  const module = moduleIndex >= 0 ? modules[moduleIndex] : undefined
  const topic = selection?.kind === 'topic' ? module?.topics.find((t) => t.id === selection.topicId) : undefined
  const next = nextTopic(progress, modules)
  const nextLoader = next?.topic.loadLesson

  useEffect(() => {
    if (nextLoader) whenIdle(nextLoader)
  }, [nextLoader])

  const openTopic = useCallback((moduleId: string, topicId: string) => {
    setSelection({ kind: 'topic', moduleId, topicId })
  }, [])

  // Lembra o último conteúdo aberto, para "continuar de onde parei".
  useEffect(() => {
    if (selection?.kind === 'topic') setLastTopic(selection.moduleId, selection.topicId)
  }, [selection, setLastTopic])

  // Ao trocar o que está aberto, volta ao topo do painel.
  const selectionKey = selection
    ? selection.kind === 'topic'
      ? selection.topicId
      : `${selection.kind}:${selection.moduleId}:${selection.kind === 'assessment' ? (selection.attemptId ?? '') : ''}`
    : ''
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [selectionKey])

  const titleId = selection?.kind === 'topic' ? TOPIC_TITLE_ID : selection?.kind === 'assessment' ? ASSESSMENT_TITLE_ID : MODULE_TITLE_ID

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

      <Drawer open={Boolean(module)} onClose={close} labelledBy={titleId} scrollRef={scrollRef}>
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
        {module && selection?.kind === 'module' && (
          <ModulePanel
            module={module}
            status={moduleStatus(progress, modules, moduleIndex)}
            completed={completedTopicCount(progress, module)}
            attempts={attemptsOf(progress, module.id)}
            progress={progress}
            onClose={close}
            onOpenTopic={(topicId) => openTopic(module.id, topicId)}
            onOpenAssessment={(attemptId) => setSelection({ kind: 'assessment', moduleId: module.id, attemptId })}
          />
        )}
        {module && selection?.kind === 'assessment' && (
          <Suspense fallback={<p className="p-8 text-sm text-fg-subtle">Carregando avaliação…</p>}>
            <AssessmentPanel
              module={module}
              available={isAssessmentUnlocked(progress, modules, moduleIndex)}
              attempts={attemptsOf(progress, module.id)}
              attemptId={selection.attemptId}
              topicTitle={(id) => topicTitles.get(id) ?? id}
              scrollRef={scrollRef}
              onSubmit={(attempt) => addAttempt(module.id, attempt)}
              // Um id que não existe no histórico remonta o fluxo e começa uma tentativa em branco.
              onRetry={() => setSelection({ kind: 'assessment', moduleId: module.id, attemptId: `nova-${Date.now()}` })}
              onOpenTopic={(topicId) => openTopic(moduleOfTopic.get(topicId) ?? module.id, topicId)}
              onClose={close}
            />
          </Suspense>
        )}
      </Drawer>
    </div>
  )
}
