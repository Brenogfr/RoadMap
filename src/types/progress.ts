/**
 * Tipos do progresso salvo no LocalStorage.
 * Só fatos são guardados (itens marcados, tentativas). Status e totais
 * são sempre calculados a partir deles, para nunca ficarem inconsistentes.
 */

export const CHECKLIST_ITEMS = [
  { id: 'conceito', label: 'Entendi o conceito' },
  { id: 'problema', label: 'Entendi o problema que ele resolve' },
  { id: 'interno', label: 'Compreendi o funcionamento interno' },
  { id: 'implementei', label: 'Consegui implementar sozinho' },
  { id: 'testei', label: 'Consegui testar' },
  { id: 'explico', label: 'Consigo explicar com minhas palavras' },
] as const

export type ChecklistItemId = (typeof CHECKLIST_ITEMS)[number]['id']

/** Uma tentativa de avaliação técnica (preenchida na Etapa 5). */
export interface AttemptRecord {
  id: string
  /** Data ISO de conclusão. */
  finishedAt: string
  /** Nota de 0 a 100. */
  score: number
  passed: boolean
  /** Resposta dada a cada questão, por id da questão. */
  answers: Record<string, string>
  /** Critérios atendidos em cada questão, por id da questão. */
  criteriaMet: Record<string, string[]>
}

export interface ProgressState {
  version: 1
  /** Itens do checklist marcados, por id do conteúdo. */
  checklists: Record<string, ChecklistItemId[]>
  /** Histórico de tentativas, por id do módulo, da mais antiga para a mais recente. */
  attempts: Record<string, AttemptRecord[]>
  /** Último conteúdo aberto, para continuar de onde parou. */
  lastTopic?: { moduleId: string; topicId: string }
}

export type TopicStatus = 'nao-iniciado' | 'em-andamento' | 'concluido'

export type ModuleStatus =
  | 'bloqueado'
  | 'nao-iniciado'
  | 'em-andamento'
  | 'aguardando-avaliacao'
  | 'aprovado'
  | 'precisa-revisar'
