import { Check, ChevronRight, ClipboardCheck, Lock, X } from 'lucide-react'
import { accentStyles, pad2 } from '../../lib/accent'
import { MODULE_TITLE_ID } from '../../lib/layout'
import { CHECKLIST_SIZE, PASSING_SCORE, checkedCount, topicStatus } from '../../lib/progress'
import { topicStatusMeta } from '../../lib/status'
import type { AttemptRecord, ModuleStatus, ProgressState } from '../../types/progress'
import type { Module } from '../../types/roadmap'
import { ModuleStatusBadge } from '../ui/StatusBadge'
import { StatusDot } from '../ui/StatusDot'

interface ModulePanelProps {
  module: Module
  status: ModuleStatus
  completed: number
  attempts: AttemptRecord[]
  progress: ProgressState
  onClose: () => void
  onOpenTopic: (topicId: string) => void
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

/** Visão geral do módulo: status, conteúdos, avaliação, histórico e exercício/projeto. */
export function ModulePanel({ module, status, completed, attempts, progress, onClose, onOpenTopic }: ModulePanelProps) {
  const a = accentStyles[module.accent]
  const practice = module.practice
  const missing = module.topics.length - completed

  const assessmentText: Record<ModuleStatus, string> = {
    bloqueado: `A avaliação é liberada depois da aprovação no Módulo ${pad2(module.number - 1)}. Você já pode ler os conteúdos e marcar os checklists.`,
    'nao-iniciado': `Conclua os ${module.topics.length} conteúdos (todos os itens do checklist) para liberar a avaliação.`,
    'em-andamento': `Faltam ${missing} conteúdo${missing === 1 ? '' : 's'} para liberar a avaliação.`,
    'aguardando-avaliacao': 'Todos os conteúdos foram concluídos. A avaliação está liberada e será implementada na próxima etapa do projeto.',
    'precisa-revisar': `A última tentativa ficou abaixo de ${PASSING_SCORE}%. Revise os pontos indicados no feedback e tente de novo.`,
    aprovado: 'Módulo aprovado. O próximo módulo foi liberado, e você pode revisitar este quando quiser.',
  }

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 border-b border-line bg-[#070707]/95 px-5 pt-5 pb-5 backdrop-blur sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <span className={`font-mono text-[11px] tracking-[0.1em] uppercase ${a.text}`}>
            Módulo {pad2(module.number)} · {completed} / {module.topics.length} concluídos
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
        <h2 id={MODULE_TITLE_ID} className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {module.title}
        </h2>
        <div className="mt-2">
          <ModuleStatusBadge status={status} />
        </div>
      </div>

      <div className="flex flex-col gap-10 px-5 py-8 sm:px-8">
        <p className="text-[15px] leading-[1.7] text-[#cfcfcf]">{module.description}</p>

        <section aria-labelledby="modulo-conteudos" className="flex flex-col gap-3">
          <h3 id="modulo-conteudos" className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
            Conteúdos, na ordem recomendada
          </h3>
          <ol className="flex flex-col gap-2">
            {module.topics.map((topic, i) => {
              const tStatus = topicStatus(progress, topic)
              const meta = topicStatusMeta[tStatus]
              return (
                <li key={topic.id}>
                  <button
                    type="button"
                    onClick={() => onOpenTopic(topic.id)}
                    aria-label={`${topic.title}: ${meta.label}`}
                    className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-left transition-colors hover:bg-raised"
                  >
                    <span className="w-6 shrink-0 font-mono text-xs text-fg-subtle">{pad2(i + 1)}</span>
                    <StatusDot className={meta.dot} />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-sm font-semibold">{topic.title}</span>
                      <span className="text-[13px] text-fg-subtle">{topic.summary}</span>
                    </span>
                    {tStatus === 'concluido' ? (
                      <Check aria-hidden="true" className="size-4 shrink-0 text-ok" />
                    ) : (
                      tStatus === 'em-andamento' && (
                        <span className={`shrink-0 font-mono text-xs ${meta.text}`}>
                          {checkedCount(progress, topic.id)}/{CHECKLIST_SIZE}
                        </span>
                      )
                    )}
                    <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-fg-subtle" />
                  </button>
                </li>
              )
            })}
          </ol>
        </section>

        <section aria-labelledby="modulo-avaliacao" className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-md bg-[#141414] text-fg-muted">
              {status === 'bloqueado' ? <Lock aria-hidden="true" className="size-4" /> : <ClipboardCheck aria-hidden="true" className="size-4" />}
            </span>
            <h3 id="modulo-avaliacao" className="font-display text-lg font-semibold">
              Avaliação técnica
            </h3>
          </div>
          <p className="text-[14px] leading-relaxed text-[#cfcfcf]">{assessmentText[status]}</p>
          <p className="text-[13px] text-fg-subtle">5 a 8 questões · aprovação com {PASSING_SCORE}% · tentativas ilimitadas</p>

          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <h4 className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">Histórico de tentativas</h4>
            {attempts.length === 0 ? (
              <p className="text-[13px] text-fg-subtle">Nenhuma tentativa ainda.</p>
            ) : (
              <ol className="flex flex-col gap-1.5">
                {[...attempts].reverse().map((attempt, i) => (
                  <li key={attempt.id} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="text-fg-muted">
                      Tentativa {attempts.length - i} · {dateFormat.format(new Date(attempt.finishedAt))}
                    </span>
                    <span className={`font-mono ${attempt.passed ? 'text-ok' : 'text-bad'}`}>
                      {attempt.score}% · {attempt.passed ? 'aprovado' : 'revisar'}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        {practice && (
          <section
            aria-labelledby="modulo-pratica"
            className={`flex flex-col gap-5 rounded-xl border p-5 sm:p-6 ${
              practice.kind === 'project' ? 'border-[#3a2f17] bg-[#0b0905]' : 'border-line bg-surface'
            }`}
          >
            <div className="flex flex-col gap-1">
              <span
                className={`font-display text-[11px] font-semibold uppercase tracking-[0.12em] ${
                  practice.kind === 'project' ? 'text-accent-gold' : 'text-fg-subtle'
                }`}
              >
                {practice.kind === 'project' ? 'Projeto integrado' : 'Exercício prático'}
              </span>
              <h3 id="modulo-pratica" className="font-display text-xl font-semibold">
                {practice.title}
              </h3>
            </div>
            <p className="text-[15px] leading-[1.7] text-[#cfcfcf]">{practice.description}</p>
            <PracticeList title="Requisitos" items={practice.requirements} />
            <PracticeList title="Está pronto quando" items={practice.doneWhen} />
            {practice.hints && <PracticeList title="Dicas" items={practice.hints} />}
          </section>
        )}
      </div>
    </div>
  )
}

function PracticeList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h4 className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">{title}</h4>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[14px] leading-relaxed text-[#cfcfcf]">
            <span aria-hidden="true" className="mt-[9px] size-1 shrink-0 rounded-full bg-fg-subtle" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
