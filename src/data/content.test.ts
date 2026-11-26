import { describe, expect, it } from 'vitest'
import { normalize } from '../lib/grading'
import type { CodeSample, Lesson } from '../types/roadmap'
import { modules } from './index'

/**
 * Validação de todo o conteúdo publicado. Pega, antes de chegar à página, os erros mais
 * comuns ao escrever aulas e avaliações: ids repetidos, lineNotes fora do código,
 * pesos que não somam 1, palavras-chave com acento e links inválidos.
 */

const samplesOf = (lesson: Lesson): { label: string; sample: CodeSample }[] => [
  ...lesson.technical.examples.map((e) => ({ label: e.title, sample: e.sample })),
  ...lesson.practice.files.map((f) => ({ label: f.path, sample: f.sample })),
]

describe('estrutura dos módulos', () => {
  it('ids de módulos e conteúdos são únicos e seguem o prefixo do módulo', () => {
    const ids = modules.flatMap((m) => m.topics.map((t) => t.id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const m of modules) {
      expect(m.id).toBe('m' + String(m.number).padStart(2, '0'))
      for (const t of m.topics) expect(t.id.startsWith(m.id + '-'), t.id).toBe(true)
    }
  })
})

for (const module of modules) {
  const publicados = module.topics.filter((t) => t.loadLesson)
  if (publicados.length === 0) continue

  describe(`${module.id}: aulas`, () => {
    for (const topic of publicados) {
      it(topic.title, async () => {
        const lesson = await topic.loadLesson!()
        const { intro, technical, practice, commonErrors, guidance } = lesson
        expect(Object.values(intro).every((v) => v.length > 40), 'introdução incompleta').toBe(true)
        expect(technical.internals.length).toBeGreaterThanOrEqual(4)
        expect(technical.concepts.length).toBeGreaterThanOrEqual(5)
        expect(technical.examples.length).toBeGreaterThanOrEqual(1)
        expect(practice.files.length).toBeGreaterThanOrEqual(1)
        expect(commonErrors.length).toBeGreaterThanOrEqual(4)
        expect(guidance.officialDocs.length).toBeGreaterThanOrEqual(1)

        for (const { label, sample } of samplesOf(lesson)) {
          const total = sample.code.split('\n').length
          for (const note of sample.lineNotes ?? []) {
            const [inicio, fim = inicio] = note.line.split('-').map(Number)
            expect(inicio >= 1 && fim <= total && inicio <= fim, `${label}: L${note.line} fora de 1..${total}`).toBe(true)
          }
        }
        for (const link of [...guidance.officialDocs, ...(guidance.complementary ?? [])]) {
          expect(link.url.startsWith('https://'), link.url).toBe(true)
        }
      })
    }
  })

  if (!module.loadAssessment) continue

  describe(`${module.id}: avaliação`, () => {
    it('segue as regras de avaliação', async () => {
      const assessment = await module.loadAssessment!()
      const topicIds = new Set(module.topics.map((t) => t.id))
      expect(assessment.moduleId).toBe(module.id)
      expect(assessment.questions.length).toBeGreaterThanOrEqual(5)
      expect(assessment.questions.length).toBeLessThanOrEqual(8)

      const ids = assessment.questions.map((q) => q.id)
      expect(new Set(ids).size).toBe(ids.length)

      for (const q of assessment.questions) {
        expect(q.id.startsWith(module.id + '-'), q.id).toBe(true)
        expect(topicIds.has(q.topicId), `${q.id}: topicId ${q.topicId} não existe no módulo`).toBe(true)
        expect(q.reinforcement.length).toBeGreaterThan(20)
        if (q.kind === 'choice') {
          expect(q.options.some((o) => o.id === q.correctOptionId), `${q.id}: resposta correta não está nas opções`).toBe(true)
          expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length)
        } else {
          const soma = q.criteria.reduce((s, c) => s + c.weight, 0)
          expect(Math.abs(soma - 1) < 1e-9, `${q.id}: pesos somam ${soma}`).toBe(true)
          expect(q.criteria.length).toBeGreaterThanOrEqual(2)
          expect(q.criteria.length).toBeLessThanOrEqual(4)
          for (const c of q.criteria) {
            for (const k of c.keywords) expect(k, `${q.id}/${c.id}: keyword não normalizada`).toBe(normalize(k))
          }
        }
      }
    })
  })
}
