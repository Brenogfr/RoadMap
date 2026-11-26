import { useEffect, useRef, type ReactNode, type RefObject } from 'react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: ReactNode
  /** Container de rolagem, exposto para quem precisa rolar até uma seção. */
  scrollRef?: RefObject<HTMLDivElement | null>
}

/**
 * Painel lateral à direita (tela inteira no celular).
 * Fecha com Esc ou clique no fundo, trava a rolagem da página
 * e devolve o foco ao elemento que o abriu.
 */
export function Drawer({ open, onClose, labelledBy, children, scrollRef }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="relative flex h-full w-full max-w-3xl flex-col border-l border-line bg-[#070707] shadow-2xl outline-none"
      >
        <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}
