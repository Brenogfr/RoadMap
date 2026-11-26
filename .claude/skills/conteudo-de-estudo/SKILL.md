---
name: conteudo-de-estudo
description: Escreve ou revisa aulas (seções A–F) e avaliações técnicas de um módulo do Roadmap Back-end, no formato do projeto, com código testado e sem pesar a página. Use ao publicar o conteúdo de um módulo (ex. "escrever as aulas do Módulo 02"), adicionar uma aula, criar ou ajustar a avaliação de um módulo, ou corrigir uma aula existente.
---

# Conteúdo de estudo

Uma aula ensina a pensar como Back-end Engineer: o que é, que problema resolve, como funciona
por dentro, como usar, como quebra e o que estudar em seguida. Profundidade vem antes de volume.

## Antes de escrever

1. Leia `src/types/roadmap.ts` (Lesson) e `src/types/assessment.ts` (Assessment).
2. Leia uma aula pronta inteira como referência de tom e profundidade
   (ex. `src/data/m01/event-loop.ts`) e `src/data/m01/assessment.ts`.
3. Confira os pré-requisitos: o conteúdo não pode depender de algo de um módulo posterior.
   Se depender, ajuste a ordem dos tópicos ou explique o mínimo necessário e aponte o módulo.

## Onde cada coisa fica (mantém a página leve)

- Cada aula é um arquivo `src/data/mNN/<slug>.ts` com `export default lesson` (tipo `Lesson`).
- A avaliação é `src/data/mNN/assessment.ts` com `export default assessment`.
- `src/data/mNN/index.ts` contém **só metadados** e loaders:
  `loadLesson: () => import('./slug').then((m) => m.default)` e
  `loadAssessment: () => import('./assessment').then((m) => m.default)`.
- Ao publicar um módulo, mova-o de `src/data/modules/outline.ts` para `src/data/mNN/index.ts`,
  mantendo `id`, títulos e o `practice` (exercício do módulo).
- Nunca importe arquivos de aula de forma estática fora dos loaders: isso coloca todo o
  conteúdo no carregamento inicial.
- Sem imagens, vídeos ou dependências novas para conteúdo. Diagramas usam `flows` (etapas).

## Aula: o que cada seção precisa ter

- **A · intro**: cinco respostas curtas e concretas (o que é, para que serve, qual problema
  resolve, por que existe, onde é usado). Sem frases genéricas.
- **B · technical**: 4–6 `internals` sobre o funcionamento real; 5–6 `concepts`;
  1–2 `examples` pequenos com `lineNotes` explicando as linhas que importam.
- **C · flows**: um fluxo de 5–7 etapas quando houver um processo a mostrar.
- **D · practice**: um projeto mínimo executável (estrutura, arquivos, `run`, resultado
  esperado). Use `httpTests` quando houver HTTP (Thunder Client) ou `verify` quando não houver.
- **E · commonErrors**: 4 erros reais, com a mensagem ou o sintoma que a pessoa vai ver.
- **F · guidance**: antes, agora e depois, mais documentação oficial.

Código em TypeScript, compatível com execução direta pelo Node.js (sem `enum`, `namespace`
ou parameter properties fora de projetos NestJS). Em aulas de NestJS, siga o projeto gerado pela
CLI atual (ESM, imports `.js`, Vitest) e compile com o tsconfig dela antes de publicar.
Mensagens de erro citadas nas aulas devem ser copiadas de uma execução real, nunca de memória. Strings sem crases internas; em template
literals, escape `\`` e `\${`.

## Avaliação: regras

- 5 a 8 questões, misturando `conceitual`, `analise-de-codigo`, `identificacao-de-erro`,
  `situacao-pratica` e `justificativa`. Priorize abertas com cenários reais.
- Questão de escolha: uma única correta, distratores plausíveis e `explanation` que explique
  por que cada alternativa está certa ou errada.
- Questão aberta: `expectedAnswer` completa; 2–4 `criteria` verificáveis cujos `weight`
  somam 1; `keywords` sem acento e minúsculas (só sinalizam, nunca corrigem).
- Toda questão tem `topicId` (para revisão) e `reinforcement` (exercício curto e executável).
- Não mude ids de questões ou critérios já publicados: tentativas salvas dependem deles.

## Verificação (obrigatória antes de concluir)

1. Extraia e rode o código: `node .claude/skills/conteudo-de-estudo/extrair-codigo.ts src/data/mNN/<slug>.ts /tmp/aula`
   e execute os exemplos e a prática. Servidores: suba, faça as requisições de `httpTests`
   (curl serve) e compare com o `expected`.
2. A saída do script mostra cada código numerado ao lado dos `lineNotes`: confira se cada
   número de linha aponta para a linha certa.
3. Rode o TypeScript strict nos arquivos extraídos (com `@types/node`).
4. Confirme cada link de documentação (status 200 ou o arquivo no repositório oficial da
   documentação). Sem confirmação, não publique o link.
5. `npm test` passa: `src/data/content.test.ts` valida ids, lineNotes, pesos dos critérios,
   palavras-chave e links de todo o conteúdo publicado.
6. `npm run build` e `npm run lint` sem erros. Confira o tamanho do JS inicial no build:
   ele não deve crescer quando só conteúdo foi adicionado.
7. Para avaliações, faça uma tentativa completa no navegador: todas erradas (nota baixa e
   feedback coerente) e todas certas com os critérios confirmados (100%).
