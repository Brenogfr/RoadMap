import { Download, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { backupFileName, createBackup, describeProgress, readBackup } from '../../lib/backup'
import type { ProgressState } from '../../types/progress'
import type { Module } from '../../types/roadmap'

interface ProgressBackupProps {
  progress: ProgressState
  modules: Module[]
  onImport: (next: ProgressState) => void
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

/** Rodapé discreto com exportar/importar o progresso. */
export function ProgressBackup({ progress, modules, onImport }: ProgressBackupProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ tone: 'ok' | 'erro'; text: string } | null>(null)

  const exportar = () => {
    const blob = new Blob([JSON.stringify(createBackup(progress), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = backupFileName()
    link.click()
    URL.revokeObjectURL(url)
    setMessage({ tone: 'ok', text: 'Backup exportado. Guarde o arquivo em um lugar seguro.' })
  }

  const importar = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const result = readBackup(await file.text())
    if (!result.ok) {
      setMessage({ tone: 'erro', text: result.erro })
      return
    }
    const quando = result.exportadoEm ? ` (exportado em ${dateFormat.format(new Date(result.exportadoEm))})` : ''
    const confirmado = window.confirm(
      `Substituir o progresso atual (${describeProgress(progress, modules)}) pelo do arquivo${quando}: ${describeProgress(result.progresso, modules)}?`,
    )
    if (!confirmado) return
    onImport(result.progresso)
    setMessage({ tone: 'ok', text: 'Progresso importado com sucesso.' })
  }

  return (
    <footer className="flex flex-col items-center gap-3 border-t border-line pt-8 text-center">
      <p className="max-w-xl text-[13px] leading-relaxed text-fg-subtle">
        Seu progresso fica salvo só neste navegador. Exporte um backup para continuar em outro computador ou não perder nada se os dados do
        site forem apagados.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={exportar}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-line-strong px-4 text-sm text-fg-muted transition-colors hover:bg-raised hover:text-fg"
        >
          <Download aria-hidden="true" className="size-4" />
          Exportar progresso
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-line-strong px-4 text-sm text-fg-muted transition-colors hover:bg-raised hover:text-fg"
        >
          <Upload aria-hidden="true" className="size-4" />
          Importar progresso
        </button>
        <input ref={inputRef} type="file" accept="application/json,.json" onChange={importar} className="hidden" aria-hidden="true" tabIndex={-1} />
      </div>
      <p role="status" className={`min-h-5 text-[13px] ${message?.tone === 'erro' ? 'text-bad' : 'text-ok'}`}>
        {message?.text}
      </p>
    </footer>
  )
}
