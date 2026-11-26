import { useCallback, useEffect, useState } from 'react'

/** Resultados já carregados, para não mostrar "carregando" duas vezes para o mesmo conteúdo. */
const cache = new Map<string, unknown>()

export type LazyState<T> =
  | { status: 'none' }
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error' }

/**
 * Carrega um conteúdo sob demanda (import dinâmico) e guarda o resultado em memória.
 * key identifica o conteúdo; sem loader, o conteúdo ainda não existe.
 */
export function useLazy<T>(key: string, loader?: () => Promise<T>): LazyState<T> & { retry: () => void } {
  const [failedKey, setFailedKey] = useState<string | null>(null)
  const [, setVersion] = useState(0)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!loader || cache.has(key)) return
    let active = true
    loader()
      .then((data) => {
        cache.set(key, data)
        if (active) setVersion((v) => v + 1)
      })
      .catch(() => {
        if (active) setFailedKey(key)
      })
    return () => {
      active = false
    }
    // loader muda de identidade a cada render do pai; key identifica o conteúdo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt])

  const retry = useCallback(() => {
    setFailedKey(null)
    setAttempt((n) => n + 1)
  }, [])

  if (!loader) return { status: 'none', retry }
  if (cache.has(key)) return { status: 'ready', data: cache.get(key) as T, retry }
  if (failedKey === key) return { status: 'error', retry }
  return { status: 'loading', retry }
}
