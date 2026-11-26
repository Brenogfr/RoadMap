import { Server } from 'lucide-react'

interface RoadmapHeaderProps {
  completedTopics: number
  totalTopics: number
  approvedModules: number
  totalModules: number
}

export function RoadmapHeader({ completedTopics, totalTopics, approvedModules, totalModules }: RoadmapHeaderProps) {
  const percent = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0
  return (
    <header className="flex flex-col items-center gap-8">
      <h1 className="flex flex-col items-center gap-3 text-center sm:flex-row font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px]">
        <Server aria-hidden="true" className="size-8 shrink-0 text-accent-gold" strokeWidth={1.6} />
        Roadmap Back-end Engineering
      </h1>

      <div className="flex w-full flex-col gap-5 rounded-xl border border-line bg-[#070707] p-5 sm:flex-row sm:items-center sm:gap-10 sm:px-6">
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
      </div>
    </header>
  )
}
