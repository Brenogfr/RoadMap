import { ArrowUpRight, CircleAlert, CircleCheck, Dumbbell, RotateCcw, Target } from 'lucide-react'
import type { ReactNode } from 'react'
import { categoryLabel, type Feedback } from '../../lib/grading'
import { PASSING_SCORE } from '../../lib/progress'

interface FeedbackReportProps {
  feedback: Feedback
  topicTitle: (topicId: string) => string
  onOpenTopic: (topicId: string) => void
  onRetry?: () => void
}

function Block({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  )
}

function Bullets({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-[14px] text-fg-subtle">{empty}</p>
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[14px] leading-relaxed text-[#cfcfcf]">
          <span aria-hidden="true" className="mt-[9px] size-1 shrink-0 rounded-full bg-fg-subtle" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Resultado de uma tentativa, montado a partir dos critérios confirmados. */
export function FeedbackReport({ feedback, topicTitle, onOpenTopic, onRetry }: FeedbackReportProps) {
  const { score, passed } = feedback
  return (
    <div className="flex flex-col gap-10">
      <div
        className={`flex flex-col gap-3 rounded-xl border p-5 sm:p-6 ${
          passed ? 'border-[#1d3a2a] bg-[#06100a]' : 'border-[#46241a] bg-[#0f0705]'
        }`}
      >
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">Nota geral</span>
          <span className={`font-mono text-sm ${passed ? 'text-ok' : 'text-bad'}`}>{passed ? 'Aprovado' : 'Precisa revisar'}</span>
        </div>
        <p className={`font-display text-5xl font-bold ${passed ? 'text-ok' : 'text-bad'}`}>{score}%</p>
        <p className="text-[14px] leading-relaxed text-fg-muted">
          {passed
            ? `Nota acima de ${PASSING_SCORE}%: o próximo módulo foi liberado. Os pontos abaixo continuam valendo como revisão.`
            : `A aprovação exige ${PASSING_SCORE}%. Revise os conteúdos indicados, faça os exercícios de reforço e tente de novo.`}
        </p>
        <p className="text-[12.5px] text-fg-subtle">
          Correção por critérios definidos: questões de escolha corrigidas automaticamente e questões abertas pelos critérios que você confirmou.
        </p>
      </div>

      <Block icon={<CircleCheck aria-hidden="true" className="size-3.5 text-ok" />} title="Pontos fortes">
        <Bullets items={feedback.strengths} empty="Nenhum critério foi atendido nesta tentativa." />
      </Block>

      <Block icon={<Target aria-hidden="true" className="size-3.5 text-warn" />} title="Conceitos que precisam melhorar">
        <Bullets items={feedback.toImprove} empty="Nenhum. Todos os critérios foram atendidos." />
      </Block>

      <Block icon={<CircleAlert aria-hidden="true" className="size-3.5 text-bad" />} title="Respostas que precisam de atenção">
        {feedback.attention.length === 0 ? (
          <p className="text-[14px] text-fg-subtle">Nenhuma questão ficou abaixo da metade dos pontos.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {feedback.attention.map((r) => (
              <div key={r.question.id} className="flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-4 text-[13.5px] leading-relaxed">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-fg-subtle">
                  Questão {r.index + 1} · {categoryLabel[r.question.category]} · {Math.round(r.fraction * 100)}%
                </span>
                <p className="text-fg">{r.question.prompt}</p>
                <p className="text-fg-muted">
                  <span className="text-fg-subtle">Sua resposta: </span>
                  {r.question.kind === 'choice' ? r.chosenText : r.answer}
                </p>
                <p className="text-fg-muted">
                  <span className="text-fg-subtle">{r.question.kind === 'choice' ? 'Explicação: ' : 'Resposta esperada: '}</span>
                  {r.question.kind === 'choice' ? r.question.explanation : r.question.expectedAnswer}
                </p>
              </div>
            ))}
          </div>
        )}
      </Block>

      <Block icon={<ArrowUpRight aria-hidden="true" className="size-3.5 text-accent-blue-soft" />} title="Conteúdos recomendados para revisão">
        {feedback.reviewTopicIds.length === 0 ? (
          <p className="text-[14px] text-fg-subtle">Nenhum conteúdo pendente de revisão.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {feedback.reviewTopicIds.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onOpenTopic(id)}
                  className="flex min-h-10 items-center gap-1.5 rounded-md border border-[#2e3b52] px-3 text-sm text-accent-blue-soft transition-colors hover:bg-raised"
                >
                  {topicTitle(id)}
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block icon={<Dumbbell aria-hidden="true" className="size-3.5 text-accent-purple-soft" />} title="Exercícios de reforço">
        <Bullets items={feedback.exercises} empty="Nenhum exercício pendente." />
      </Block>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex min-h-11 items-center justify-center gap-2 self-start rounded-lg border border-line-strong px-4 text-sm font-semibold transition-colors hover:bg-raised"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Nova tentativa
        </button>
      )}
    </div>
  )
}
