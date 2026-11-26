/**
 * Tipos do conteúdo do roadmap.
 * Todo o conteúdo (módulos, aulas, exercícios) é dado estático tipado:
 * os componentes apenas renderizam o que está aqui.
 */

export type Accent = 'blue' | 'gold' | 'purple'

export type CodeLanguage = 'ts' | 'js' | 'json' | 'bash' | 'http' | 'text'

/** Explicação de uma linha (ou intervalo, ex.: "3-5") de um trecho de código. */
export interface LineNote {
  line: string
  note: string
}

export interface CodeSample {
  /** Nome do arquivo mostrado no topo do bloco, ex.: "src/server.ts". */
  filename?: string
  language: CodeLanguage
  code: string
  /** Explicação linha por linha, exibida logo abaixo do código. */
  lineNotes?: LineNote[]
}

export interface Concept {
  term: string
  description: string
}

export interface FlowStep {
  label: string
  detail?: string
}

export interface Flow {
  title: string
  steps: FlowStep[]
  /** Observação exibida abaixo do diagrama. */
  caption?: string
}

export interface TechnicalExample {
  title: string
  description?: string
  sample: CodeSample
}

/** Requisição sugerida para testar no Thunder Client (extensão do VS Code). */
export interface HttpTest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
  url: string
  headers?: Record<string, string>
  body?: string
  expected: string
}

export interface PracticeFile {
  path: string
  purpose: string
  sample: CodeSample
}

export interface CommonError {
  title: string
  symptom: string
  cause: string
  fix: string
}

export interface DocLink {
  label: string
  url: string
}

export interface Lesson {
  /** A. Introdução */
  intro: {
    whatIs: string
    purpose: string
    problem: string
    whyExists: string
    whereUsed: string
  }
  /** B. Explicação técnica */
  technical: {
    internals: string[]
    concepts: Concept[]
    examples: TechnicalExample[]
  }
  /** C. Fluxo de funcionamento (quando aplicável) */
  flows?: Flow[]
  /** D. Exemplo prático */
  practice: {
    goal: string
    structure: string
    files: PracticeFile[]
    run: string[]
    httpTests?: HttpTest[]
    /** Quando não há HTTP envolvido, como verificar o resultado. */
    verify?: string
    expected: string
  }
  /** E. Erros comuns */
  commonErrors: CommonError[]
  /** F. Direcionamento de estudos */
  guidance: {
    before: string[]
    now: string[]
    after: string[]
    officialDocs: DocLink[]
    complementary?: DocLink[]
  }
}

export interface Topic {
  id: string
  title: string
  /** Uma frase sobre o que o conteúdo cobre. */
  summary: string
  /** Aula completa. Ausente enquanto o conteúdo ainda não foi escrito. */
  lesson?: Lesson
}

export interface PracticeTask {
  kind: 'exercise' | 'project'
  title: string
  description: string
  requirements: string[]
  /** Critérios para considerar a tarefa bem resolvida. */
  doneWhen: string[]
  hints?: string[]
}

export interface Module {
  id: string
  number: number
  title: string
  /** Rótulo curto exibido no nó do roadmap. */
  label: string
  accent: Accent
  description: string
  topics: Topic[]
  practice?: PracticeTask
}
