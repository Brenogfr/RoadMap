/**
 * Curvas que ligam os cards de um lado ao nó do módulo.
 * As posições são calculadas a partir das medidas fixas dos cards,
 * sem medir o DOM.
 */
import { CARD_GAP, CARD_HEIGHT, CONNECTOR_WIDTH, blockHeight } from '../../lib/layout'

interface ConnectorsProps {
  /** Quantidade de cards deste lado. */
  count: number
  /** Altura total do bloco do módulo. */
  height: number
  side: 'left' | 'right'
  stroke: string
}

export function Connectors({ count, height, side, stroke }: ConnectorsProps) {
  const mid = height / 2
  const offset = (height - blockHeight(count)) / 2
  const w = CONNECTOR_WIDTH
  const paths = Array.from({ length: count }, (_, i) => {
    const y = offset + CARD_HEIGHT / 2 + i * (CARD_HEIGHT + CARD_GAP)
    return side === 'left'
      ? `M0 ${y} C${w / 2} ${y} ${w / 2} ${mid} ${w} ${mid}`
      : `M0 ${mid} C${w / 2} ${mid} ${w / 2} ${y} ${w} ${y}`
  })
  return (
    <svg aria-hidden="true" width={w} height={height} viewBox={`0 0 ${w} ${height}`} fill="none" className="block">
      {paths.map((d) => (
        <path key={d} d={d} stroke={stroke} strokeWidth={1} />
      ))}
    </svg>
  )
}
