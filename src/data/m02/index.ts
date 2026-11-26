import type { Module } from '../../types/roadmap'

/**
 * Módulo 02. Só metadados e loaders; aulas e avaliação são carregadas sob demanda.
 *
 * Ordem ajustada aos pré-requisitos: Constructors e Private/Readonly vêm antes de
 * Providers e Dependency Injection, porque explicam a linha
 * constructor(private readonly service: Service) usada desde a aula de Controllers.
 * Todo o código das aulas foi verificado com NestJS 12 (ESM) e TypeScript 6.
 */
export const m02: Module = {
  id: 'm02',
  number: 2,
  title: 'NestJS e arquitetura inicial',
  label: 'NestJS',
  accent: 'gold',
  description:
    'Como um framework organiza uma aplicação Node.js em módulos, controllers e providers, e por que a injeção de dependência muda a forma de escrever código. Ao longo das aulas, o projeto tarefas-api é construído passo a passo.',
  topics: [
    {
      id: 'm02-estrutura',
      title: 'Estrutura de um projeto NestJS',
      summary: 'O que cada arquivo e pasta gerados pela CLI faz.',
      loadLesson: () => import('./estrutura').then((m) => m.default),
    },
    {
      id: 'm02-appmodule',
      title: 'AppModule',
      summary: 'O módulo raiz e como ele compõe a aplicação.',
      loadLesson: () => import('./appmodule').then((m) => m.default),
    },
    {
      id: 'm02-feature-modules',
      title: 'Feature Modules',
      summary: 'Dividir a aplicação por domínio, com fronteiras explícitas.',
      loadLesson: () => import('./feature-modules').then((m) => m.default),
    },
    {
      id: 'm02-controllers',
      title: 'Controllers',
      summary: 'Receber requisições e devolver respostas, sem regra de negócio.',
      loadLesson: () => import('./controllers').then((m) => m.default),
    },
    {
      id: 'm02-services',
      title: 'Services',
      summary: 'Onde a regra de negócio mora e por quê.',
      loadLesson: () => import('./services').then((m) => m.default),
    },
    {
      id: 'm02-constructors',
      title: 'Constructors',
      summary: 'TypeScript aplicado à DI: como o Nest lê o construtor.',
      loadLesson: () => import('./constructors').then((m) => m.default),
    },
    {
      id: 'm02-private-readonly',
      title: 'Private e Readonly',
      summary: 'O que esses modificadores garantem, e o que não garantem.',
      loadLesson: () => import('./private-readonly').then((m) => m.default),
    },
    {
      id: 'm02-providers',
      title: 'Providers',
      summary: 'Tudo o que o Nest sabe criar e injetar: classes, valores, factories e tokens.',
      loadLesson: () => import('./providers').then((m) => m.default),
    },
    {
      id: 'm02-di',
      title: 'Dependency Injection',
      summary: 'O container, o grafo de dependências e a troca de providers em testes.',
      loadLesson: () => import('./di').then((m) => m.default),
    },
    {
      id: 'm02-decorators',
      title: 'Decorators',
      summary: 'O que @Controller, @Get e @Injectable realmente fazem.',
      loadLesson: () => import('./decorators').then((m) => m.default),
    },
    {
      id: 'm02-fluxo',
      title: 'Fluxo de uma requisição no NestJS',
      summary: 'Middleware, guards, interceptors, pipes, controller e filters, na ordem.',
      loadLesson: () => import('./fluxo').then((m) => m.default),
    },
  ],
  practice: {
    kind: 'exercise',
    title: 'Módulo de usuários do zero',
    description:
      'Sem copiar o código de tarefas, criar no tarefas-api um feature module de usuários aplicando tudo o que o módulo ensinou: fronteiras entre módulos, regras no service, providers com token, testes e um componente do pipeline.',
    requirements: [
      'UsuariosModule com controller e service gerados pela CLI: GET /usuarios, GET /usuarios/:id e POST /usuarios (nome e e-mail).',
      'Regra no service: e-mail único, sem diferenciar maiúsculas (409 se repetido).',
      'Um provider de configuração com token (Symbol) para o máximo de usuários, lido de uma variável de ambiente.',
      'UsuariosService exportado e usado pelo RelatoriosModule para incluir o total de usuários no resumo.',
      'Um guard aplicado só ao controller de usuários com @UseGuards, que recusa requisições sem o header X-Cliente (400).',
      'Um teste com Test.createTestingModule cobrindo a regra de e-mail único e o limite configurado.',
    ],
    doneWhen: [
      'O controller de usuários não tem nenhuma regra de negócio.',
      'Nenhum new de service ou de configuração dentro das classes: tudo chega pelo construtor.',
      'Remover o exports do UsuariosModule impede a aplicação de subir, e você sabe explicar por quê.',
      'Você consegue descrever a ordem em que guard, pipe, controller e service rodam em POST /usuarios.',
    ],
    hints: [
      'nest g module usuarios, nest g controller usuarios --no-spec e nest g service usuarios.',
      'Reaproveite o formato do tarefas.tokens.ts para os tokens do módulo novo.',
    ],
  },
  loadAssessment: () => import('./assessment').then((m) => m.default),
}
