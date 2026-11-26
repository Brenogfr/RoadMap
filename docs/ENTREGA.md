# Entrega: Roadmap Back-end Engineering

Resumo da Etapa 7: o que foi construído, como foi verificado e o que ainda falta.

## O que a ferramenta faz

- **Roadmap visual** de 10 módulos e 110 conteúdos, com conexões em SVG, cores por módulo,
  layout responsivo (lista no celular) e status discretos em cada card e módulo.
- **Aulas completas** (seções A–F): introdução, explicação técnica com código comentado
  linha por linha, fluxo, exemplo prático executável com testes para o Thunder Client,
  erros comuns e direcionamento de estudos com documentação oficial.
- **Checklist de aprendizagem** de 6 itens por conteúdo; um conteúdo só conta como
  concluído com os 6 marcados.
- **Avaliação técnica por módulo** (5 a 8 questões), corrigida em três passos sem IA:
  escolha automática, palavras-chave só como sinalização e critérios confirmados pela
  pessoa. Feedback com nota, pontos fortes, conceitos a melhorar, respostas que precisam
  de atenção, conteúdos para revisar e exercícios de reforço. Tentativas ilimitadas e
  histórico com o feedback de cada uma.
- **Regras de aprovação**: avaliação liberada com todos os conteúdos concluídos e o módulo
  anterior aprovado; aprovação com 70%; módulos futuros podem ser lidos.
- **Progresso no navegador** (LocalStorage), sincronizado entre abas, com botão
  "Continuar", retomada da leitura no ponto onde parou e backup em arquivo JSON
  (exportar e importar).
- **Página leve**: aulas, avaliações e o leitor de aulas são carregados sob demanda.

## Conteúdo publicado

| Módulo | Aulas | Avaliação | Exercício |
|---|---|---|---|
| 01 · Fundamentos de programação Back-end | 12 | 8 questões | Servidor de notas sem framework |
| 02 · NestJS e arquitetura inicial | 11 | 8 questões | Módulo de usuários do zero |
| 03 a 10 | estrutura (títulos e resumos) | a escrever | definido para cada módulo |

O Módulo 04 tem o projeto integrado (API de gerenciamento de produtos) definido.

## Estrutura do código

```
src/
├── types/          roadmap.ts (aulas), assessment.ts (avaliações), progress.ts (dados salvos)
├── data/           m01/, m02/ (uma aula por arquivo + avaliação), modules/outline.ts (03–10)
├── lib/            progress.ts e grading.ts (regras puras), backup.ts, prefetch.ts, scrolling.ts
├── hooks/          useProgress (LocalStorage), useLazy (carregamento sob demanda), useReadingPosition
└── components/     roadmap/, study/, assessment/, ui/
.claude/skills/conteudo-de-estudo/   como escrever e verificar aulas e avaliações
.github/workflows/ci.yml             CI: lint, testes e build
```

## Como foi verificado

**Código das aulas**
- Módulo 01: todos os exemplos e práticas executados com Node.js; servidores testados com
  as mesmas requisições indicadas para o Thunder Client; TypeScript strict sem erros.
- Módulo 02: compilado e executado em um projeto NestJS 12 real (ESM, TypeScript 6), com o
  tsconfig gerado pela CLI; requisições com curl e teste com Vitest. Mensagens de erro
  citadas nas aulas foram copiadas da execução real.
- Links de documentação conferidos (nodejs.org diretamente; MDN, TypeScript e NestJS pelos
  repositórios oficiais da documentação).

**Testes automatizados no repositório** (`npm test`, 39 testes)
- Regras de progresso, correção das avaliações e backup.
- Validação de todo o conteúdo publicado: ids únicos, lineNotes dentro do código, pesos dos
  critérios somando 1, palavras-chave normalizadas, links e regras das avaliações.

**Testes no navegador** (Playwright, durante o desenvolvimento)
- Navegação, abertura das aulas, checklists e persistência após recarregar: 25 cenários.
- Avaliações: liberação, reprovação, aprovação, nova tentativa, histórico, rascunho e
  desbloqueio do módulo seguinte: 28 cenários (Módulo 01) e 15 (Módulo 02).
- Retomada da leitura: 11 cenários. Backup: 13 cenários.
- Responsividade: sem rolagem horizontal em 390 px.

**Desempenho** (medido com trace do Chrome, CPU 4× mais lenta)
- JavaScript inicial: 288 KB (≈ 90 KB gzip). Cada aula: ≈ 5 KB gzip, baixada ao abrir.
- Rolagem do painel e do roadmap sem quadros descartados, depois de remover o desfoque de
  fundo, dar camada própria à área de rolagem e desligar o hover durante a rolagem.

## Publicação

O repositório é público para outros desenvolvedores estudarem e compartilharem. O CI
(`.github/workflows/ci.yml`) roda lint, testes e build a cada push e pull request. A publicação
no GitHub Pages fica para o futuro: o build já usa caminhos relativos e funciona em subcaminho,
então basta adicionar o passo de deploy ao workflow e ativar o Pages nas configurações.

## Limitações conhecidas

- O progresso fica no navegador; sem backup exportado, limpar os dados do site apaga tudo.
- A nota das questões abertas depende da honestidade na confirmação dos critérios.
- Exercícios e o projeto integrado não são corrigidos pela ferramenta (são práticos, feitos
  no seu ambiente).
- Os testes de navegador usados no desenvolvimento não fazem parte do repositório; o CI roda
  lint, testes unitários e de conteúdo, e o build.
- Alguns links complementares (RFCs, libuv, especificação ECMAScript) não puderam ser
  conferidos automaticamente.
- Conteúdo verificado com NestJS 12 e Node.js 22/24; versões futuras podem mudar mensagens
  e arquivos gerados.

## Próximos passos

1. Conteúdo dos Módulos 03 a 10, em lotes de um módulo, com a skill `conteudo-de-estudo`.
2. Depois de concluir boa parte da trilha: avaliar a inclusão de IA Aplicada, como previsto.
