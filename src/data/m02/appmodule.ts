import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'AppModule é o módulo raiz de uma aplicação Nest. É uma classe com o decorator @Module, que declara quais controllers e providers pertencem a ele e quais outros módulos ele importa. NestFactory.create recebe esse módulo e, a partir dele, descobre toda a aplicação.',
    purpose:
      'Ser o ponto de partida do grafo de módulos. Tudo o que não for alcançável a partir do AppModule (diretamente ou por imports) simplesmente não existe para o Nest: nenhuma rota é registrada e nenhuma instância é criada.',
    problem:
      'Em uma API sem estrutura, cada arquivo importa e instancia o que precisa, e não há um lugar que diga "isto é a aplicação". O módulo raiz centraliza essa composição: dá para ver, em um arquivo, quais partes compõem o sistema.',
    whyExists:
      'O Nest organiza a aplicação como uma árvore de módulos para que o container de injeção de dependência saiba o que criar e o que cada parte pode enxergar. A árvore precisa de uma raiz.',
    whereUsed:
      'Em toda aplicação Nest. Em projetos reais, o AppModule costuma ter poucos controllers próprios e muitos imports: configuração, banco de dados e os módulos de cada domínio.',
  },
  technical: {
    internals: [
      'O decorator @Module não executa nada sozinho: ele grava metadados na classe (imports, controllers, providers, exports). O Nest lê esses metadados durante o NestFactory.create.',
      'A partir do AppModule, o Nest percorre recursivamente os imports e monta o grafo de módulos. Cada módulo vira um escopo do container de injeção de dependência.',
      'Para cada módulo, o Nest cria os providers listados e depois os controllers, resolvendo as dependências de cada construtor. Por padrão, cada provider é criado uma única vez (singleton) e compartilhado.',
      'Controllers só têm rotas registradas se o módulo onde estão for alcançável a partir da raiz. Um controller fora de qualquer módulo importado não gera erro: as rotas apenas não existem (404).',
      'Se um construtor pede algo que não está disponível no escopo do módulo, a aplicação nem sobe: o Nest lança UnknownDependenciesException ao iniciar, e não na primeira requisição.',
    ],
    concepts: [
      { term: '@Module()', description: 'Decorator que transforma uma classe em módulo, com quatro listas: imports, controllers, providers e exports.' },
      { term: 'imports', description: 'Outros módulos cujos providers exportados este módulo quer usar.' },
      { term: 'controllers', description: 'Classes que recebem requisições HTTP. Suas rotas são registradas quando o módulo é carregado.' },
      { term: 'providers', description: 'Classes (ou valores) que o Nest cria e injeta: services, repositórios, helpers.' },
      { term: 'exports', description: 'Os providers deste módulo que outros módulos podem usar ao importá-lo.' },
      { term: 'Grafo de módulos', description: 'A árvore montada a partir do AppModule. Define o que existe e o que cada módulo enxerga.' },
    ],
    examples: [
      {
        title: 'a anatomia de um módulo',
        description: 'As quatro listas do @Module, preenchidas como estarão ao fim deste módulo do roadmap.',
        sample: {
          filename: 'src/app.module.ts',
          language: 'ts',
          code: `import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller.js';
import { TarefasModule } from './tarefas/tarefas.module.js';

@Module({
  imports: [TarefasModule],
  controllers: [HealthController],
  providers: [],
  exports: [],
})
export class AppModule {}`,
          lineNotes: [
            { line: '5', note: '@Module recebe um objeto de configuração e grava esses dados como metadados da classe.' },
            { line: '6', note: 'imports traz outro módulo para o grafo. Sem esta linha, as rotas de TarefasModule nunca seriam registradas.' },
            { line: '7', note: 'Controllers declarados diretamente na raiz. Bom para rotas da aplicação como um todo, como /health.' },
            { line: '8-9', note: 'O módulo raiz raramente exporta algo: ninguém o importa. Listas vazias podem ser omitidas.' },
          ],
        },
      },
      {
        title: 'o erro mais comum ao montar módulos',
        description: 'O AppController pede AppService no construtor, mas AppService foi removido de providers. A aplicação não sobe.',
        sample: {
          filename: 'terminal',
          language: 'text',
          code: `ERROR [ExceptionHandler] UnknownDependenciesException [Error]:
Nest can't resolve dependencies of the AppController (?).
Please make sure that the argument AppService at index [0]
is available in the AppModule module.

Potential solutions:
- Is AppModule a valid NestJS module?
- If AppService is a provider, is it part of the current AppModule?
- If AppService is exported from a separate @Module, is that module
  imported within AppModule?`,
          lineNotes: [
            { line: '2', note: 'O (?) marca a posição do parâmetro que não pôde ser resolvido no construtor.' },
            { line: '3-4', note: 'Diz o quê (AppService), em que posição ([0]) e em qual escopo foi procurado (AppModule).' },
            { line: '7-10', note: 'As duas causas reais: o provider não está em providers deste módulo, ou está em outro módulo que não o exporta ou não foi importado.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'O que o NestFactory.create(AppModule) faz',
      steps: [
        { label: 'Lê os metadados do AppModule', detail: 'O que foi declarado em @Module: imports, controllers, providers e exports.' },
        { label: 'Percorre os imports recursivamente', detail: 'Cada módulo importado é lido da mesma forma, formando o grafo.' },
        { label: 'Cria os providers de cada módulo', detail: 'Na ordem das dependências: quem é dependência é criado primeiro.' },
        { label: 'Cria os controllers', detail: 'Recebendo pelo construtor os providers disponíveis no escopo do módulo.' },
        { label: 'Registra as rotas', detail: 'Lê @Controller e @Get/@Post de cada controller e cadastra as rotas no Express.' },
        { label: 'Falha cedo se algo faltar', detail: 'Uma dependência não encontrada interrompe a inicialização com UnknownDependenciesException.' },
      ],
    },
  ],
  practice: {
    goal: 'Adicionar ao tarefas-api uma rota GET /health declarada no AppModule e observar o que acontece quando um controller ou um provider fica de fora.',
    structure: `tarefas-api/src/
├── main.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── health/
    └── health.controller.ts`,
    files: [
      {
        path: 'src/health/health.controller.ts',
        purpose: 'Um controller sem dependências que responde o estado da aplicação. Health checks são usados por ferramentas de deploy e monitoramento (Módulo 10).',
        sample: {
          language: 'ts',
          code: `import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  verificar() {
    return {
      status: 'ok',
      uptimeSegundos: Math.round(process.uptime()),
    };
  }
}`,
          lineNotes: [
            { line: '3', note: "O prefixo 'health' vale para todas as rotas desta classe." },
            { line: '6-10', note: 'Um objeto retornado é serializado como JSON, com Content-Type application/json, sem chamar JSON.stringify.' },
          ],
        },
      },
      {
        path: 'src/app.module.ts',
        purpose: 'O novo controller entra na lista de controllers do módulo raiz.',
        sample: {
          language: 'ts',
          code: `import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthController } from './health/health.controller.js';

@Module({
  imports: [],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}`,
          lineNotes: [{ line: '8', note: 'Sem HealthController nesta lista, a classe existe, compila, mas GET /health responde 404.' }],
        },
      },
    ],
    run: ['cd tarefas-api', 'npm run start:dev'],
    httpTests: [
      { method: 'GET', url: 'http://localhost:3000/health', expected: '200 com {"status":"ok","uptimeSegundos":N}.' },
      {
        method: 'GET',
        url: 'http://localhost:3000/health',
        expected: 'Remova HealthController da lista de controllers e salve: agora a resposta é 404, sem nenhum erro no terminal. Volte a adicioná-lo.',
      },
    ],
    verify:
      'Remova AppService da lista de providers e salve. A aplicação não sobe e o terminal mostra UnknownDependenciesException apontando AppService no índice [0] do AppController. Leia a mensagem inteira e restaure a linha.',
    expected: `No log de inicialização: Mapped {/, GET} route e Mapped {/health, GET} route.
GET /health responde {"status":"ok","uptimeSegundos":N}.`,
  },
  commonErrors: [
    {
      title: "Nest can't resolve dependencies of the X (?)",
      symptom: 'A aplicação não sobe e o erro cita UnknownDependenciesException.',
      cause: 'O construtor de X pede um provider que não está em providers do mesmo módulo, nem é exportado por um módulo importado.',
      fix: 'Adicione o provider ao módulo certo, ou exporte-o no módulo de origem e importe esse módulo. A mensagem diz qual argumento e em qual índice.',
    },
    {
      title: 'Rota que deveria existir responde 404',
      symptom: 'Cannot GET /health, sem erro no terminal.',
      cause: 'O controller não foi declarado em nenhum módulo, ou o módulo dele não foi importado no grafo a partir do AppModule.',
      fix: 'Procure no log de inicialização a linha Mapped {/rota, GET}. Se não aparece, o controller não está registrado.',
    },
    {
      title: 'Colocar um service em controllers (ou o contrário)',
      symptom: 'Erros estranhos na inicialização ou rotas que não aparecem.',
      cause: 'controllers e providers têm papéis diferentes: o Nest procura rotas nos controllers e cria providers para injeção.',
      fix: 'Classes com @Controller vão em controllers; classes com @Injectable vão em providers.',
    },
    {
      title: 'AppModule gigante',
      symptom: 'Dezenas de controllers e providers em um só arquivo; qualquer mudança mexe nele.',
      cause: 'Tudo foi declarado direto na raiz, sem módulos por domínio.',
      fix: 'Agrupe por domínio em feature modules (próxima aula) e deixe o AppModule apenas compondo esses módulos.',
    },
  ],
  guidance: {
    before: ['Estrutura de um projeto NestJS.'],
    now: ['As quatro listas do @Module.', 'O grafo de módulos e a inicialização.', 'Ler o erro de dependência não encontrada.'],
    after: ['Feature Modules: exports, imports e encapsulamento entre módulos.'],
    officialDocs: [
      { label: 'NestJS · Modules', url: 'https://docs.nestjs.com/modules' },
      { label: 'NestJS · Common errors', url: 'https://docs.nestjs.com/faq/common-errors' },
    ],
  },
}

export default lesson
