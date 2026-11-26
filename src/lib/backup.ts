import type { Module } from '../types/roadmap'
import type { ProgressState } from '../types/progress'
import { overallProgress, parseProgress } from './progress'

/**
 * Backup do progresso em um arquivo JSON.
 * O progresso fica só no LocalStorage; o arquivo permite trocar de navegador ou
 * de computador, e se proteger de uma limpeza dos dados do site.
 */
export const BACKUP_APP = 'roadmap-backend'
export const BACKUP_VERSION = 1

export interface BackupFile {
  app: typeof BACKUP_APP
  versao: typeof BACKUP_VERSION
  exportadoEm: string
  progresso: ProgressState
}

export function createBackup(state: ProgressState): BackupFile {
  return { app: BACKUP_APP, versao: BACKUP_VERSION, exportadoEm: new Date().toISOString(), progresso: state }
}

export function backupFileName(date = new Date()) {
  return `roadmap-backend-progresso-${date.toISOString().slice(0, 10)}.json`
}

export type BackupReadResult =
  | { ok: true; progresso: ProgressState; exportadoEm: string | null }
  | { ok: false; erro: string }

/** Lê e valida o conteúdo de um arquivo de backup. Nunca lança exceção. */
export function readBackup(text: string): BackupReadResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, erro: 'O arquivo não é um JSON válido.' }
  }
  if (typeof data !== 'object' || data === null || (data as { app?: unknown }).app !== BACKUP_APP) {
    return { ok: false, erro: 'Este arquivo não é um backup do Roadmap Back-end.' }
  }
  const { progresso, exportadoEm } = data as { progresso?: unknown; exportadoEm?: unknown }
  if (typeof progresso !== 'object' || progresso === null || (progresso as { version?: unknown }).version !== 1) {
    return { ok: false, erro: 'O backup é de uma versão incompatível.' }
  }
  return { ok: true, progresso: parseProgress(progresso), exportadoEm: typeof exportadoEm === 'string' ? exportadoEm : null }
}

/** Resumo legível para a confirmação antes de substituir o progresso. */
export function describeProgress(state: ProgressState, modules: Module[]) {
  const o = overallProgress(state, modules)
  return `${o.completedTopics} conteúdos concluídos e ${o.approvedModules} módulos aprovados`
}
