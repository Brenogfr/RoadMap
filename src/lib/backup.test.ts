import { describe, expect, it } from 'vitest'
import { createBackup, readBackup } from './backup'
import { emptyProgress } from './progress'

describe('backup do progresso', () => {
  it('lê de volta o que exporta', () => {
    const state = { ...emptyProgress(), checklists: { a: ['conceito' as const] } }
    const result = readBackup(JSON.stringify(createBackup(state)))
    expect(result.ok && result.progresso.checklists).toEqual({ a: ['conceito'] })
  })

  it('recusa arquivos inválidos com mensagem clara', () => {
    expect(readBackup('{ ruim')).toEqual({ ok: false, erro: 'O arquivo não é um JSON válido.' })
    expect(readBackup('{"app":"outro"}')).toMatchObject({ ok: false })
    expect(readBackup('{"app":"roadmap-backend","progresso":{"version":9}}')).toMatchObject({ ok: false })
  })
})
