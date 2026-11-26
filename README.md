# Roadmap Back-end Engineering

Ferramenta pessoal de estudos: roadmap visual da trilha de Back-end, com aulas
completas, exercícios e (nas próximas etapas) checklists, progresso e avaliações.

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
│   ├── m01/                Módulo 01: uma aula por arquivo
│   └── modules/outline.ts  Módulos 02–10: estrutura e exercícios
├── lib/                    Cores, layout e realce de sintaxe
└── components/
    ├── roadmap/            Cabeçalho, módulos, cards e conexões
    ├── study/              Painel de estudo e seções A–F
    └── ui/                 Drawer (painel lateral)
```

Para adicionar ou corrigir uma aula, edite apenas os arquivos em `src/data/`.
Os componentes só renderizam o conteúdo.
