import { ArrowUpRight, Terminal } from 'lucide-react'
import type { ReactNode } from 'react'
import { LESSON_SECTIONS, sectionDomId, type SectionId } from '../../lib/layout'
import type { DocLink, Lesson } from '../../types/roadmap'
import { CodeBlock } from './CodeBlock'
import { FlowDiagram } from './FlowDiagram'
import { HttpTestCard } from './HttpTestCard'

function Section({ id, children }: { id: SectionId; children: ReactNode }) {
  const meta = LESSON_SECTIONS.find((s) => s.id === id)!
  return (
    <section id={sectionDomId(id)} aria-labelledby={`${sectionDomId(id)}-titulo`} className="scroll-mt-44 flex flex-col gap-5">
      <h3 id={`${sectionDomId(id)}-titulo`} className="flex items-center gap-3 font-display text-xl font-semibold">
        <span className="flex size-7 items-center justify-center rounded-md border border-line-strong font-mono text-xs text-fg-muted">
          {meta.letter}
        </span>
        {meta.title}
      </h3>
      {children}
    </section>
  )
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h4 className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">{children}</h4>
}

function Prose({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-[1.7] text-[#cfcfcf]">{children}</p>
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[14px] leading-relaxed text-[#cfcfcf]">
          <span aria-hidden="true" className="mt-[9px] size-1 shrink-0 rounded-full bg-fg-subtle" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function LinkList({ links }: { links: DocLink[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {links.map((link) => (
        <li key={link.url}>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex min-h-8 items-center gap-1.5 text-[14px] text-accent-blue-soft hover:text-[#a9c9fa]"
          >
            {link.label}
            <ArrowUpRight aria-hidden="true" className="size-3.5 opacity-70 group-hover:opacity-100" />
          </a>
        </li>
      ))}
    </ul>
  )
}

export function LessonView({ lesson }: { lesson: Lesson }) {
  const { intro, technical, flows, practice, commonErrors, guidance } = lesson

  const introItems: [string, string][] = [
    ['O que é?', intro.whatIs],
    ['Para que serve?', intro.purpose],
    ['Qual problema resolve?', intro.problem],
    ['Por que existe?', intro.whyExists],
    ['Onde é utilizado?', intro.whereUsed],
  ]

  return (
    <div className="flex flex-col gap-14">
      <Section id="a">
        <dl className="flex flex-col gap-5">
          {introItems.map(([q, a]) => (
            <div key={q} className="flex flex-col gap-1.5">
              <dt className="text-sm font-semibold text-fg">{q}</dt>
              <dd className="text-[15px] leading-[1.7] text-[#cfcfcf]">{a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="b">
        <div className="flex flex-col gap-3">
          <SubHeading>Funcionamento interno</SubHeading>
          <BulletList items={technical.internals} />
        </div>
        <div className="flex flex-col gap-3">
          <SubHeading>Conceitos importantes</SubHeading>
          <dl className="grid gap-3 sm:grid-cols-2">
            {technical.concepts.map((c) => (
              <div key={c.term} className="rounded-lg border border-line bg-surface p-4">
                <dt className="font-mono text-[13px] text-accent-blue-soft">{c.term}</dt>
                <dd className="mt-1.5 text-[13.5px] leading-relaxed text-fg-muted">{c.description}</dd>
              </div>
            ))}
          </dl>
        </div>
        {technical.examples.map((ex) => (
          <div key={ex.title} className="flex flex-col gap-3">
            <SubHeading>Exemplo · {ex.title}</SubHeading>
            {ex.description && <Prose>{ex.description}</Prose>}
            <CodeBlock sample={ex.sample} />
          </div>
        ))}
      </Section>

      <Section id="c">
        {flows && flows.length > 0 ? (
          flows.map((flow) => <FlowDiagram key={flow.title} flow={flow} />)
        ) : (
          <Prose>Este conceito não tem um fluxo de execução próprio; veja os exemplos da seção B.</Prose>
        )}
      </Section>

      <Section id="d">
        <Prose>{practice.goal}</Prose>
        <div className="flex flex-col gap-3">
          <SubHeading>Estrutura de pastas</SubHeading>
          <CodeBlock sample={{ language: 'text', code: practice.structure, filename: 'Estrutura' }} />
        </div>
        {practice.files.map((file) => (
          <div key={file.path} className="flex flex-col gap-3">
            <SubHeading>{file.path}</SubHeading>
            <Prose>{file.purpose}</Prose>
            <CodeBlock sample={{ ...file.sample, filename: file.sample.filename ?? file.path }} />
          </div>
        ))}
        <div className="flex flex-col gap-3">
          <SubHeading>Como executar</SubHeading>
          <ul className="flex flex-col gap-2">
            {practice.run.map((cmd) =>
              cmd.startsWith('#') ? (
                <li key={cmd} className="pt-1 text-[13px] leading-relaxed text-fg-subtle">
                  {cmd.replace(/^#\s*/, '')}
                </li>
              ) : (
                <li key={cmd}>
                  <code className="flex min-w-0 items-center gap-2 overflow-x-auto rounded-md border border-line bg-ink px-3 py-2 font-mono text-[13px] text-fg">
                    <Terminal aria-hidden="true" className="size-3.5 shrink-0 text-fg-subtle" />
                    <span className="whitespace-pre">{cmd}</span>
                  </code>
                </li>
              ),
            )}
          </ul>
        </div>
        {practice.httpTests && practice.httpTests.length > 0 && (
          <div className="flex flex-col gap-3">
            <SubHeading>Como testar no Thunder Client</SubHeading>
            <Prose>
              No VS Code, abra o Thunder Client, clique em New Request, escolha o método, cole a URL e, quando houver corpo,
              selecione a aba Body → JSON. Clique em Send e compare com o resultado esperado.
            </Prose>
            {practice.httpTests.map((test) => (
              <HttpTestCard key={test.method + test.url + (test.body ?? '')} test={test} />
            ))}
          </div>
        )}
        {practice.verify && (
          <div className="flex flex-col gap-3">
            <SubHeading>Como verificar</SubHeading>
            <Prose>{practice.verify}</Prose>
          </div>
        )}
        <div className="rounded-lg border border-[#1d3a2a] bg-[#06100a] p-4">
          <SubHeading>Resultado esperado</SubHeading>
          <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-[#cfcfcf]">{practice.expected}</p>
        </div>
      </Section>

      <Section id="e">
        <div className="flex flex-col gap-3">
          {commonErrors.map((err) => (
            <div key={err.title} className="flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-4">
              <span className="text-[15px] font-semibold text-fg">{err.title}</span>
              <dl className="grid gap-2 text-[13.5px] leading-relaxed sm:grid-cols-[110px_minmax(0,1fr)]">
                <dt className="text-fg-subtle">Como aparece</dt>
                <dd className="text-[#cfcfcf]">{err.symptom}</dd>
                <dt className="text-fg-subtle">Causa</dt>
                <dd className="text-[#cfcfcf]">{err.cause}</dd>
                <dt className="text-fg-subtle">Correção</dt>
                <dd className="text-[#cfcfcf]">{err.fix}</dd>
              </dl>
            </div>
          ))}
        </div>
      </Section>

      <Section id="f">
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ['Estude antes', guidance.before],
              ['Estude agora', guidance.now],
              ['Estude depois', guidance.after],
            ] as const
          ).map(([label, items]) => (
            <div key={label} className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
              <SubHeading>{label}</SubHeading>
              <BulletList items={items} />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <SubHeading>Documentação oficial</SubHeading>
          <LinkList links={guidance.officialDocs} />
        </div>
        {guidance.complementary && guidance.complementary.length > 0 && (
          <div className="flex flex-col gap-3">
            <SubHeading>Materiais complementares</SubHeading>
            <LinkList links={guidance.complementary} />
          </div>
        )}
      </Section>
    </div>
  )
}
