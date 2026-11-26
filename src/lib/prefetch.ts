/**
 * Baixa conteúdo com antecedência quando o navegador está ocioso, para que abrir uma aula
 * pareça instantâneo sem pesar o carregamento inicial. Falhas são ignoradas: o conteúdo
 * será baixado normalmente quando for aberto.
 */
export function whenIdle(task: () => unknown) {
  const run = () => {
    try {
      void Promise.resolve(task()).catch(() => {})
    } catch {
      // ignorado de propósito
    }
  }
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 3000 })
  else setTimeout(run, 1500)
}

/** O leitor de aulas (seções A–F e realce de código), compartilhado por todas as aulas. */
export const preloadLessonView = () => import('../components/study/LessonView')
