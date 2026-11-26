import type { Module } from '../../types/roadmap'

/**
 * Módulo 03. Só metadados e loaders; aulas e avaliação são carregadas sob demanda.
 *
 * Ordem ajustada aos pré-requisitos: Class Validator e Class Transformer vêm antes do
 * ValidationPipe, que usa os dois; ForbidNonWhitelisted completa a Whitelist; e
 * Create/Update DTO vem depois de Transform, porque o Update DTO herda @Transform e
 * depende das opções do pipe. Todo o código foi verificado com NestJS 12 (ESM),
 * class-validator 0.15, class-transformer 0.5 e @nestjs/mapped-types 12.
 */
export const m03: Module = {
  id: 'm03',
  number: 3,
  title: 'DTOs e validação',
  label: 'DTOs e validação',
  accent: 'purple',
  description:
    'Nunca confiar no que chega do cliente: definir o formato esperado dos dados, validar na entrada e responder com erros claros. O tarefas-api ganha DTOs, o ValidationPipe e um formato de erro único.',
  topics: [
    {
      id: 'm03-dtos',
      title: 'O que são DTOs',
      summary: 'Objetos que descrevem o formato dos dados que entram e saem.',
      loadLesson: () => import('./dtos').then((m) => m.default),
    },
    {
      id: 'm03-class-validator',
      title: 'Class Validator',
      summary: 'Decorators de validação declarativa.',
      loadLesson: () => import('./class-validator').then((m) => m.default),
    },
    {
      id: 'm03-class-transformer',
      title: 'Class Transformer',
      summary: 'Transformar JSON puro em instâncias de classe.',
      loadLesson: () => import('./class-transformer').then((m) => m.default),
    },
    {
      id: 'm03-validationpipe',
      title: 'ValidationPipe',
      summary: 'Onde e quando a validação acontece no Nest.',
      loadLesson: () => import('./validationpipe').then((m) => m.default),
    },
    {
      id: 'm03-whitelist',
      title: 'Whitelist',
      summary: 'Remover propriedades que o DTO não declara.',
      loadLesson: () => import('./whitelist').then((m) => m.default),
    },
    {
      id: 'm03-forbid',
      title: 'ForbidNonWhitelisted',
      summary: 'Rejeitar requisições com campos desconhecidos.',
      loadLesson: () => import('./forbid').then((m) => m.default),
    },
    {
      id: 'm03-transform',
      title: 'Transform',
      summary: 'Converter tipos automaticamente (string → number).',
      loadLesson: () => import('./transform').then((m) => m.default),
    },
    {
      id: 'm03-create-update',
      title: 'Create DTO e Update DTO',
      summary: 'Por que criação e atualização têm regras diferentes.',
      loadLesson: () => import('./create-update').then((m) => m.default),
    },
    {
      id: 'm03-validacao',
      title: 'Validação de dados',
      summary: 'Regras de negócio x regras de formato.',
      loadLesson: () => import('./validacao').then((m) => m.default),
    },
    {
      id: 'm03-respostas-invalidas',
      title: 'Tratamento de respostas inválidas',
      summary: 'Mensagens de erro úteis e consistentes.',
      loadLesson: () => import('./respostas-invalidas').then((m) => m.default),
    },
  ],
  practice: {
    kind: 'exercise',
    title: 'Cadastro de usuários validado',
    description:
      'Aplicar ao módulo de usuários, criado no exercício do Módulo 02, tudo o que este módulo ensinou: DTOs de criação, atualização e consulta, regras de formato no DTO, regras de negócio no service e o formato de erro único.',
    requirements: [
      'CriarUsuarioDto: nome obrigatório (2 a 60 caracteres, aparado) e e-mail válido (@IsEmail), convertido para minúsculas.',
      'AtualizarUsuarioDto com PartialType e skipNullProperties: false, e a rota PATCH /usuarios/:id.',
      'ListarUsuariosQuery com ?limite opcional: inteiro de 1 a 50, convertido de texto para número.',
      'E-mail único conferido no service, também no PATCH (ignorando o próprio usuário): 409.',
      'Mensagens em português para todas as regras dos DTOs de usuários.',
    ],
    doneWhen: [
      'POST /usuarios com um campo extra (como "admin": true) responde 400 no formato { mensagem, erros }.',
      '{ "nome": null } no PATCH responde 400, e não 500.',
      '?limite=abc e ?limite=0 respondem 400; ?limite=2 devolve no máximo 2 usuários.',
      'Você sabe dizer, para cada regra, se ela é de formato (DTO, 400) ou de negócio (service, 409).',
    ],
    hints: [
      'O pipe global da aula de respostas inválidas já vale para os controllers de usuários: não registre outro.',
      'Para o e-mail em minúsculas, use @Transform como no título das tarefas, conferindo o tipo antes.',
    ],
  },
  loadAssessment: () => import('./assessment').then((m) => m.default),
}
