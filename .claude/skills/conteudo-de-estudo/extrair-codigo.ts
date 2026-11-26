// Extrai os exemplos e os arquivos práticos de uma aula para uma pasta, para poder executá-los,
// e imprime cada código numerado ao lado dos lineNotes para conferir a numeração.
//
// Uso: node .claude/skills/conteudo-de-estudo/extrair-codigo.ts src/data/m01/promises.ts /tmp/aula
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const [arquivo, destino] = process.argv.slice(2)
if (!arquivo || !destino) {
  console.error('Uso: node extrair-codigo.ts <arquivo-da-aula.ts> <pasta-de-destino>')
  process.exit(1)
}

interface Amostra {
  filename?: string
  language: string
  code: string
  lineNotes?: { line: string; note: string }[]
}

const { default: aula } = (await import(pathToFileURL(resolve(arquivo)).href)) as {
  default: {
    technical: { examples: { title: string; sample: Amostra }[] }
    practice: { files: { path: string; sample: Amostra }[] }
  }
}

function gravar(caminho: string, conteudo: string) {
  mkdirSync(dirname(caminho), { recursive: true })
  writeFileSync(caminho, conteudo + '\n')
}

for (const f of aula.practice.files) gravar(join(destino, 'pratica', f.path), f.sample.code)
aula.technical.examples.forEach((ex, i) => {
  gravar(join(destino, 'exemplos', ex.sample.filename ?? `exemplo-${i}.${ex.sample.language}`), ex.sample.code)
})

function mostrar(rotulo: string, amostra: Amostra) {
  if (!amostra.lineNotes?.length) return
  console.log(`\n=== ${rotulo}`)
  amostra.code.split('\n').forEach((linha, i) => console.log(String(i + 1).padStart(3) + '  ' + linha))
  for (const n of amostra.lineNotes) console.log(`  L${n.line}: ${n.note}`)
}

aula.technical.examples.forEach((ex) => mostrar(ex.title, ex.sample))
aula.practice.files.forEach((f) => mostrar(f.path, f.sample))
console.log(`\nArquivos gravados em ${resolve(destino)}`)
