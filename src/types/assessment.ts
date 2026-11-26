import type { CodeSample } from './roadmap'

/**
 * Avaliação técnica de um módulo.
 *
 * Correção em três passos, sem IA:
 * 1. Questões de escolha são corrigidas automaticamente (resposta exata).
 * 2. Em questões abertas, palavras-chave apenas SINALIZAM critérios prováveis.
 * 3. A pessoa compara a própria resposta com a esperada e confirma cada critério.
 * A nota vem da soma dos pesos confirmados, nunca das palavras-chave sozinhas.
 */

export type QuestionCategory =
  | 'conceitual'
  | 'analise-de-codigo'
  | 'identificacao-de-erro'
  | 'situacao-pratica'
  | 'justificativa'

export interface Criterion {
  id: string
  /** O que a resposta precisa conter, escrito como uma afirmação verificável. */
  description: string
  /** Peso dentro da questão. Os pesos de uma questão somam 1. */
  weight: number
  /**
   * Trechos que sugerem que o critério foi abordado (sem acento, minúsculos).
   * Só sinalizam: nunca marcam o critério sozinhos.
   */
  keywords: string[]
}

interface QuestionBase {
  id: string
  category: QuestionCategory
  prompt: string
  code?: CodeSample
  /** Conteúdo recomendado para revisão quando a questão vai mal. */
  topicId: string
  /** Exercício curto para reforçar o ponto fraco. */
  reinforcement: string
}

export interface ChoiceQuestion extends QuestionBase {
  kind: 'choice'
  options: { id: string; text: string }[]
  correctOptionId: string
  /** Por que a correta está certa e as outras não. */
  explanation: string
}

export interface OpenQuestion extends QuestionBase {
  kind: 'open'
  expectedAnswer: string
  criteria: Criterion[]
}

export type Question = ChoiceQuestion | OpenQuestion

export interface Assessment {
  moduleId: string
  questions: Question[]
}
