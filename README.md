# Roadmap Back-end Engineering

Ferramenta pessoal de estudos (Módulos 01 e 02 completos): roadmap visual da trilha de Back-end, com aulas
completas, exercícios, checklists de aprendizagem, avaliações técnicas por módulo
e progresso salvo no navegador. Página leve: cada aula e cada avaliação só são
baixadas quando abertas.

## Avaliações

Cada módulo tem uma avaliação de 5 a 8 questões, corrigida em três passos, sem IA:

1. Questões de escolha são corrigidas automaticamente.
2. Nas abertas, palavras-chave apenas sinalizam critérios prováveis.
3. Você compara sua resposta com a esperada e confirma cada critério atendido.

O feedback traz nota, pontos fortes, conceitos a melhorar, respostas que precisam de
atenção, conteúdos para revisar e exercícios de reforço. Tentativas são ilimitadas e
ficam no histórico do módulo.

## Progresso

- Cada conteúdo tem um checklist de 6 itens; ele só conta como concluído com os 6 marcados.
- A avaliação de um módulo é liberada quando todos os conteúdos estão concluídos
  e o módulo anterior foi aprovado (nota mínima de 70%).
- Módulos futuros podem ser lidos e estudados; só a avaliação fica bloqueada.
- Cada aula reabre no ponto em que você parou de ler, com um atalho para voltar ao início.
- Tudo é salvo no LocalStorage do navegador, na chave `roadmap-backend:v1`.
  Limpar os dados do site apaga o progresso.

## Requisitos

- Node.js 20.19+ ou 22.12+ (testado com a linha 24)

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente http://localhost:5173).

## Scripts

| Script            | O que faz                                  |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Servidor de desenvolvimento com hot reload |
| `npm run build`   | Verificação de tipos + build de produção   |
| `npm run preview` | Serve o build de produção localmente       |
| `npm run lint`    | Lint com oxlint                            |

## Estrutura

```
src/
├── types/roadmap.ts        Tipos do conteúdo (módulo, aula, exercício)
├── data/
│   ├── index.ts            Ordem dos módulos
│   ├── m01/                Módulo 01: metadados, uma aula por arquivo e a avaliação
│   └── modules/outline.ts  Módulos 02–10: estrutura e exercícios
├── hooks/useProgress.ts    Estado de progresso + LocalStorage
├── lib/progress.ts         Regras de status (funções puras)
├── lib/grading.ts          Nota e feedback das avaliações (funções puras)
├── lib/                    Cores, layout, status e realce de sintaxe
└── components/
    ├── roadmap/            Cabeçalho, módulos, cards e conexões
    ├── study/              Painel de estudo e seções A–F
    ├── assessment/         Avaliação, correção e feedback
    └── ui/                 Drawer (painel lateral)
```

Para adicionar ou corrigir uma aula, edite apenas os arquivos em `src/data/`.
Os componentes só renderizam o conteúdo. Com o Claude Code, a skill
`conteudo-de-estudo` (em `.claude/skills/`) descreve o formato e a verificação.
