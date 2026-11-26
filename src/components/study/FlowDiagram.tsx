import type { Flow } from '../../types/roadmap'

/** Diagrama de fluxo em etapas numeradas, legível em qualquer largura. */
export function FlowDiagram({ flow }: { flow: Flow }) {
  return (
    <figure className="rounded-lg border border-line bg-surface p-4 sm:p-5">
      <figcaption className="mb-4 text-sm font-semibold text-fg">{flow.title}</figcaption>
      <ol className="flex flex-col">
        {flow.steps.map((step, i) => {
          const last = i === flow.steps.length - 1
          return (
            <li key={step.label} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#2e3b52] bg-[#060a11] font-mono text-[11px] text-accent-blue-soft">
                  {i + 1}
                </span>
                {!last && <span aria-hidden="true" className="w-px flex-1 bg-[#2e3b52]" />}
              </div>
              <div className={`flex min-w-0 flex-col gap-0.5 pt-1 ${last ? '' : 'pb-4'}`}>
                <span className="text-sm font-semibold text-fg">{step.label}</span>
                {step.detail && <span className="text-[13px] leading-relaxed text-fg-muted">{step.detail}</span>}
              </div>
            </li>
          )
        })}
      </ol>
      {flow.caption && <p className="mt-4 border-t border-line pt-3 text-[13px] leading-relaxed text-fg-subtle">{flow.caption}</p>}
    </figure>
  )
}
