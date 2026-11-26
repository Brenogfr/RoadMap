# Roadmap Back-end Engineering

Ferramenta pessoal de estudos: roadmap visual da trilha de Back-end, com aulas
completas, exercícios, checklists de aprendizagem e progresso salvo no navegador.
As avaliações técnicas por módulo chegam na próxima etapa.

## Progresso

- Cada conteúdo tem um checklist de 6 itens; ele só conta como concluído com os 6 marcados.
- A avaliação de um módulo é liberada quando todos os conteúdos estão concluídos
  e o módulo anterior foi aprovado (nota mínima de 70%).
- Módulos futuros podem ser lidos e estudados; só a avaliação fica bloqueada.
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
│   ├── m01/                Módulo 01: uma aula por arquivo
│   └── modules/outline.ts  Módulos 02–10: estrutura e exercícios
├── hooks/useProgress.ts    Estado de progresso + LocalStorage
├── lib/progress.ts         Regras de status (funções puras)
├── lib/                    Cores, layout, status e realce de sintaxe
└── components/
    ├── roadmap/            Cabeçalho, módulos, cards e conexões
    ├── study/              Painel de estudo e seções A–F
    └── ui/                 Drawer (painel lateral)
```

Para adicionar ou corrigir uma aula, edite apenas os arquivos em `src/data/`.
Os componentes só renderizam o conteúdo.
