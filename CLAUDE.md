# Roadmap Back-end Engineering

Ferramenta pessoal de estudos de Back-end (JavaScript, TypeScript, Node.js, NestJS,
banco de dados, segurança, testes, arquitetura e infraestrutura). Uma única página:
roadmap visual, aulas, checklists, avaliações por módulo e progresso no navegador.

O objetivo pedagógico é aprender a pensar como Back-end Engineer, não acumular tecnologias.
Todo conteúdo novo deve servir a isso.

## Regras do projeto

- Uma página só. Sem back-end próprio, banco de dados, login, APIs externas ou integração com IA.
- Sem IA Aplicada nesta versão.
- Não adicionar dependências sem necessidade clara. Hoje: React, Tailwind CSS e lucide-react.
- **A página deve continuar leve.** Conteúdo (aulas e avaliações) é carregado sob demanda
  com `import()`; nunca importe uma aula de forma estática em código da interface.
  Referência atual do JS inicial: ~280 KB (~88 KB gzip). Se um build passar de ~300 KB,
  investigue antes de seguir.
- **Rolagem fluida:** não use `backdrop-filter`/`backdrop-blur` (nem sombras ou filtros
  animados) sobre áreas grandes ou que rolam: o navegador redesenha o efeito a cada quadro.
  Medido neste projeto: 50 ms por quadro com desfoque, 16,7 ms (60 fps) sem. Use fundos sólidos.
- A área rolável do painel tem fundo opaco e camada própria (`will-change: transform` no
  Drawer), e o painel não tem sombra grande: sem isso, em telas com escala 100% o Chrome
  repinta a página inteira a cada passo da rolagem.
- Hover é desligado durante a rolagem (`lib/scrolling.ts` + `html[data-rolando]` em
  `index.css`). Roadmap em CPU 4× mais lenta: 35 quadros descartados → 1.
- Pré-carregamento só em ocioso (`whenIdle` em `lib/prefetch.ts`): leitor de aulas e a próxima aula.
- Textos da interface e do conteúdo em português do Brasil.
- Acessibilidade: elementos interativos são `<button>`, `<a>`, `<input>` reais, com alvo de
  toque ≥ 44px, foco visível e rótulos. Contraste mínimo 4.5:1 no tema escuro.

## Comandos

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # tsc -b + vite build (sempre rode antes de commitar)
npm run lint     # oxlint
```

## Estrutura

```
src/
├── types/roadmap.ts      Module, Topic, Lesson (A–F), PracticeTask
├── types/assessment.ts   Assessment, ChoiceQuestion, OpenQuestion, Criterion
├── types/progress.ts     ProgressState salvo no LocalStorage, checklist, status
├── data/
│   ├── index.ts          ordem dos módulos
│   ├── m01/              index.ts (metadados + loaders), uma aula por arquivo, assessment.ts
│   └── modules/outline.ts  módulos ainda sem aulas (títulos, resumos, exercícios)
├── lib/progress.ts       regras de status (funções puras)
├── lib/grading.ts        nota e feedback (funções puras, determinísticas)
├── hooks/useProgress.ts  estado + LocalStorage (chave roadmap-backend:v1)
├── hooks/useLazy.ts      carregamento sob demanda com cache
└── components/           roadmap/, study/, assessment/, ui/
```

## Convenções importantes

- **Progresso:** só fatos são salvos (itens marcados, tentativas, último conteúdo).
  Status, totais e liberações são sempre calculados em `lib/progress.ts`.
  Mudança incompatível no formato salvo exige uma chave nova (`roadmap-backend:v2`) e migração.
- **Posição de leitura:** cada aula reabre onde parou (`hooks/useReadingPosition.ts`, chave
  `roadmap-backend:leitura`). É conveniência, separada do progresso; aula lida até o fim reabre no início.
  Não altere a altura do cabeçalho fixo do painel dinamicamente: quebra a posição salva e os atalhos de seção.
- **Conclusão:** um conteúdo só está concluído com os 6 itens do checklist marcados.
  A avaliação libera com todos os conteúdos concluídos e o módulo anterior aprovado (≥ 70%).
  Módulos futuros podem ser lidos; só a avaliação fica bloqueada.
- **Correção das avaliações (sem IA):** questões de escolha são automáticas; nas abertas,
  palavras-chave só sinalizam, e a pessoa confirma cada critério. Nunca marque critérios
  automaticamente nem apresente a correção como análise de IA.
- **Documentação:** links apenas para documentação oficial, e só depois de confirmar que o
  endereço existe. Nunca invente links.
- **Código das aulas:** todo exemplo e arquivo prático precisa rodar de verdade
  (Node.js 22.18+ executa `.ts` direto) e passar no TypeScript strict. Os números de linha
  citados em `lineNotes` devem bater com o código.

## Conteúdo publicado

- Módulo 01 (Fundamentos) e Módulo 02 (NestJS) completos, com avaliação.
- Módulos 03–10: estrutura em `src/data/modules/outline.ts`.

## NestJS nas aulas (a partir do Módulo 02)

- Versão de referência: NestJS 12 com a CLI 12. Projeto padrão é **ESM** (imports relativos
  terminam em `.js`) e os testes usam **Vitest** (`vi.fn()`, não `jest.fn()`).
- A CLI pergunta sobre o NestJS Observe; nas aulas a resposta é "não" e o `main.ts` não usa `instrument`.
- O projeto `tarefas-api` evolui aula a aula; cada prática mostra os arquivos completos que mudam.
- Para verificar, compile com o tsconfig gerado pela CLI (experimentalDecorators,
  emitDecoratorMetadata, module nodenext) e rode `node dist/main.js`. Mensagens de erro citadas
  nas aulas devem ser copiadas da execução real.

## Adicionar conteúdo

Use a skill `conteudo-de-estudo` (`.claude/skills/conteudo-de-estudo/`) para escrever aulas
e avaliações de um módulo: ela traz o formato, a ordem de trabalho e como verificar o código.

## Git

- `main` recebe só etapas validadas. Trabalhe em um branch (`etapa-N` ou `modulo-NN`).
- Mensagens de commit em português, descrevendo o que mudou e por quê.
