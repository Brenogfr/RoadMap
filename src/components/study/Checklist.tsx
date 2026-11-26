import { Check, CircleCheck } from 'lucide-react'
import { CHECKLIST_SIZE } from '../../lib/progress'
import { CHECKLIST_ITEMS, type ChecklistItemId } from '../../types/progress'

interface ChecklistProps {
  checked: ChecklistItemId[]
  onToggle: (itemId: ChecklistItemId) => void
  /** Sem aula escrita, não há o que marcar. */
  disabled?: boolean
}

export function Checklist({ checked, onToggle, disabled = false }: ChecklistProps) {
  const done = checked.length >= CHECKLIST_SIZE
  return (
    <section
      id="checklist"
      aria-labelledby="checklist-titulo"
      className={`scroll-mt-44 flex flex-col gap-4 rounded-xl border p-5 sm:p-6 ${
        done ? 'border-[#1d3a2a] bg-[#06100a]' : 'border-line bg-surface'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 id="checklist-titulo" className="font-display text-lg font-semibold">
          Checklist de aprendizagem
        </h3>
        <span className={`font-mono text-sm ${done ? 'text-ok' : 'text-accent-blue-soft'}`}>
          {checked.length} / {CHECKLIST_SIZE}
        </span>
      </div>
      <p className="text-[13.5px] leading-relaxed text-fg-muted">
        {disabled
          ? 'O checklist fica disponível quando a aula deste conteúdo for publicada.'
          : 'Marque com honestidade. O conteúdo só conta como concluído com os seis itens marcados.'}
      </p>
      <ul className="flex flex-col gap-1">
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = checked.includes(item.id)
          return (
            <li key={item.id}>
              <label
                className={`flex min-h-11 items-center gap-3 rounded-md px-2 text-[14.5px] transition-colors ${
                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-raised'
                } ${isChecked ? 'text-fg' : 'text-fg-muted'}`}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isChecked}
                  disabled={disabled}
                  onChange={() => onToggle(item.id)}
                />
                <span
                  aria-hidden="true"
                  className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-blue ${
                    isChecked ? 'border-accent-blue bg-accent-blue text-ink' : 'border-line-strong bg-ink'
                  }`}
                >
                  {isChecked && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                {item.label}
              </label>
            </li>
          )
        })}
      </ul>
      {done && (
        <p className="flex items-center gap-2 text-sm font-medium text-ok">
          <CircleCheck aria-hidden="true" className="size-4" />
          Conteúdo concluído
        </p>
      )}
    </section>
  )
}
