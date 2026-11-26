import { ChevronRight } from 'lucide-react'
import { accentStyles, pad2 } from '../../lib/accent'
import type { Module } from '../../types/roadmap'

interface ModuleNodeProps {
  module: Module
  onOpen: () => void
  className?: string
}

/** Nó numerado do módulo, ponto de encontro das conexões. */
export function ModuleNode({ module, onOpen, className = '' }: ModuleNodeProps) {
  const a = accentStyles[module.accent]
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex h-11 w-full items-center gap-2.5 rounded-md border px-3 transition-colors hover:brightness-125 ${a.border} ${a.nodeBg} ${a.text} ${className}`}
    >
      <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-medium ${a.badge}`}>{pad2(module.number)}</span>
      <span className="min-w-0 flex-1 truncate text-left font-display text-xs font-semibold uppercase tracking-[0.12em]">
        {module.label}
      </span>
      <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
    </button>
  )
}
