/**
 * Desliga os efeitos de hover enquanto algo rola.
 *
 * Ao rolar com o mouse parado, os cards passam por baixo do cursor e cada um dispara
 * hover e transição de cor, forçando o navegador a repintar a cada quadro. Durante a
 * rolagem, html[data-rolando] desativa os eventos de ponteiro do conteúdo (veja index.css).
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
}
