/**
 * Desliga os efeitos de hover enquanto algo rola.
 *
 * Ao rolar com o mouse parado, os cards passam por baixo do cursor e cada um dispara
 * hover e transição de cor, forçando o navegador a repintar a cada quadro. Durante a
 * rolagem, html[data-rolando] desativa os eventos de ponteiro do conteúdo (veja index.css).
 * Mover o mouse devolve os eventos imediatamente, para nenhum clique se perder.
 * Medido: 35 quadros descartados → 0 ao rolar o roadmap em CPU 4× mais lenta.
 */
export function suppressHoverWhileScrolling(idleMs = 120) {
  const root = document.documentElement
  let timer: ReturnType<typeof setTimeout> | undefined
  const onScroll = () => {
    if (!root.hasAttribute('data-rolando')) root.setAttribute('data-rolando', '')
    clearTimeout(timer)
    timer = setTimeout(() => root.removeAttribute('data-rolando'), idleMs)
  }
  // scroll não borbulha; na fase de captura, um único listener cobre a página e o painel.
  window.addEventListener('scroll', onScroll, { capture: true, passive: true })
  // Quem move o mouse quer apontar para algo: devolve os eventos na hora, senão um clique
  // logo depois da rolagem se perde. Movimento zero é o evento sintético do navegador
  // quando o conteúdo passa sob o cursor parado; esse não conta.
  const onPointerMove = (e: PointerEvent) => {
    if (!root.hasAttribute('data-rolando') || (e.movementX === 0 && e.movementY === 0)) return
    clearTimeout(timer)
    root.removeAttribute('data-rolando')
  }
  window.addEventListener('pointermove', onPointerMove, { capture: true, passive: true })
}
