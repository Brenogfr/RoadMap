import { ArrowRight, Server } from 'lucide-react'
import type { OverallProgress } from '../../lib/progress'
import { legend } from '../../lib/status'
import { StatusDot } from '../ui/StatusDot'

interface RoadmapHeaderProps {
  progress: OverallProgress
  /** Título do próximo conteúdo a estudar, se houver. */
  nextTitle?: string
  /** Já existe algum progresso (itens marcados ou aula aberta). */
  started: boolean
  onContinue: () => void
}

export function RoadmapHeader({ progress, nextTitle, started, onContinue }: RoadmapHeaderProps) {
  const { completedTopics, totalTopics, approvedModules, totalModules } = progress
  const percent = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0

  return (
    <header className="flex flex-col items-center gap-8">
      <h1 className="flex flex-col items-center gap-3 text-center font-display text-3xl font-bold tracking-tight sm:flex-row sm:text-4xl lg:text-[42px]">
        <Server aria-hidden="true" className="size-8 shrink-0 text-accent-gold" strokeWidth={1.6} />
        Roadmap Back-end Engineering
      </h1>

      <div className="flex w-full flex-col gap-5 rounded-xl border border-line bg-[#070707] p-5 lg:flex-row lg:items-center lg:gap-10 lg:px-6">
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="flex justify-between text-[13px]">
            <span className="text-fg-subtle">Progresso geral</span>
            <span className="font-mono text-fg">
              {completedTopics} / {totalTopics} · {percent}%
            </span>
          </div>
          <div
            className="h-1 rounded-full bg-[#1a1a1a]"
            role="progressbar"
            aria-label="Progresso geral"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div className="h-1 rounded-full bg-accent-blue transition-[width]" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="flex gap-10">
          <div className="flex flex-col gap-1 text-[13px]">
            <span className="text-fg-subtle">Módulos aprovados</span>
            <span className="font-mono text-lg">
              {approvedModules} / {totalModules}
            </span>
          </div>
          <div className="flex flex-col gap-1 text-[13px]">
            <span className="text-fg-subtle">Conteúdos pendentes</span>
            <span className="font-mono text-lg">{totalTopics - completedTopics}</span>
          </div>
        </div>
        {nextTitle && (
          <button
            type="button"
            onClick={onContinue}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-fg px-4 text-sm font-semibold text-ink transition-colors hover:bg-white lg:max-w-72"
          >
            <span className="truncate">
              {started ? 'Continuar' : 'Começar'}: {nextTitle}
            </span>
            <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
          </button>
        )}
      </div>

      <ul aria-label="Legenda dos status" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-fg-subtle">
        {legend.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <StatusDot className={item.dot} />
            {item.label}
          </li>
        ))}
      </ul>
    </header>
  )
}
