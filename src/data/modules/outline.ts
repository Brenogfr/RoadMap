import type { Module, PracticeTask, Topic } from '../../types/roadmap'

/**
 * Módulos 02 a 10: estrutura (títulos, resumos, exercícios).
 * As aulas completas serão adicionadas em lotes, módulo a módulo.
 */

const t = (id: string, title: string, summary: string): Topic => ({ id, title, summary })

const exercise = (task: Omit<PracticeTask, 'kind'>): PracticeTask => ({ kind: 'exercise', ...task })

export const m03: Module = {
  id: 'm03',
  number: 3,
  title: 'DTOs e validação',
  label: 'DTOs e validação',
  accent: 'purple',
  description:
    'Nunca confiar no que chega do cliente: definir o formato esperado dos dados, validar na entrada e responder com erros claros.',
  topics: [
    t('m03-dtos', 'O que são DTOs', 'Objetos que descrevem o formato dos dados que entram e saem.'),
    t('m03-create-update', 'Create DTO e Update DTO', 'Por que criação e atualização têm regras diferentes.'),
    t('m03-class-validator', 'Class Validator', 'Decorators de validação declarativa.'),
    t('m03-class-transformer', 'Class Transformer', 'Transformar JSON puro em instâncias de classe.'),
    t('m03-validationpipe', 'ValidationPipe', 'Onde e quando a validação acontece no Nest.'),
    t('m03-whitelist', 'Whitelist', 'Remover propriedades que o DTO não declara.'),
    t('m03-transform', 'Transform', 'Converter tipos automaticamente (string → number).'),
    t('m03-forbid', 'ForbidNonWhitelisted', 'Rejeitar requisições com campos desconhecidos.'),
    t('m03-validacao', 'Validação de dados', 'Regras de negócio x regras de formato.'),
    t('m03-respostas-invalidas', 'Tratamento de respostas inválidas', 'Mensagens de erro úteis e consistentes.'),
  ],
  practice: exercise({
    title: 'Cadastro validado',
    description: 'Adicionar DTOs validados ao módulo de tarefas do exercício anterior.',
    requirements: [
      'CreateTarefaDto com título obrigatório (3 a 80 caracteres) e prioridade entre 1 e 5.',
      'UpdateTarefaDto com todos os campos opcionais.',
      'ValidationPipe global com whitelist, forbidNonWhitelisted e transform.',
    ],
    doneWhen: [
      'POST com campo extra retorna 400 com mensagem clara.',
      'Prioridade enviada como "3" chega ao service como número.',
      'Você sabe dizer qual erro é de formato e qual seria de regra de negócio.',
    ],
  }),
}

export const m04: Module = {
  id: 'm04',
  number: 4,
  title: 'APIs REST e CRUD',
  label: 'APIs REST',
  accent: 'blue',
  description:
    'Projetar recursos, rotas e respostas seguindo REST, e construir um CRUD completo com paginação, filtros e ordenação.',
  topics: [
    t('m04-rest', 'REST', 'Recursos, representações e as restrições do estilo REST.'),
    t('m04-endpoints', 'Endpoints', 'Nomear rotas por recurso, não por ação.'),
    t('m04-get', 'GET', 'Ler recursos sem efeitos colaterais.'),
    t('m04-post', 'POST', 'Criar recursos e responder 201 com Location.'),
    t('m04-patch', 'PATCH', 'Atualização parcial.'),
    t('m04-put', 'PUT', 'Substituição completa e idempotência.'),
    t('m04-delete', 'DELETE', 'Remover recursos e responder 204.'),
    t('m04-route-params', 'Parâmetros de rota', 'Identificar um recurso específico: /produtos/:id.'),
    t('m04-query', 'Query Parameters', 'Filtrar, buscar e paginar coleções.'),
    t('m04-body', 'Request Body', 'Enviar dados estruturados ao servidor.'),
    t('m04-response', 'Response', 'Formato consistente de respostas e erros.'),
    t('m04-paginacao', 'Paginação', 'Offset x cursor, e por que nunca devolver tudo.'),
    t('m04-filtros', 'Filtros', 'Filtros combináveis e seguros.'),
    t('m04-ordenacao', 'Ordenação', 'Ordenar por campos permitidos, não por qualquer campo.'),
  ],
  practice: {
    kind: 'project',
    title: 'API de gerenciamento de produtos',
    description:
      'Projeto integrado dos Módulos 01 a 04: uma API REST completa de produtos em NestJS, ainda com armazenamento em memória. Ela será evoluída nos módulos seguintes com banco de dados, autenticação e testes.',
    requirements: [
      'CRUD completo de produtos: GET /produtos, GET /produtos/:id, POST, PATCH, PUT e DELETE.',
      'DTOs validados para criação e atualização (nome, preço, estoque, categoria).',
      'Paginação (page, limit) com limite máximo, filtros por categoria e faixa de preço.',
      'Ordenação apenas por campos permitidos (nome, preço, criadoEm).',
      'Status codes corretos: 200, 201, 204, 400, 404 e 409 para nome duplicado.',
      'Formato de erro consistente em toda a API.',
      'Coleção de requisições no Thunder Client cobrindo sucesso e erro.',
    ],
    doneWhen: [
      'Todas as rotas respondem com o status code correto para sucesso e erro.',
      'Nenhuma regra de negócio dentro dos controllers.',
      'Uma requisição com limit=10000 não devolve 10000 itens.',
      'Você consegue justificar cada decisão de rota e de status code.',
    ],
    hints: [
      'Comece pelo desenho das rotas e respostas antes de escrever código.',
      'Separe o formato de resposta paginada em um tipo reutilizável.',
    ],
  },
}

export const m05: Module = {
  id: 'm05',
  number: 5,
  title: 'Banco de dados',
  label: 'Banco de dados',
  accent: 'gold',
  description:
    'Modelar dados relacionais, escrever SQL com confiança e entender o que garante consistência e desempenho.',
  topics: [
    t('m05-fundamentos', 'Fundamentos de bancos relacionais', 'Tabelas, linhas, colunas e o modelo relacional.'),
    t('m05-sql', 'SQL', 'SELECT, INSERT, UPDATE, DELETE e WHERE.'),
    t('m05-postgres', 'PostgreSQL', 'Instalar, conectar e usar o psql.'),
    t('m05-tabelas', 'Tabelas', 'Tipos de coluna, NOT NULL, DEFAULT e UNIQUE.'),
    t('m05-pk', 'Primary Keys', 'Identidade de uma linha: serial, identity e UUID.'),
    t('m05-fk', 'Foreign Keys', 'Integridade referencial e ON DELETE.'),
    t('m05-relacionamentos', 'Relacionamentos 1:1, 1:N e N:N', 'Como modelar cada um, incluindo tabela de junção.'),
    t('m05-join', 'JOIN', 'INNER, LEFT e quando cada um faz sentido.'),
    t('m05-indices', 'Índices', 'Como aceleram leituras e quanto custam nas escritas.'),
    t('m05-transacoes', 'Transações', 'ACID e por que operações relacionadas precisam ser atômicas.'),
  ],
  practice: exercise({
    title: 'Modelagem da loja',
    description: 'Modelar em SQL puro as tabelas de produtos, categorias, clientes e pedidos.',
    requirements: [
      'Criar as tabelas com chaves primárias e estrangeiras.',
      'Modelar pedidos x produtos como N:N com quantidade e preço unitário.',
      'Escrever uma consulta com JOIN que liste o total de cada pedido.',
      'Criar um pedido completo dentro de uma transação.',
    ],
    doneWhen: [
      'Não é possível inserir um pedido para um cliente inexistente.',
      'Você explica por que o preço unitário fica na tabela de junção.',
      'Você sabe qual índice criar para buscar pedidos por cliente.',
    ],
  }),
}

export const m06: Module = {
  id: 'm06',
  number: 6,
  title: 'Prisma ORM',
  label: 'Prisma ORM',
  accent: 'purple',
  description:
    'Usar um ORM sem perder de vista o SQL que ele gera: schema, migrations, consultas e integração com o NestJS.',
  topics: [
    t('m06-orm', 'O que é ORM', 'Mapeamento objeto-relacional: ganhos e riscos.'),
    t('m06-schema', 'Prisma Schema', 'O arquivo schema.prisma como fonte da verdade.'),
    t('m06-models', 'Models', 'Campos, tipos, atributos e relações.'),
    t('m06-migrations', 'Migrations', 'Versionar a evolução do banco.'),
    t('m06-client', 'Prisma Client', 'O cliente tipado gerado a partir do schema.'),
    t('m06-crud', 'CRUD com Prisma', 'create, findMany, update, delete.'),
    t('m06-relacionamentos', 'Relacionamentos', 'include, select e escrita aninhada.'),
    t('m06-consultas', 'Consultas', 'Filtros, paginação, ordenação e o problema N+1.'),
    t('m06-erros', 'Tratamento de erros', 'Códigos de erro do Prisma e como traduzi-los para HTTP.'),
    t('m06-nest', 'Integração Prisma + NestJS', 'PrismaService como provider injetável.'),
  ],
  practice: exercise({
    title: 'Produtos persistidos',
    description: 'Trocar o array em memória da API de produtos por PostgreSQL via Prisma.',
    requirements: [
      'Schema com Produto e Categoria relacionados.',
      'Migration inicial versionada.',
      'PrismaService injetado no ProdutosService.',
      'Erro de nome duplicado (P2002) convertido em 409.',
    ],
    doneWhen: [
      'Os dados sobrevivem a um restart da API.',
      'Nenhum controller acessa o Prisma diretamente.',
      'Você consegue ler o SQL gerado por uma consulta com include.',
    ],
  }),
}

export const m07: Module = {
  id: 'm07',
  number: 7,
  title: 'Autenticação e segurança',
  label: 'Segurança',
  accent: 'blue',
  description:
    'Identificar quem faz a requisição, decidir o que essa pessoa pode fazer e proteger a API contra os erros mais comuns.',
  topics: [
    t('m07-hash', 'Hash de senhas', 'Por que senhas nunca são criptografadas, e sim hasheadas.'),
    t('m07-bcrypt', 'Bcrypt', 'Salt, custo e verificação.'),
    t('m07-login-cadastro', 'Login e cadastro', 'Fluxos e mensagens que não vazam informação.'),
    t('m07-jwt', 'JWT', 'Estrutura, assinatura e o que não colocar no payload.'),
    t('m07-access', 'Access Token', 'Tokens de vida curta e onde enviá-los.'),
    t('m07-refresh', 'Refresh Token', 'Renovação segura e revogação.'),
    t('m07-authn', 'Authentication', 'Provar identidade.'),
    t('m07-authz', 'Authorization', 'Decidir permissões.'),
    t('m07-guards', 'Guards', 'Proteger rotas no NestJS.'),
    t('m07-roles', 'Roles', 'Papéis e o decorator @Roles.'),
    t('m07-permissions', 'Permissions', 'Permissões finas e regras por recurso.'),
    t('m07-cors', 'CORS', 'O que o navegador bloqueia e o que o servidor libera.'),
    t('m07-env', 'Variáveis de ambiente', 'Segredos fora do código e validação da configuração.'),
    t('m07-seguranca', 'Segurança de APIs', 'Rate limiting, headers e os riscos mais comuns.'),
  ],
  practice: exercise({
    title: 'Autenticação da API de produtos',
    description: 'Adicionar cadastro, login e autorização por papel à API de produtos.',
    requirements: [
      'Cadastro com senha hasheada usando bcrypt.',
      'Login que devolve access token (15 min) e refresh token.',
      'Guard JWT global com rotas públicas marcadas explicitamente.',
      'Apenas o papel "admin" pode criar, editar e remover produtos.',
    ],
    doneWhen: [
      'Nenhuma senha aparece em resposta, log ou banco em texto puro.',
      'Um usuário comum recebe 403 ao tentar remover um produto; sem token, 401.',
      'O segredo do JWT vem de variável de ambiente.',
    ],
  }),
}

export const m08: Module = {
  id: 'm08',
  number: 8,
  title: 'Testes automatizados',
  label: 'Testes',
  accent: 'gold',
  description:
    'Escrever testes que dão confiança para mudar o código: o que testar, em que nível e como isolar dependências.',
  topics: [
    t('m08-unitarios', 'Testes unitários', 'Testar uma unidade isolada, rápido e determinístico.'),
    t('m08-integracao', 'Testes de integração', 'Testar partes reais funcionando juntas.'),
    t('m08-jest', 'Jest', 'describe, it, expect e o ciclo de vida dos testes.'),
    t('m08-supertest', 'Supertest', 'Fazer requisições HTTP reais contra a aplicação.'),
    t('m08-mocks', 'Mocks', 'Substituir dependências e quando isso esconde problemas.'),
    t('m08-controllers', 'Testes de Controllers', 'O que vale (e o que não vale) testar no controller.'),
    t('m08-services', 'Testes de Services', 'Cobrir regras de negócio e casos de erro.'),
    t('m08-endpoints', 'Testes de endpoints', 'Testes e2e do fluxo completo.'),
  ],
  practice: exercise({
    title: 'Rede de segurança',
    description: 'Cobrir a API de produtos com testes unitários e e2e.',
    requirements: [
      'Testes unitários do ProdutosService com o Prisma mockado.',
      'Testes e2e com Supertest para criar, listar, atualizar e remover.',
      'Casos de erro: 400, 401, 403, 404 e 409.',
    ],
    doneWhen: [
      'Os testes passam de forma determinística, em qualquer ordem.',
      'Quebrar uma regra de negócio faz pelo menos um teste falhar.',
      'Você explica por que cada mock existe.',
    ],
  }),
}

export const m09: Module = {
  id: 'm09',
  number: 9,
  title: 'Arquitetura de software',
  label: 'Arquitetura',
  accent: 'purple',
  description:
    'Organizar o código para que ele continue fácil de entender e mudar quando o sistema crescer.',
  topics: [
    t('m09-responsabilidades', 'Separação de responsabilidades', 'Cada parte com um motivo para mudar.'),
    t('m09-camadas', 'Arquitetura em camadas', 'Apresentação, aplicação, domínio e infraestrutura.'),
    t('m09-solid', 'SOLID', 'Os cinco princípios com exemplos em NestJS.'),
    t('m09-patterns', 'Design Patterns', 'Repository, Strategy, Factory e quando não usá-los.'),
    t('m09-modularizacao', 'Modularização', 'Fronteiras entre módulos e dependências permitidas.'),
    t('m09-clean', 'Clean Architecture', 'Regra de dependência e o custo da abstração.'),
    t('m09-organizacao', 'Organização de projetos', 'Estruturas de pastas e convenções.'),
    t('m09-escalabilidade', 'Escalabilidade', 'Escalar código, equipe e infraestrutura.'),
  ],
  practice: exercise({
    title: 'Refatoração guiada',
    description: 'Introduzir um repositório entre o service de produtos e o Prisma.',
    requirements: [
      'Interface ProdutosRepository no domínio.',
      'Implementação com Prisma na infraestrutura.',
      'Testes unitários usando um repositório em memória.',
    ],
    doneWhen: [
      'O service não importa nada do Prisma.',
      'Você explica qual problema a mudança resolveu e o que ela custou.',
    ],
  }),
}

export const m10: Module = {
  id: 'm10',
  number: 10,
  title: 'Infraestrutura e produção',
  label: 'Produção',
  accent: 'blue',
  description:
    'Levar a aplicação para produção e mantê-la saudável: containers, deploy automatizado, observabilidade, cache e filas.',
  topics: [
    t('m10-linux', 'Linux', 'Processos, permissões e sistema de arquivos.'),
    t('m10-terminal', 'Terminal', 'Comandos essenciais para operar servidores.'),
    t('m10-docker', 'Docker', 'Imagens, Dockerfile e camadas.'),
    t('m10-containers', 'Containers', 'Isolamento, volumes e redes.'),
    t('m10-compose', 'Docker Compose', 'API + PostgreSQL + Redis com um comando.'),
    t('m10-deploy', 'Deploy', 'Variáveis, migrations e estratégias de deploy.'),
    t('m10-cicd', 'CI/CD', 'Integração e entrega contínuas.'),
    t('m10-actions', 'GitHub Actions', 'Pipeline de lint, testes e build.'),
    t('m10-logs', 'Logs', 'Logs estruturados e níveis.'),
    t('m10-monitoramento', 'Monitoramento', 'Métricas, health checks e alertas.'),
    t('m10-redis', 'Redis', 'Estruturas de dados em memória.'),
    t('m10-cache', 'Cache', 'Cache-aside, expiração e invalidação.'),
    t('m10-filas', 'Filas e processamento assíncrono', 'Tirar trabalho pesado do caminho da requisição.'),
  ],
  practice: exercise({
    title: 'API em container',
    description: 'Empacotar a API de produtos e automatizar a verificação de cada push.',
    requirements: [
      'Dockerfile multi-stage para a API.',
      'docker-compose com API, PostgreSQL e Redis.',
      'Workflow do GitHub Actions rodando lint, testes e build.',
      'Cache em Redis para a listagem de produtos, invalidado em escritas.',
    ],
    doneWhen: [
      'docker compose up sobe tudo do zero.',
      'Um push com teste quebrado falha no CI.',
      'Você explica quando o cache pode servir dado desatualizado.',
    ],
  }),
}
