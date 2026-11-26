import { useCallback, useEffect, useState } from 'react'
import { emptyProgress, parseProgress } from '../lib/progress'
import type { AttemptRecord, ChecklistItemId, ProgressState } from '../types/progress'

/** Chave versionada: uma mudança incompatível no formato usa uma chave nova. */
export const STORAGE_KEY = 'roadmap-backend:v1'

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? parseProgress(JSON.parse(raw)) : emptyProgress()
  } catch {
    // LocalStorage indisponível (modo privado, bloqueado) ou JSON corrompido.
    return emptyProgress()
  }
}

function save(state: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Sem armazenamento disponível: o progresso vale só para esta sessão.
  }
}

/**
 * Estado de progresso persistido no LocalStorage.
 * Também sincroniza entre abas abertas ao mesmo tempo.
 */
export function useProgress() {
  const [state, setState] = useState<ProgressState>(load)

  useEffect(() => {
    save(state)
  }, [state])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setState(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const toggleCheck = useCallback((topicId: string, itemId: ChecklistItemId) => {
    setState((prev) => {
      const current = prev.checklists[topicId] ?? []
      const next = current.includes(itemId) ? current.filter((i) => i !== itemId) : [...current, itemId]
      const checklists = { ...prev.checklists }
      if (next.length) checklists[topicId] = next
      else delete checklists[topicId]
      return { ...prev, checklists }
    })
  }, [])

  const setLastTopic = useCallback((moduleId: string, topicId: string) => {
    setState((prev) =>
      prev.lastTopic?.moduleId === moduleId && prev.lastTopic.topicId === topicId
        ? prev
        : { ...prev, lastTopic: { moduleId, topicId } },
    )
  }, [])

  const addAttempt = useCallback((moduleId: string, attempt: AttemptRecord) => {
    setState((prev) => ({
      ...prev,
      attempts: { ...prev.attempts, [moduleId]: [...(prev.attempts[moduleId] ?? []), attempt] },
    }))
  }, [])

  return { state, toggleCheck, setLastTopic, addAttempt }
}
