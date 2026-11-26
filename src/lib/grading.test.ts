import { describe, expect, it } from 'vitest'
import type { Assessment } from '../types/assessment'
import { buildFeedback, flaggedCriteria, normalize, scoreOf } from './grading'

const assessment: Assessment = {
  moduleId: 'm99',
  questions: [
    {
      id: 'q1',
      kind: 'choice',
      category: 'conceitual',
      topicId: 't1',
      prompt: 'Escolha',
      options: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
      correctOptionId: 'b',
      explanation: 'B é a correta.',
      reinforcement: 'Exercício 1',
    },
    {
      id: 'q2',
      kind: 'open',
      category: 'justificativa',
      topicId: 't2',
      prompt: 'Explique',
      expectedAnswer: 'Esperada',
      criteria: [
        { id: 'c1', description: 'Critério 1', weight: 0.6, keywords: ['bloque'] },
        { id: 'c2', description: 'Critério 2', weight: 0.4, keywords: ['idempotencia'] },
      ],
      reinforcement: 'Exercício 2',
    },
  ],
}

describe('correção por critérios', () => {
  it('normaliza acentos e maiúsculas', () => {
    expect(normalize('IdempotÊNCIA')).toBe('idempotencia')
  })

  it('palavras-chave apenas sinalizam critérios', () => {
    const q = assessment.questions[1]
    if (q.kind !== 'open') throw new Error('esperava questão aberta')
    expect(flaggedCriteria(q, 'O laço BLOQUEIA o event loop')).toEqual(['c1'])
    expect(scoreOf(assessment, { q2: 'O laço bloqueia' }, {}).score).toBe(0)
  })

  it('calcula a nota pelas escolhas corretas e critérios confirmados', () => {
    expect(scoreOf(assessment, { q1: 'b' }, { q2: ['c1', 'c2'] })).toEqual({ score: 100, passed: true })
    expect(scoreOf(assessment, { q1: 'b' }, { q2: ['c2'] })).toEqual({ score: 70, passed: true })
    expect(scoreOf(assessment, { q1: 'a' }, { q2: ['c1'] })).toEqual({ score: 30, passed: false })
  })

  it('monta o feedback a partir das respostas', () => {
    const f = buildFeedback(assessment, { answers: { q1: 'a', q2: 'texto' }, criteriaMet: { q2: ['c1'] } })
    expect(f.strengths).toEqual(['Critério 1'])
    expect(f.toImprove).toContain('Critério 2')
    expect(f.toImprove.some((t) => t.includes('B é a correta.'))).toBe(true)
    expect(f.attention.map((r) => r.question.id)).toEqual(['q1'])
    expect(f.reviewTopicIds).toEqual(['t1', 't2'])
    expect(f.exercises).toEqual(['Exercício 1', 'Exercício 2'])
  })
})
