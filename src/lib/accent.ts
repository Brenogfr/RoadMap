import type { Accent } from '../types/roadmap'

/**
 * Classes Tailwind por cor de destaque. Precisam ser strings literais
 * completas para o Tailwind encontrá-las no build.
 */
export interface AccentStyle {
  text: string
  border: string
  nodeBg: string
  badge: string
  /** Cor das linhas de conexão (SVG). */
  stroke: string
  soft: string
}

export const accentStyles: Record<Accent, AccentStyle> = {
  blue: {
    text: 'text-accent-blue-soft',
    border: 'border-[#2e3b52]',
    nodeBg: 'bg-[#060a11]',
    badge: 'bg-[#0f1a2c] text-accent-blue-soft',
    stroke: '#2e3b52',
    soft: 'bg-[#0b1220]',
  },
  gold: {
    text: 'text-accent-gold',
    border: 'border-[#3a2f17]',
    nodeBg: 'bg-[#0a0804]',
    badge: 'bg-[#1c160a] text-accent-gold',
    stroke: '#3a2f17',
    soft: 'bg-[#15110a]',
  },
  purple: {
    text: 'text-accent-purple-soft',
    border: 'border-[#2f2750]',
    nodeBg: 'bg-[#07060c]',
    badge: 'bg-[#161229] text-accent-purple-soft',
    stroke: '#2f2750',
    soft: 'bg-[#100d1d]',
  },
}

export const pad2 = (n: number) => String(n).padStart(2, '0')
