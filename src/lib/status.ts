import type { ModuleStatus, TopicStatus } from '../types/progress'

/** Rótulos e estilos discretos para cada status. Classes literais para o Tailwind. */

export const topicStatusMeta: Record<TopicStatus, { label: string; dot: string; text: string }> = {
  'nao-iniciado': { label: 'Não iniciado', dot: 'rounded-full border border-[#6a6a6a]', text: 'text-fg-subtle' },
  'em-andamento': { label: 'Em andamento', dot: 'rounded-full bg-accent-blue', text: 'text-accent-blue-soft' },
  concluido: { label: 'Concluído', dot: 'rounded-full bg-ok', text: 'text-ok' },
}

export const moduleStatusMeta: Record<ModuleStatus, { label: string; dot: string; text: string }> = {
  bloqueado: { label: 'Bloqueado', dot: 'rounded-full border border-[#5a5a5a]', text: 'text-fg-subtle' },
  'nao-iniciado': { label: 'Não iniciado', dot: 'rounded-full border border-[#6a6a6a]', text: 'text-fg-subtle' },
  'em-andamento': { label: 'Em andamento', dot: 'rounded-full bg-accent-blue', text: 'text-accent-blue-soft' },
  'aguardando-avaliacao': { label: 'Aguardando avaliação', dot: 'rounded-full bg-warn', text: 'text-warn' },
  aprovado: { label: 'Aprovado', dot: 'bg-ok rounded-[2px]', text: 'text-ok' },
  'precisa-revisar': { label: 'Precisa revisar', dot: 'rounded-full bg-bad', text: 'text-bad' },
}

/** Ordem da legenda exibida no topo da página. */
export const legend: { label: string; dot: string }[] = [
  { label: 'Não iniciado', dot: 'rounded-full border border-[#6a6a6a]' },
  { label: 'Em andamento', dot: 'rounded-full bg-accent-blue' },
  { label: 'Concluído', dot: 'rounded-full bg-ok' },
  { label: 'Aguardando avaliação', dot: 'rounded-full bg-warn' },
  { label: 'Aprovado', dot: 'bg-ok rounded-[2px]' },
  { label: 'Precisa revisar', dot: 'rounded-full bg-bad' },
]
