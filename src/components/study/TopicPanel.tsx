import { ArrowUp, ChevronLeft, ChevronRight, ListChecks, LoaderCircle, X } from 'lucide-react'
import { lazy, Suspense, useEffect, type RefObject } from 'react'
import { whenIdle } from '../../lib/prefetch'
import { useLazy } from '../../hooks/useLazy'
import { useReadingPosition } from '../../hooks/useReadingPosition'
import { accentStyles, pad2 } from '../../lib/accent'
import { CHECKLIST_SIZE } from '../../lib/progress'
import type { ChecklistItemId } from '../../types/progress'
import type { Module, Topic } from '../../types/roadmap'
import { Checklist } from './Checklist'
import { LESSON_SECTIONS, TOPIC_TITLE_ID, sectionDomId } from '../../lib/layout'

// O renderizador da aula (e o realce de código) só é baixado ao abrir a primeira aula.
const LessonView = lazy(() => import('./LessonView').then((m) => ({ default: m.LessonView })))

interface TopicPanelProps {
  module: Module
  topic: Topic
  onClose: () => void
  onNavigate: (topicId: string) => void
  checked: ChecklistItemId[]
  onToggle: (itemId: ChecklistItemId) => void
  scrollRef: RefObject<HTMLDivElement | null>
}

export function TopicPanel({ module, topic, onClose, onNavigate, scrollRef, checked, onToggle }: TopicPanelProps) {
  const a = accentStyles[module.accent]
  const index = module.topics.findIndex((t) => t.id === topic.id)
  const prev = module.topics[index - 1]
  const next = module.topics[index + 1]

  const scrollTo = (domId: string) => {
    scrollRef.current?.querySelector<HTMLElement>(`#${domId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const done = checked.length >= CHECKLIST_SIZE
  const lesson = useLazy(topic.id, topic.loadLesson)
  const { resumed, backToTop } = useReadingPosition(topic.id, lesson.status === 'ready', scrollRef)

  // Enquanto a pessoa lê, a próxima aula é baixada em segundo plano.
  useEffect(() => {
    if (next?.loadLesson) whenIdle(next.loadLesson)
  }, [next])

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 border-b border-line bg-[#070707] px-5 pt-5 pb-4 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <span className={`truncate font-mono text-[11px] tracking-[0.1em] uppercase ${a.text}`}>
            {pad2(module.number)} {module.label} · Conteúdo {index + 1} de {module.topics.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line text-fg-muted transition-colors hover:bg-raised hover:text-fg"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        <h2 id={TOPIC_TITLE_ID} className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {topic.title}
        </h2>
        {topic.loadLesson && (
          <nav aria-label="Seções da aula" className="mt-4 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
            {resumed && (
              <button
                type="button"
                onClick={backToTop}
                title="Você continuou de onde parou. Clique para voltar ao início da aula."
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-[#2e3b52] bg-[#060a11] px-2.5 py-1.5 text-xs whitespace-nowrap text-accent-blue-soft transition-colors hover:text-fg"
              >
                <ArrowUp aria-hidden="true" className="size-3.5" />
                Continuando · voltar ao início
              </button>
            )}
            {LESSON_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(sectionDomId(s.id))}
                className="shrink-0 rounded-md border border-line px-2.5 py-1.5 text-xs whitespace-nowrap text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
              >
                <span className="font-mono text-fg-subtle">{s.letter}</span> · {s.short}
              </button>
            ))}
            <button
              type="button"
              onClick={() => scrollTo('checklist')}
              className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs whitespace-nowrap transition-colors hover:text-fg ${
                done ? 'border-[#1d3a2a] text-ok' : 'border-[#2e3b52] text-accent-blue-soft'
              }`}
            >
              <ListChecks aria-hidden="true" className="size-3.5" />
              Checklist {checked.length}/{CHECKLIST_SIZE}
            </button>
          </nav>
        )}
      </div>

      <div className="flex-1 px-5 py-8 sm:px-8">
        {lesson.status === 'ready' && (
          <Suspense fallback={<p className="text-sm text-fg-subtle">Carregando aula…</p>}>
            <LessonView lesson={lesson.data} />
          </Suspense>
        )}
        {lesson.status === 'loading' && (
          <p role="status" className="flex items-center gap-2 text-sm text-fg-subtle">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Carregando aula…
          </p>
        )}
        {lesson.status === 'error' && (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-[#46241a] p-5 text-sm text-fg-muted">
            Não foi possível carregar a aula. Verifique a conexão e tente de novo.
            <button
              type="button"
              onClick={lesson.retry}
              className="min-h-10 rounded-md border border-line-strong px-3 text-fg transition-colors hover:bg-raised"
            >
              Tentar de novo
            </button>
          </div>
        )}
        {lesson.status === 'none' && (
          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-line-strong p-6">
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
              Aula em preparação
            </span>
            <p className="text-[15px] leading-relaxed text-[#cfcfcf]">{topic.summary}</p>
            <p className="text-sm leading-relaxed text-fg-subtle">
              O conteúdo completo deste módulo será adicionado no próximo lote. A estrutura e a ordem já estão definidas.
            </p>
          </div>
        )}
        <div className="mt-14">
          <Checklist checked={checked} onToggle={onToggle} disabled={!topic.loadLesson} />
        </div>
      </div>

      <nav aria-label="Navegação entre conteúdos" className="grid grid-cols-2 gap-3 border-t border-line px-5 py-5 sm:px-8">
        {prev ? (
          <button
            type="button"
            onClick={() => onNavigate(prev.id)}
            className="flex min-h-14 items-center gap-2 rounded-lg border border-line px-3 text-left transition-colors hover:bg-raised"
          >
            <ChevronLeft aria-hidden="true" className="size-4 shrink-0 text-fg-subtle" />
            <span className="flex min-w-0 flex-col">
              <span className="text-[11px] text-fg-subtle">Anterior</span>
              <span className="truncate text-sm font-semibold">{prev.title}</span>
            </span>
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button
            type="button"
            onClick={() => onNavigate(next.id)}
            className="flex min-h-14 items-center justify-end gap-2 rounded-lg border border-line px-3 text-right transition-colors hover:bg-raised"
          >
            <span className="flex min-w-0 flex-col">
              <span className="text-[11px] text-fg-subtle">Próximo</span>
              <span className="truncate text-sm font-semibold">{next.title}</span>
            </span>
            <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-fg-subtle" />
          </button>
        )}
      </nav>
    </div>
  )
}
