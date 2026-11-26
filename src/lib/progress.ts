import type { Module, Topic } from '../types/roadmap'
import {
  CHECKLIST_ITEMS,
  type AttemptRecord,
  type ModuleStatus,
  type ProgressState,
  type TopicStatus,
} from '../types/progress'

/**
 * Regras de progresso. Funções puras: recebem o estado salvo e o conteúdo,
 * e devolvem status calculados. Nada aqui lê ou escreve no LocalStorage.
 */

export const PASSING_SCORE = 70
export const CHECKLIST_SIZE = CHECKLIST_ITEMS.length

export const emptyProgress = (): ProgressState => ({ version: 1, checklists: {}, attempts: {} })

export function checkedCount(state: ProgressState, topicId: string): number {
  return state.checklists[topicId]?.length ?? 0
}

export function topicStatus(state: ProgressState, topic: Topic): TopicStatus {
  const count = checkedCount(state, topic.id)
  if (count >= CHECKLIST_SIZE) return 'concluido'
  return count > 0 ? 'em-andamento' : 'nao-iniciado'
}

export const isTopicDone = (state: ProgressState, topic: Topic) => topicStatus(state, topic) === 'concluido'

export function attemptsOf(state: ProgressState, moduleId: string): AttemptRecord[] {
  return state.attempts[moduleId] ?? []
}

export function bestScore(state: ProgressState, moduleId: string): number | null {
  const list = attemptsOf(state, moduleId)
  return list.length ? Math.max(...list.map((a) => a.score)) : null
}

export function isModuleApproved(state: ProgressState, moduleId: string): boolean {
  return attemptsOf(state, moduleId).some((a) => a.passed)
}

/** Um módulo fica bloqueado até o anterior ser aprovado. O primeiro nunca é bloqueado. */
export function isModuleLocked(state: ProgressState, modules: Module[], index: number): boolean {
  return index > 0 && !isModuleApproved(state, modules[index - 1].id)
}

export function completedTopicCount(state: ProgressState, module: Module): number {
  return module.topics.filter((t) => isTopicDone(state, t)).length
}

/** A avaliação é liberada quando o módulo não está bloqueado e todos os conteúdos estão concluídos. */
export function isAssessmentUnlocked(state: ProgressState, modules: Module[], index: number): boolean {
  const module = modules[index]
  return !isModuleLocked(state, modules, index) && completedTopicCount(state, module) === module.topics.length
}

export function moduleStatus(state: ProgressState, modules: Module[], index: number): ModuleStatus {
  const module = modules[index]
  if (isModuleApproved(state, module.id)) return 'aprovado'
  if (isModuleLocked(state, modules, index)) return 'bloqueado'

  const done = completedTopicCount(state, module)
  if (done === module.topics.length) {
    return attemptsOf(state, module.id).length > 0 ? 'precisa-revisar' : 'aguardando-avaliacao'
  }
  const started = module.topics.some((t) => checkedCount(state, t.id) > 0)
  return started ? 'em-andamento' : 'nao-iniciado'
}

export interface OverallProgress {
  completedTopics: number
  totalTopics: number
  approvedModules: number
  totalModules: number
}

export function overallProgress(state: ProgressState, modules: Module[]): OverallProgress {
  return {
    completedTopics: modules.reduce((sum, m) => sum + completedTopicCount(state, m), 0),
    totalTopics: modules.reduce((sum, m) => sum + m.topics.length, 0),
    approvedModules: modules.filter((m) => isModuleApproved(state, m.id)).length,
    totalModules: modules.length,
  }
}

/**
 * Onde continuar: o último conteúdo aberto, se ainda não foi concluído;
 * senão, o primeiro conteúdo com aula e não concluído, na ordem do roadmap.
 */
export function nextTopic(state: ProgressState, modules: Module[]): { module: Module; topic: Topic } | null {
  if (state.lastTopic) {
    const module = modules.find((m) => m.id === state.lastTopic?.moduleId)
    const topic = module?.topics.find((t) => t.id === state.lastTopic?.topicId)
    if (module && topic && topic.lesson && !isTopicDone(state, topic)) return { module, topic }
  }
  for (const module of modules) {
    const topic = module.topics.find((t) => t.lesson && !isTopicDone(state, t))
    if (topic) return { module, topic }
  }
  return null
}

/**
 * Valida um objeto lido do LocalStorage. Dados corrompidos ou de outra versão
 * são descartados campo a campo, em vez de quebrar a aplicação.
 */
export function parseProgress(raw: unknown): ProgressState {
  const state = emptyProgress()
  if (typeof raw !== 'object' || raw === null || (raw as { version?: unknown }).version !== 1) return state
  const data = raw as Record<string, unknown>
  const validIds = new Set<string>(CHECKLIST_ITEMS.map((i) => i.id))

  if (typeof data.checklists === 'object' && data.checklists !== null) {
    for (const [topicId, items] of Object.entries(data.checklists)) {
      if (Array.isArray(items)) {
        const valid = items.filter((i): i is ProgressState['checklists'][string][number] => typeof i === 'string' && validIds.has(i))
        if (valid.length) state.checklists[topicId] = [...new Set(valid)]
      }
    }
  }

  if (typeof data.attempts === 'object' && data.attempts !== null) {
    for (const [moduleId, list] of Object.entries(data.attempts)) {
      if (Array.isArray(list)) {
        const valid = list.filter(
          (a): a is AttemptRecord =>
            typeof a === 'object' &&
            a !== null &&
            typeof a.id === 'string' &&
            typeof a.finishedAt === 'string' &&
            typeof a.score === 'number' &&
            typeof a.passed === 'boolean',
        )
        if (valid.length) state.attempts[moduleId] = valid
      }
    }
  }

  const last = data.lastTopic as { moduleId?: unknown; topicId?: unknown } | undefined
  if (last && typeof last.moduleId === 'string' && typeof last.topicId === 'string') {
    state.lastTopic = { moduleId: last.moduleId, topicId: last.topicId }
  }
  return state
}
