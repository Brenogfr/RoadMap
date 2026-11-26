/** Ponto de status de 7px. O rótulo vem sempre em texto ao lado ou em aria-label. */
export function StatusDot({ className }: { className: string }) {
  return <span aria-hidden="true" className={`inline-block size-[7px] shrink-0 ${className}`} />
}
