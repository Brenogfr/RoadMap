import { ChevronRight, ClipboardCheck, Hammer, PencilLine } from 'lucide-react'
import { pad2 } from '../../lib/accent'
import type { Module } from '../../types/roadmap'

interface ModuleExtrasProps {
  module: Module
  onOpenPractice: () => void
}

/** Exercício/projeto do módulo e a avaliação técnica, abaixo de cada módulo. */
export function ModuleExtras({ module, onOpenPractice }: ModuleExtrasProps) {
  const practice = module.practice
  const isProject = practice?.kind === 'project'

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-3">
      {practice && (
        <button
          type="button"
          onClick={onOpenPractice}
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

      <div className="flex min-h-[60px] items-center gap-3.5 rounded-lg border border-dashed border-line-strong bg-surface px-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#141414] text-fg-subtle">
          <ClipboardCheck aria-hidden="true" className="size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 py-3">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
            Avaliação técnica · Módulo {pad2(module.number)}
          </span>
          <span className="text-sm text-fg-muted">
            Libera ao concluir os {module.topics.length} conteúdos · aprovação com 70%
          </span>
        </span>
      </div>
    </div>
  )
}
