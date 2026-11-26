import { moduleStatusMeta } from '../../lib/status'
import type { ModuleStatus } from '../../types/progress'
import { StatusDot } from './StatusDot'

export function ModuleStatusBadge({ status }: { status: ModuleStatus }) {
  const meta = moduleStatusMeta[status]
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] ${meta.text}`}>
      <StatusDot className={meta.dot} />
      {meta.label}
    </span>
  )
}
