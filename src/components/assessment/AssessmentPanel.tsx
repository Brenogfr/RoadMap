import { Check, Lightbulb, LoaderCircle, X } from 'lucide-react'
import { useEffect, useMemo, useState, type RefObject } from 'react'
import { useLazy } from '../../hooks/useLazy'
import { accentStyles, pad2 } from '../../lib/accent'
import { buildFeedback, categoryLabel, flaggedCriteria, scoreOf } from '../../lib/grading'
import { ASSESSMENT_TITLE_ID } from '../../lib/layout'
import type { Assessment, Question } from '../../types/assessment'
import type { AttemptRecord } from '../../types/progress'
import type { Module } from '../../types/roadmap'
import { CodeBlock } from '../study/CodeBlock'
import { FeedbackReport } from './FeedbackReport'

interface AssessmentPanelProps {
  module: Module
  /** A avaliação pode ser feita agora (conteúdos concluídos e módulo liberado). */
  available: boolean
  attempts: AttemptRecord[]
  /** Quando presente, mostra o feedback dessa tentativa em vez de uma nova. */
  attemptId?: string
  topicTitle: (topicId: string) => string
  scrollRef: RefObject<HTMLDivElement | null>
  onSubmit: (attempt: AttemptRecord) => void
  onRetry: () => void
  onOpenTopic: (topicId: string) => void
  onClose: () => void
}

type Step = 'responder' | 'corrigir' | 'resultado'

const STEPS: { id: Step; label: string }[] = [
  { id: 'responder', label: 'Responder' },
  { id: 'corrigir', label: 'Corrigir' },
  { id: 'resultado', label: 'Resultado' },
]

const draftKey = (moduleId: string) => `roadmap-backend:rascunho:${moduleId}`

function loadDraft(moduleId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(draftKey(moduleId))
    const data: unknown = raw ? JSON.parse(raw) : {}
    return typeof data === 'object' && data !== null ? (data as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function saveDraft(moduleId: string, answers: Record<string, string> | null) {
  try {
    if (answers) localStorage.setItem(draftKey(moduleId), JSON.stringify(answers))
    else localStorage.removeItem(draftKey(moduleId))
  } catch {
    // Sem armazenamento: o rascunho vale só enquanto o painel estiver aberto.
  }
}

const MIN_OPEN_LENGTH = 30

const isAnswered = (q: Question, answer: string | undefined) =>
  q.kind === 'choice' ? Boolean(answer) : (answer?.trim().length ?? 0) >= MIN_OPEN_LENGTH

export function AssessmentPanel(props: AssessmentPanelProps) {
  const { module, attemptId, scrollRef, onClose } = props
  const a = accentStyles[module.accent]
  const data = useLazy(`${module.id}:avaliacao`, module.loadAssessment)

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 border-b border-line bg-[#070707] px-5 pt-5 pb-5 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <span className={`font-mono text-[11px] tracking-[0.1em] uppercase ${a.text}`}>
            Avaliação técnica · Módulo {pad2(module.number)}
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
        <h2 id={ASSESSMENT_TITLE_ID} className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {module.title}
        </h2>
      </div>

      <div className="px-5 py-8 sm:px-8">
        {data.status === 'loading' && (
          <p role="status" className="flex items-center gap-2 text-sm text-fg-subtle">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Carregando avaliação…
          </p>
        )}
        {data.status === 'error' && (
          <div role="alert" className="flex flex-col items-start gap-3 text-sm text-fg-muted">
            Não foi possível carregar a avaliação.
            <button type="button" onClick={data.retry} className="min-h-10 rounded-md border border-line-strong px-3 text-fg hover:bg-raised">
              Tentar de novo
            </button>
          </div>
        )}
        {data.status === 'none' && (
          <p className="text-[15px] leading-relaxed text-fg-muted">A avaliação deste módulo será publicada junto com as aulas.</p>
        )}
        {data.status === 'ready' && (
          <AssessmentFlow key={attemptId ?? 'nova'} {...props} assessment={data.data} scrollToTop={() => scrollRef.current?.scrollTo({ top: 0 })} />
        )}
      </div>
    </div>
  )
}

function AssessmentFlow({
  module,
  available,
  attempts,
  attemptId,
  assessment,
  topicTitle,
  scrollToTop,
  onSubmit,
  onRetry,
  onOpenTopic,
}: AssessmentPanelProps & { assessment: Assessment; scrollToTop: () => void }) {
  const viewing = attemptId ? attempts.find((t) => t.id === attemptId) : undefined
  const [step, setStep] = useState<Step>(viewing ? 'resultado' : 'responder')
  const [answers, setAnswers] = useState<Record<string, string>>(() => (viewing ? viewing.answers : loadDraft(module.id)))
  const [criteriaMet, setCriteriaMet] = useState<Record<string, string[]>>(() => viewing?.criteriaMet ?? {})
  const [submitted, setSubmitted] = useState<AttemptRecord | undefined>(viewing)

  useEffect(() => {
    if (!viewing && step === 'responder') saveDraft(module.id, answers)
  }, [answers, module.id, step, viewing])

  const answeredCount = assessment.questions.filter((q) => isAnswered(q, answers[q.id])).length
  const allAnswered = answeredCount === assessment.questions.length
  const feedback = useMemo(() => (submitted ? buildFeedback(assessment, submitted) : null), [assessment, submitted])

  if (!viewing && !available) {
    return (
      <p className="text-[15px] leading-relaxed text-fg-muted">
        A avaliação é liberada quando todos os conteúdos do módulo estiverem concluídos e o módulo anterior tiver sido aprovado.
      </p>
    )
  }

  const goTo = (next: Step) => {
    setStep(next)
    scrollToTop()
  }

  const startReview = () => {
    // Passo 2: as palavras-chave sinalizam critérios prováveis. Nada é marcado automaticamente.
    setCriteriaMet({})
    goTo('corrigir')
  }

  const finish = () => {
    const { score, passed } = scoreOf(assessment, answers, criteriaMet)
    const attempt: AttemptRecord = {
      id: `${module.id}-${Date.now()}`,
      finishedAt: new Date().toISOString(),
      score,
      passed,
      answers,
      criteriaMet,
    }
    onSubmit(attempt)
    saveDraft(module.id, null)
    setSubmitted(attempt)
    goTo('resultado')
  }

  const toggleCriterion = (questionId: string, criterionId: string) =>
    setCriteriaMet((prev) => {
      const current = prev[questionId] ?? []
      return {
        ...prev,
        [questionId]: current.includes(criterionId) ? current.filter((c) => c !== criterionId) : [...current, criterionId],
      }
    })

  return (
    <div className="flex flex-col gap-8">
      <ol aria-label="Etapas da avaliação" className="flex gap-2">
        {STEPS.map((s, i) => {
          const current = s.id === step
          const done = STEPS.findIndex((x) => x.id === step) > i
          return (
            <li
              key={s.id}
              aria-current={current ? 'step' : undefined}
              className={`flex flex-1 items-center gap-2 rounded-md border px-3 py-2 text-xs ${
                current ? 'border-line-strong text-fg' : done ? 'border-line text-ok' : 'border-line text-fg-subtle'
              }`}
            >
              <span className="font-mono">{done ? <Check aria-hidden="true" className="size-3.5" /> : i + 1}</span>
              {s.label}
            </li>
          )
        })}
      </ol>

      {step === 'responder' && (
        <>
          <p className="text-[14px] leading-relaxed text-fg-muted">
            {assessment.questions.length} questões. Nas abertas, explique com suas palavras: o que acontece, por quê e o que você faria. O rascunho
            fica salvo neste navegador até você enviar.
          </p>
          {assessment.questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              answer={answers[q.id] ?? ''}
              onChange={(value) => setAnswers((prev) => ({ ...prev, [q.id]: value }))}
            />
          ))}
          <div className="flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-fg-subtle">
              {answeredCount} de {assessment.questions.length} respondidas
              {!allAnswered && ` · respostas abertas com pelo menos ${MIN_OPEN_LENGTH} caracteres`}
            </span>
            <button
              type="button"
              onClick={startReview}
              disabled={!allAnswered}
              className="min-h-11 rounded-lg bg-fg px-5 text-sm font-semibold text-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-[#2a2a2a] disabled:text-fg-subtle"
            >
              Enviar e corrigir
            </button>
          </div>
        </>
      )}

      {step === 'corrigir' && (
        <>
          <div className="flex gap-3 rounded-lg border border-[#2f2750] bg-[#0b0915] p-4 text-[13.5px] leading-relaxed text-[#cfcfcf]">
            <Lightbulb aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-purple-soft" />
            <p>
              As questões de escolha já foram corrigidas. Nas abertas, compare sua resposta com a esperada e marque só os critérios que você
              realmente atendeu. O selo “termo encontrado” indica apenas que uma palavra-chave apareceu no seu texto: não significa que o critério
              foi cumprido.
            </p>
          </div>
          {assessment.questions.map((q, i) => (
            <ReviewCard
              key={q.id}
              question={q}
              index={i}
              answer={answers[q.id] ?? ''}
              met={criteriaMet[q.id] ?? []}
              onToggle={(criterionId) => toggleCriterion(q.id, criterionId)}
            />
          ))}
          <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => goTo('responder')}
              className="min-h-11 rounded-lg border border-line-strong px-5 text-sm transition-colors hover:bg-raised"
            >
              Voltar às respostas
            </button>
            <button
              type="button"
              onClick={finish}
              className="min-h-11 rounded-lg bg-fg px-5 text-sm font-semibold text-ink transition-colors hover:bg-white"
            >
              Ver resultado
            </button>
          </div>
        </>
      )}

      {step === 'resultado' && feedback && (
        <FeedbackReport feedback={feedback} topicTitle={topicTitle} onOpenTopic={onOpenTopic} onRetry={available ? onRetry : undefined} />
      )}
    </div>
  )
}

function QuestionHeader({ question, index }: { question: Question; index: number }) {
  return (
    <>
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-fg-subtle">
        Questão {index + 1} · {categoryLabel[question.category]}
      </span>
      <p className="text-[15px] leading-relaxed text-fg">{question.prompt}</p>
      {question.code && <CodeBlock sample={question.code} />}
    </>
  )
}

function QuestionCard({
  question,
  index,
  answer,
  onChange,
}: {
  question: Question
  index: number
  answer: string
  onChange: (value: string) => void
}) {
  const fieldId = `resposta-${question.id}`
  return (
    <fieldset className="flex min-w-0 flex-col gap-4 rounded-xl border border-line bg-surface p-5">
      <legend className="sr-only">Questão {index + 1}</legend>
      <QuestionHeader question={question} index={index} />
      {question.kind === 'choice' ? (
        <div className="flex flex-col gap-2">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-[14px] leading-relaxed transition-colors hover:bg-raised ${
                answer === option.id ? 'border-accent-blue text-fg' : 'border-line text-fg-muted'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={answer === option.id}
                onChange={() => onChange(option.id)}
                className="mt-1 accent-[#5b9cf5]"
              />
              {option.text}
            </label>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label htmlFor={fieldId} className="text-sm text-fg-subtle">
            Sua resposta
          </label>
          <textarea
            id={fieldId}
            value={answer}
            onChange={(e) => onChange(e.target.value)}
            rows={5}
            className="w-full resize-y rounded-md border border-line-strong bg-ink p-3 text-[14px] leading-relaxed text-fg outline-none focus:border-accent-blue"
          />
          <span className="text-right font-mono text-[11px] text-fg-subtle">{answer.trim().length} caracteres</span>
        </div>
      )}
    </fieldset>
  )
}

function ReviewCard({
  question,
  index,
  answer,
  met,
  onToggle,
}: {
  question: Question
  index: number
  answer: string
  met: string[]
  onToggle: (criterionId: string) => void
}) {
  if (question.kind === 'choice') {
    const correct = answer === question.correctOptionId
    const chosen = question.options.find((o) => o.id === answer)?.text
    const right = question.options.find((o) => o.id === question.correctOptionId)?.text
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5">
        <QuestionHeader question={question} index={index} />
        <p className={`text-[14px] ${correct ? 'text-ok' : 'text-bad'}`}>
          {correct ? 'Correta' : 'Incorreta'} · sua resposta: {chosen}
        </p>
        {!correct && <p className="text-[14px] text-fg-muted">Resposta correta: {right}</p>}
        <p className="text-[13.5px] leading-relaxed text-fg-muted">{question.explanation}</p>
      </div>
    )
  }

  const flagged = flaggedCriteria(question, answer)
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5">
      <QuestionHeader question={question} index={index} />
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-ink p-3.5">
          <span className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">Sua resposta</span>
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-[#cfcfcf]">{answer}</p>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-ink p-3.5">
          <span className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">Resposta esperada</span>
          <p className="text-[13.5px] leading-relaxed text-[#cfcfcf]">{question.expectedAnswer}</p>
        </div>
      </div>
      <fieldset className="flex flex-col gap-1">
        <legend className="mb-2 text-sm font-semibold text-fg">Quais critérios sua resposta atendeu?</legend>
        {question.criteria.map((c) => (
          <label key={c.id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md px-2 py-2 text-[14px] leading-relaxed hover:bg-raised">
            <input
              type="checkbox"
              checked={met.includes(c.id)}
              onChange={() => onToggle(c.id)}
              className="mt-1 accent-[#5b9cf5]"
            />
            <span className="flex flex-1 flex-col gap-1">
              <span className={met.includes(c.id) ? 'text-fg' : 'text-fg-muted'}>{c.description}</span>
              <span className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-fg-subtle">
                peso {Math.round(c.weight * 100)}%
                {flagged.includes(c.id) && (
                  <span className="rounded border border-[#2f2750] px-1.5 py-0.5 text-accent-purple-soft">termo encontrado</span>
                )}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
    </div>
  )
}
