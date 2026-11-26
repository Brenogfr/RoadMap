import { ChevronRight, ClipboardCheck, Hammer, Lock, PencilLine } from 'lucide-react'
import { pad2 } from '../../lib/accent'
import { PASSING_SCORE } from '../../lib/progress'
import type { ModuleStatus } from '../../types/progress'
import type { Module } from '../../types/roadmap'

interface ModuleExtrasProps {
  module: Module
  status: ModuleStatus
  completed: number
  bestScore: number | null
  lastScore: number | null
  onOpenModule: () => void
  onOpenAssessment: () => void
}

/** Exercício/projeto do módulo e o card da avaliação técnica, abaixo de cada módulo. */
export function ModuleExtras({ module, status, completed, bestScore, lastScore, onOpenModule, onOpenAssessment }: ModuleExtrasProps) {
  const practice = module.practice
  const isProject = practice?.kind === 'project'
  const missing = module.topics.length - completed

  const assessment = (() => {
    switch (status) {
      case 'bloqueado':
        return {
          tone: 'muted',
          icon: Lock,
          text: `Aprove o Módulo ${pad2(module.number - 1)} para liberar a avaliação`,
        }
      case 'aguardando-avaliacao':
        return { tone: 'warn', icon: ClipboardCheck, text: module.loadAssessment ? 'Avaliação liberada · comece quando quiser' : 'Avaliação liberada · será publicada junto com as aulas' }
      case 'precisa-revisar':
        return { tone: 'bad', icon: ClipboardCheck, text: `Última nota ${lastScore}% · revise os pontos indicados e tente de novo` }
      case 'aprovado':
        return { tone: 'ok', icon: ClipboardCheck, text: `Aprovado com ${bestScore}%` }
      default:
        return {
          tone: 'muted',
          icon: ClipboardCheck,
          text: `Faltam ${missing} de ${module.topics.length} conteúdos · aprovação com ${PASSING_SCORE}%`,
        }
    }
  })()

  const toneClass = {
    muted: 'border-dashed border-line-strong bg-surface text-fg-subtle',
    warn: 'border-[#4a3a17] bg-[#0d0a04] text-warn',
    bad: 'border-[#46241a] bg-[#0f0705] text-bad',
    ok: 'border-[#1d3a2a] bg-[#06100a] text-ok',
  }[assessment.tone]
  const AssessmentIcon = assessment.icon
  const interactive = status === 'aguardando-avaliacao' || status === 'precisa-revisar' || status === 'aprovado'

  const assessmentBody = (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#141414]">
        <AssessmentIcon aria-hidden="true" className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 py-3 text-left">
        <span className="font-display text-[11px] font-semibold uppercase tracking-[0.12em]">
          Avaliação técnica · Módulo {pad2(module.number)}
        </span>
        <span className="text-sm text-fg-muted">{assessment.text}</span>
      </span>
      {interactive && <ChevronRight aria-hidden="true" className="size-4 shrink-0" />}
    </>
  )

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-3">
      {practice && (
        <button
          type="button"
          onClick={onOpenModule}
          className={`flex w-full items-center gap-3.5 rounded-lg border px-4 text-left transition-colors hover:bg-raised ${
            isProject ? 'min-h-[72px] border-[#3a2f17] bg-[#0b0905]' : 'min-h-[60px] border-line bg-surface'
          }`}
        >
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
              isProject ? 'bg-[#1c160a] text-accent-gold' : 'bg-[#141414] text-fg-muted'
            }`}
          >
            {isProject ? <Hammer aria-hidden="true" className="size-4" /> : <PencilLine aria-hidden="true" className="size-4" />}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5 py-3">
            <span
              className={`font-display text-[11px] font-semibold uppercase tracking-[0.12em] ${
                isProject ? 'text-accent-gold' : 'text-fg-subtle'
              }`}
            >
              {isProject ? 'Projeto integrado' : 'Exercício prático'}
            </span>
            <span className="truncate text-sm font-semibold text-fg">{practice.title}</span>
          </span>
          <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-fg-subtle" />
        </button>
      )}

      {interactive ? (
        <button
          type="button"
          onClick={onOpenAssessment}
          className={`flex min-h-[60px] w-full items-center gap-3.5 rounded-lg border px-4 transition-colors hover:brightness-125 ${toneClass}`}
        >
          {assessmentBody}
        </button>
      ) : (
        <div className={`flex min-h-[60px] items-center gap-3.5 rounded-lg border px-4 ${toneClass}`}>{assessmentBody}</div>
      )}
    </div>
  )
}
