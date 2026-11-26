import { describe, expect, it } from 'vitest'
import type { Module } from '../types/roadmap'
import type { AttemptRecord, ProgressState } from '../types/progress'
import {
  emptyProgress,
  isAssessmentUnlocked,
  moduleStatus,
  nextTopic,
  overallProgress,
  parseProgress,
  topicStatus,
} from './progress'

const lesson = () => Promise.reject(new Error('não usado nos testes'))
const modulo = (id: string, number: number, topicIds: string[]): Module => ({
  id,
  number,
  title: id,
  label: id,
  accent: 'blue',
  description: '',
  topics: topicIds.map((t) => ({ id: t, title: t, summary: '', loadLesson: lesson })),
})
const modules = [modulo('m01', 1, ['a', 'b']), modulo('m02', 2, ['c'])]
const tudo = ['conceito', 'problema', 'interno', 'implementei', 'testei', 'explico'] as const
const tentativa = (score: number): AttemptRecord => ({
  id: String(score),
  finishedAt: '2026-01-01T00:00:00.000Z',
  score,
  passed: score >= 70,
  answers: {},
  criteriaMet: {},
})
const estado = (parcial: Partial<ProgressState>): ProgressState => ({ ...emptyProgress(), ...parcial })

describe('status de conteúdo', () => {
  it('segue a quantidade de itens marcados', () => {
    const topic = modules[0].topics[0]
    expect(topicStatus(emptyProgress(), topic)).toBe('nao-iniciado')
    expect(topicStatus(estado({ checklists: { a: ['conceito'] } }), topic)).toBe('em-andamento')
    expect(topicStatus(estado({ checklists: { a: [...tudo] } }), topic)).toBe('concluido')
  })
})

describe('status de módulo', () => {
  it('primeiro módulo nunca é bloqueado; o seguinte depende da aprovação', () => {
    expect(moduleStatus(emptyProgress(), modules, 0)).toBe('nao-iniciado')
    expect(moduleStatus(emptyProgress(), modules, 1)).toBe('bloqueado')
  })

  it('percorre em andamento → aguardando → precisa revisar → aprovado', () => {
    const parcial = estado({ checklists: { a: [...tudo] } })
    expect(moduleStatus(parcial, modules, 0)).toBe('em-andamento')

    const completo = estado({ checklists: { a: [...tudo], b: [...tudo] } })
    expect(moduleStatus(completo, modules, 0)).toBe('aguardando-avaliacao')
    expect(isAssessmentUnlocked(completo, modules, 0)).toBe(true)

    const reprovado = estado({ ...completo, attempts: { m01: [tentativa(50)] } })
    expect(moduleStatus(reprovado, modules, 0)).toBe('precisa-revisar')

    const aprovado = estado({ ...completo, attempts: { m01: [tentativa(50), tentativa(80)] } })
    expect(moduleStatus(aprovado, modules, 0)).toBe('aprovado')
    expect(moduleStatus(aprovado, modules, 1)).toBe('nao-iniciado')
  })

  it('não libera a avaliação de módulo bloqueado, mesmo com conteúdos concluídos', () => {
    const s = estado({ checklists: { c: [...tudo] } })
    expect(isAssessmentUnlocked(s, modules, 1)).toBe(false)
    expect(moduleStatus(s, modules, 1)).toBe('bloqueado')
  })
})

describe('progresso geral e próximo conteúdo', () => {
  it('conta concluídos e aprovados', () => {
    const s = estado({ checklists: { a: [...tudo] }, attempts: { m01: [tentativa(90)] } })
    expect(overallProgress(s, modules)).toEqual({ completedTopics: 1, totalTopics: 3, approvedModules: 1, totalModules: 2 })
  })

  it('continua da última aula aberta se ela não foi concluída', () => {
    const s = estado({ lastTopic: { moduleId: 'm01', topicId: 'b' } })
    expect(nextTopic(s, modules)?.topic.id).toBe('b')
    expect(nextTopic(estado({ checklists: { a: [...tudo] } }), modules)?.topic.id).toBe('b')
  })
})

describe('parseProgress', () => {
  it('descarta dados inválidos sem lançar exceção', () => {
    expect(parseProgress(null)).toEqual(emptyProgress())
    expect(parseProgress({ version: 2 })).toEqual(emptyProgress())
    const s = parseProgress({
      version: 1,
      checklists: { a: ['conceito', 'inexistente', 'conceito', 3] },
      attempts: { m01: [tentativa(80), { score: 'x' }] },
      lastTopic: { moduleId: 1 },
    })
    expect(s.checklists).toEqual({ a: ['conceito'] })
    expect(s.attempts.m01).toHaveLength(1)
    expect(s.lastTopic).toBeUndefined()
  })
})
