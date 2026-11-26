/** Constantes de layout e identificadores compartilhados pelos componentes. */

// Roadmap: medidas fixas dos cards, usadas para desenhar as conexões sem medir o DOM.
export const CARD_HEIGHT = 44
export const CARD_GAP = 12
export const CONNECTOR_WIDTH = 64

export const blockHeight = (count: number) => (count > 0 ? count * CARD_HEIGHT + (count - 1) * CARD_GAP : CARD_HEIGHT)

// Painel lateral
export const TOPIC_TITLE_ID = 'painel-conteudo-titulo'
export const MODULE_TITLE_ID = 'painel-modulo-titulo'
export const ASSESSMENT_TITLE_ID = 'painel-avaliacao-titulo'

// Seções de uma aula (A–F)
export const LESSON_SECTIONS = [
  { id: 'a', letter: 'A', title: 'Introdução', short: 'Introdução' },
  { id: 'b', letter: 'B', title: 'Explicação técnica', short: 'Técnica' },
  { id: 'c', letter: 'C', title: 'Fluxo de funcionamento', short: 'Fluxo' },
  { id: 'd', letter: 'D', title: 'Exemplo prático', short: 'Prática' },
  { id: 'e', letter: 'E', title: 'Erros comuns', short: 'Erros' },
  { id: 'f', letter: 'F', title: 'Direcionamento de estudos', short: 'Próximos passos' },
] as const

export type SectionId = (typeof LESSON_SECTIONS)[number]['id']

export const sectionDomId = (id: SectionId) => `secao-${id}`
