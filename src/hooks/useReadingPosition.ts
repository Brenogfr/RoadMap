import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Lembra até onde cada aula foi lida e reabre a aula nesse ponto.
 *
 * É uma conveniência por navegador, separada do progresso: fica em outra chave do
 * LocalStorage e pode ser perdida sem prejuízo. Quem leu até o fim volta a abrir no início.
 */
const STORAGE_KEY = 'roadmap-backend:leitura'
/** Abaixo disso, não vale a pena "continuar": a aula abre no início. */
const MIN_OFFSET = 300

function readAll(): Record<string, number> {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return typeof data === 'object' && data !== null ? (data as Record<string, number>) : {}
  } catch {
    return {}
  }
}

function write(topicId: string, offset: number | null) {
  try {
    const all = readAll()
    if (offset === null) delete all[topicId]
    else all[topicId] = Math.round(offset)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // Sem armazenamento: a aula sempre abre no início.
  }
}

/**
 * @param ready a aula já está renderizada (só então a altura do conteúdo é conhecida)
 * @returns resumed: a aula foi reaberta no ponto salvo; backToTop: volta ao início
 */
export function useReadingPosition(topicId: string, ready: boolean, scrollRef: RefObject<HTMLDivElement | null>) {
  const [resumedTopic, setResumedTopic] = useState<string | null>(null)
  const restoring = useRef(false)

  // Ao abrir: volta à posição salva assim que o conteúdo tiver altura suficiente.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const saved = readAll()[topicId] ?? 0
    if (!ready || saved < MIN_OFFSET) {
      el.scrollTop = 0
      return
    }
    restoring.current = true
    let frames = 0
    let raf = 0
    const apply = () => {
      if (el.scrollHeight - el.clientHeight >= saved || frames++ > 120) {
        el.scrollTop = saved
        restoring.current = false
        setResumedTopic(topicId)
        return
      }
      raf = requestAnimationFrame(apply)
    }
    raf = requestAnimationFrame(apply)
    return () => {
      cancelAnimationFrame(raf)
      restoring.current = false
    }
  }, [topicId, ready, scrollRef])

  // Enquanto lê: salva a posição, sem gravar a cada pixel.
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !ready) return
    let timer: ReturnType<typeof setTimeout> | undefined
    // Posição medida no momento da rolagem: ao trocar de aula, o conteúdo já é outro.
    let pending: number | null | undefined
    const save = () => {
      if (pending !== undefined) write(topicId, pending)
      pending = undefined
    }
    const onScroll = () => {
      if (restoring.current) return
      const top = el.scrollTop
      if (top < MIN_OFFSET) setResumedTopic(null)
      const nearEnd = top + el.clientHeight >= el.scrollHeight * 0.95
      pending = nearEnd || top < MIN_OFFSET ? null : top
      clearTimeout(timer)
      timer = setTimeout(save, 400)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      clearTimeout(timer)
      save()
    }
  }, [topicId, ready, scrollRef])

  const backToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    setResumedTopic(null)
  }, [scrollRef])

  return { resumed: resumedTopic === topicId, backToTop }
}
