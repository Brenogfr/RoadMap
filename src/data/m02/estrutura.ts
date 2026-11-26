import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'NestJS é um framework para construir aplicações de servidor com Node.js e TypeScript. Ele roda sobre um servidor HTTP (Express, por padrão) e acrescenta uma estrutura: módulos, controllers, providers e injeção de dependência. A CLI do Nest cria um projeto pronto com essa organização.',
    purpose:
      'Dar a toda a equipe o mesmo jeito de organizar uma API: onde fica a rota, onde fica a regra de negócio, como uma parte do sistema usa outra. No Módulo 01 você fez tudo isso à mão com node:http; o Nest padroniza essas decisões.',
    problem:
      'APIs feitas só com node:http ou Express crescem sem forma: rotas, validação, acesso a dados e regras se misturam no mesmo arquivo, e cada projeto inventa sua própria organização. Fica difícil testar uma parte isolada e difícil para alguém novo encontrar onde as coisas estão.',
    whyExists:
      'Criado em 2017, inspirado na arquitetura do Angular, para trazer ao back-end Node.js padrões consolidados em outras plataformas (como Spring, no Java): módulos, injeção de dependência e separação clara de responsabilidades.',
    whereUsed:
      'APIs REST e GraphQL, microsserviços, workers de filas e back-ends de aplicativos. É uma das escolhas mais comuns em empresas que usam Node.js com TypeScript.',
  },
  technical: {
    internals: [
      'O ponto de entrada é src/main.ts: NestFactory.create(AppModule) lê o módulo raiz, monta o grafo de módulos, cria as instâncias necessárias e registra as rotas no servidor HTTP. app.listen abre a porta, como o server.listen do Módulo 01.',
      'O código TypeScript é compilado pelo tsc (via nest build ou nest start). Diferente do Módulo 01, aqui não usamos a execução direta pelo Node.js: decorators e parameter properties precisam de compilação.',
      'Duas opções do tsconfig são essenciais: experimentalDecorators habilita os decorators (@Module, @Controller) e emitDecoratorMetadata grava os tipos dos parâmetros do construtor, que o Nest usa para saber o que injetar.',
      'Na versão 12, o projeto padrão é ESM ("type": "module"): imports relativos terminam em .js (o arquivo compilado), mesmo escrevendo .ts, e os testes usam Vitest.',
      'npm run start:dev executa nest start --watch: compila para a pasta dist e reinicia o servidor a cada alteração. Em produção, npm run build gera dist e npm run start:prod roda node dist/main.',
    ],
    concepts: [
      { term: 'Nest CLI', description: 'Ferramenta de linha de comando: nest new cria projetos e nest generate cria módulos, controllers e services.' },
      { term: 'main.ts', description: 'Arquivo de entrada. Cria a aplicação a partir do módulo raiz e abre a porta.' },
      { term: 'AppModule', description: 'Módulo raiz. Toda a aplicação é descoberta a partir dele.' },
      { term: 'Plataforma HTTP', description: 'O servidor por baixo do Nest: Express (padrão), Fastify ou o adaptador Node nativo.' },
      { term: 'dist/', description: 'Pasta com o JavaScript compilado. É ela que roda, nunca os arquivos .ts.' },
      { term: 'ESM e imports .js', description: "import { AppModule } from './app.module.js' aponta para o arquivo que existirá depois da compilação." },
    ],
    examples: [
      {
        title: 'o arquivo de entrada',
        description: 'O main.ts gerado pela CLI, sem a integração opcional de observabilidade.',
        sample: {
          filename: 'src/main.ts',
          language: 'ts',
          code: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();`,
          lineNotes: [
            { line: '1', note: 'NestFactory vem do núcleo do framework (@nestjs/core) e sabe montar uma aplicação a partir de um módulo.' },
            { line: '2', note: 'O import termina em .js porque o projeto é ESM: em tempo de execução, quem existe é app.module.js, dentro de dist.' },
            { line: '5', note: 'create lê o AppModule, resolve todos os módulos importados, instancia controllers e providers e registra as rotas.' },
            { line: '6', note: 'Abre a porta. A porta vem do ambiente, como no Módulo 01, com 3000 como padrão.' },
            { line: '8', note: 'Top-level await: possível porque o projeto é um módulo ES.' },
          ],
        },
      },
      {
        title: 'as opções do tsconfig que o Nest exige',
        description: 'Um trecho do tsconfig.json gerado. Sem essas duas linhas, o Nest não funciona.',
        sample: {
          filename: 'tsconfig.json (trecho)',
          language: 'json',
          code: `{
  "compilerOptions": {
    "module": "nodenext",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "target": "ES2023",
    "outDir": "./dist",
    "strict": true,
    "strictPropertyInitialization": false
  }
}`,
          lineNotes: [
            { line: '3', note: 'nodenext segue as regras de módulos do Node.js, por isso os imports relativos precisam da extensão .js.' },
            { line: '4', note: 'Grava no JavaScript os tipos dos parâmetros dos construtores. É assim que o Nest descobre o que injetar (aula de Constructors).' },
            { line: '5', note: 'Habilita a sintaxe de decorators usada pelo Nest (@Module, @Controller, @Injectable).' },
            { line: '7', note: 'O código compilado vai para dist. Nunca edite arquivos ali: eles são recriados a cada build.' },
            { line: '9', note: 'Permite propriedades de classe sem inicializador, comuns em DTOs (Módulo 03).' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Do npm run start:dev à primeira resposta',
      steps: [
        { label: 'nest start --watch compila', detail: 'O tsc transforma src/*.ts em dist/*.js, incluindo os metadados dos decorators.' },
        { label: 'O Node.js executa dist/main.js', detail: 'A função bootstrap é chamada.' },
        { label: 'NestFactory.create(AppModule)', detail: 'O Nest percorre os módulos a partir do raiz e cria as instâncias necessárias.' },
        { label: 'Rotas mapeadas', detail: 'Cada método de controller com @Get, @Post... vira uma rota no Express. O log mostra "Mapped {/, GET} route".' },
        { label: 'app.listen abre a porta', detail: 'A partir daqui, o event loop espera requisições, como no Módulo 01.' },
        { label: 'Uma requisição chega', detail: 'O Express encontra a rota, o Nest chama o método do controller e serializa o retorno como resposta.' },
      ],
    },
  ],
  practice: {
    goal:
      'Criar o projeto tarefas-api, que será evoluído em todas as aulas deste módulo, e deixá-lo com a estrutura mínima: main, módulo raiz, um controller e um service.',
    structure: `tarefas-api/
├── package.json
├── tsconfig.json
├── nest-cli.json
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── app.controller.ts
    └── app.service.ts`,
    files: [
      {
        path: 'src/main.ts',
        purpose: 'Arquivo de entrada. Se a CLI gerou a opção de observabilidade (NestJS Observe), substitua pelo conteúdo abaixo: nesta trilha ela não é usada.',
        sample: {
          language: 'ts',
          code: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();`,
        },
      },
      {
        path: 'src/app.module.ts',
        purpose: 'O módulo raiz declara quais controllers e providers fazem parte da aplicação.',
        sample: {
          language: 'ts',
          code: `import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}`,
          lineNotes: [
            { line: '5-9', note: 'O decorator @Module descreve o módulo: o que ele importa, quais controllers registra e quais providers cria.' },
            { line: '10', note: 'A classe fica vazia: toda a informação está no decorator. Os detalhes vêm na aula de AppModule.' },
          ],
        },
      },
      {
        path: 'src/app.controller.ts',
        purpose: 'Um controller com uma rota GET /. Ele recebe a requisição e delega ao service.',
        sample: {
          language: 'ts',
          code: `import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}`,
          lineNotes: [
            { line: '4', note: '@Controller() sem argumento: as rotas desta classe começam na raiz (/).' },
            { line: '6', note: 'O Nest entrega uma instância de AppService pelo construtor. Você nunca escreve new AppService(). As aulas de Constructors e Dependency Injection explicam como.' },
            { line: '8', note: '@Get() transforma o método em uma rota GET /.' },
            { line: '10', note: 'Uma string retornada vira o corpo da resposta, com status 200.' },
          ],
        },
      },
      {
        path: 'src/app.service.ts',
        purpose: 'Um service com uma regra simples. @Injectable() permite que o Nest o crie e o injete.',
        sample: {
          language: 'ts',
          code: `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}`,
        },
      },
    ],
    run: [
      'npm i -g @nestjs/cli',
      'nest new tarefas-api',
      '# Responda: ESM (padrão) e, para NestJS Observe, não. As skills para agentes são opcionais.',
      'cd tarefas-api',
      'npm run start:dev',
    ],
    httpTests: [
      { method: 'GET', url: 'http://localhost:3000/', expected: '200 OK com o texto Hello World!' },
      {
        method: 'GET',
        url: 'http://localhost:3000/tarefas',
        expected: '404 com {"message":"Cannot GET /tarefas","error":"Not Found","statusCode":404}. O formato do erro já vem pronto do Nest.',
      },
    ],
    expected: `No terminal, logs como:
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [RoutesResolver] AppController {/}:
[Nest] LOG [RouterExplorer] Mapped {/, GET} route
[Nest] LOG [NestApplication] Nest application successfully started

Altere o texto em app.service.ts e salve: o --watch recompila e reinicia sozinho.`,
  },
  commonErrors: [
    {
      title: "error TS2307: Cannot find module './app.module'",
      symptom: 'A compilação falha no start:dev, apontando para um import relativo sem extensão.',
      cause: 'Em projetos ESM (module nodenext), imports relativos precisam da extensão .js. Sem ela, o TypeScript não resolve o arquivo.',
      fix: "Use './app.module.js'. O nest generate já cria os imports nesse formato.",
    },
    {
      title: 'Seguir um tutorial antigo e misturar formatos',
      symptom: 'Erros como "require is not defined in ES module scope" ou testes com jest.fn() que não funcionam.',
      cause: 'Muitos tutoriais usam CommonJS e Jest, o padrão de versões anteriores. O projeto gerado pela CLI 12 é ESM com Vitest.',
      fix: 'Confira a versão do material. Em projetos ESM use import/export, extensões .js e vi.fn() nos testes. Se precisar de CommonJS, gere com nest new --type cjs.',
    },
    {
      title: 'Editar arquivos dentro de dist',
      symptom: 'A alteração some na próxima compilação.',
      cause: 'dist é gerada a partir de src a cada build; deleteOutDir apaga a pasta antes.',
      fix: 'Edite apenas src/. Coloque dist no .gitignore (a CLI já faz isso).',
    },
    {
      title: 'Error: listen EADDRINUSE: address already in use :::3000',
      symptom: 'O start:dev falha ao subir.',
      cause: 'Outro processo usa a porta, geralmente uma execução anterior do mesmo projeto ou um servidor do Módulo 01.',
      fix: 'Encerre o processo anterior ou rode com outra porta: no PowerShell, $env:PORT=3001; npm run start:dev.',
    },
  ],
  guidance: {
    before: ['Módulo 01 inteiro, em especial Node.js, Ciclo de vida de uma requisição e TypeScript.'],
    now: ['Criar um projeto com a CLI.', 'O papel de main.ts, AppModule, controller e service.', 'Compilação, dist e o modo watch.', 'ESM e imports .js.'],
    after: ['AppModule: como o módulo raiz monta a aplicação.', 'Feature Modules: dividir a aplicação por domínio.'],
    officialDocs: [
      { label: 'NestJS · First steps', url: 'https://docs.nestjs.com/first-steps' },
      { label: 'NestJS · CLI overview', url: 'https://docs.nestjs.com/cli/overview' },
      { label: 'tsconfig · experimentalDecorators', url: 'https://www.typescriptlang.org/tsconfig/#experimentalDecorators' },
      { label: 'tsconfig · emitDecoratorMetadata', url: 'https://www.typescriptlang.org/tsconfig/#emitDecoratorMetadata' },
    ],
  },
}

export default lesson
