import type { Assessment, OpenQuestion, Question, QuestionCategory } from '../types/assessment'
import type { AttemptRecord } from '../types/progress'
import { PASSING_SCORE } from './progress'

/**
 * Correção por critérios definidos. Funções puras e determinísticas:
 * o mesmo conjunto de respostas e critérios confirmados sempre gera a mesma nota
 * e o mesmo feedback. Não há IA nem análise de texto além da sinalização por palavras-chave.
 */

export const categoryLabel: Record<QuestionCategory, string> = {
  conceitual: 'Conceitual',
  'analise-de-codigo': 'Análise de código',
  'identificacao-de-erro': 'Identificação de erro',
  'situacao-pratica': 'Situação prática',
  justificativa: 'Justificativa técnica',
}

/** Minúsculas e sem acentos, para comparar palavras-chave. */
export const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

/** Critérios cujas palavras-chave aparecem na resposta. Apenas uma sinalização. */
export function flaggedCriteria(question: OpenQuestion, answer: string): string[] {
  const text = normalize(answer)
  return question.criteria.filter((c) => c.keywords.some((k) => text.includes(k))).map((c) => c.id)
}

/** Fração da questão obtida, de 0 a 1. */
export function questionFraction(question: Question, answer: string | undefined, criteriaMet: string[] = []): number {
  if (question.kind === 'choice') return answer === question.correctOptionId ? 1 : 0
  return question.criteria.filter((c) => criteriaMet.includes(c.id)).reduce((sum, c) => sum + c.weight, 0)
}

export function scoreOf(assessment: Assessment, answers: Record<string, string>, criteriaMet: Record<string, string[]>) {
  const total = assessment.questions.reduce((sum, q) => sum + questionFraction(q, answers[q.id], criteriaMet[q.id]), 0)
  const score = Math.round((total / assessment.questions.length) * 100)
  return { score, passed: score >= PASSING_SCORE }
}

export interface QuestionResult {
  question: Question
  index: number
  fraction: number
  answer: string
  /** Para escolha: texto da opção escolhida. */
  chosenText?: string
  metCriteria: string[]
  missedCriteria: string[]
}

export interface Feedback {
  score: number
  passed: boolean
  results: QuestionResult[]
  /** Pontos fortes: o que foi demonstrado. */
  strengths: string[]
  /** Conceitos que precisam melhorar: o que faltou. */
  toImprove: string[]
  /** Questões com menos da metade dos pontos. */
  attention: QuestionResult[]
  /** Conteúdos para revisar, do pior resultado para o melhor, sem repetição. */
  reviewTopicIds: string[]
  /** Exercícios de reforço das questões incompletas. */
  exercises: string[]
}

export function buildFeedback(assessment: Assessment, attempt: Pick<AttemptRecord, 'answers' | 'criteriaMet'>): Feedback {
  const results: QuestionResult[] = assessment.questions.map((question, index) => {
    const answer = attempt.answers[question.id] ?? ''
    const met = attempt.criteriaMet[question.id] ?? []
    const fraction = questionFraction(question, answer, met)
    if (question.kind === 'choice') {
      return {
        question,
        index,
        fraction,
        answer,
        chosenText: question.options.find((o) => o.id === answer)?.text,
        metCriteria: [],
        missedCriteria: [],
      }
    }
    return {
      question,
      index,
      fraction,
      answer,
      metCriteria: question.criteria.filter((c) => met.includes(c.id)).map((c) => c.description),
      missedCriteria: question.criteria.filter((c) => !met.includes(c.id)).map((c) => c.description),
    }
  })

  const strengths: string[] = []
  const toImprove: string[] = []
  for (const r of results) {
    const label = `Questão ${r.index + 1} (${categoryLabel[r.question.category]})`
    if (r.question.kind === 'choice') {
      if (r.fraction === 1) strengths.push(`${label}: resposta correta.`)
      else toImprove.push(`${label}: ${r.question.explanation}`)
    } else {
      strengths.push(...r.metCriteria)
      toImprove.push(...r.missedCriteria)
    }
  }

  const incomplete = results.filter((r) => r.fraction < 1).sort((a, b) => a.fraction - b.fraction)
  const { score, passed } = scoreOf(assessment, attempt.answers, attempt.criteriaMet)

  return {
    score,
    passed,
    results,
    strengths,
    toImprove,
    attention: results.filter((r) => r.fraction < 0.5),
    reviewTopicIds: [...new Set(incomplete.map((r) => r.question.topicId))],
    exercises: incomplete.map((r) => r.question.reinforcement),
  }
}
