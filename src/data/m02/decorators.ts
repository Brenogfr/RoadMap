import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'Um decorator é uma função aplicada a uma classe, a um método, a uma propriedade ou a um parâmetro, escrita com @ antes da declaração. Ele roda uma vez, quando a classe é definida, e pode gravar metadados ou modificar o que decora. @Controller, @Get, @Injectable e @Body são todos decorators.',
    purpose:
      'Declarar intenção perto do código: "esta classe é um controller de /tarefas", "este método responde GET /:id", "este parâmetro é o corpo da requisição". O Nest lê essas declarações na inicialização e monta rotas, injeção e validação a partir delas.',
    problem:
      'Sem decorators, a mesma informação ficaria em arquivos de configuração separados (uma tabela de rotas, uma lista de dependências), longe do código a que se refere e fácil de deixar desatualizada. Funcionalidades transversais, como medir tempo ou extrair um header, seriam repetidas em cada método.',
    whyExists:
      'É uma forma de metaprogramação declarativa, popular em linguagens como Java (anotações) e Python. O TypeScript oferece decorators "experimentais" (experimentalDecorators) há anos, e é essa versão, com metadados de tipos, que o Nest usa.',
    whereUsed:
      'Em todo o Nest: estrutura (@Module, @Controller, @Injectable), rotas (@Get, @Post), parâmetros (@Param, @Body), injeção (@Inject) e, nos próximos módulos, validação (@IsString, Módulo 03) e autorização (@UseGuards, @Roles, Módulo 07).',
  },
  technical: {
    internals: [
      'Um decorator é uma função comum. Para decorators com argumentos, como @Get(\':id\'), Get(\':id\') é uma fábrica que devolve o decorator de fato. A fábrica é chamada na avaliação; o decorator, na aplicação.',
      'Quando há vários decorators no mesmo alvo, as fábricas são avaliadas de cima para baixo e os decorators são aplicados de baixo para cima, do mais próximo da declaração para o mais distante.',
      'A maioria dos decorators do Nest não altera o código: eles gravam metadados com Reflect.defineMetadata (biblioteca reflect-metadata). @Get grava método e caminho na função do método; @Controller grava o prefixo na classe. Na inicialização, o Nest lê tudo com Reflect.getMetadata.',
      'Decorators de método recebem o descritor da propriedade e podem trocar descritor.value por outra função (um wrapper). Isso cria uma função nova, sem os metadados gravados na original.',
      'O TypeScript também implementa decorators no padrão oficial do JavaScript (TC39), mas eles não suportam decorators de parâmetro nem emitDecoratorMetadata. O Nest continua usando experimentalDecorators, por isso a opção no tsconfig.',
      'Para decorators próprios, o Nest oferece createParamDecorator (extrair algo da requisição), SetMetadata (gravar metadados lidos depois por guards e interceptors) e applyDecorators (combinar vários em um).',
    ],
    concepts: [
      { term: 'Decorator', description: 'Função aplicada a uma declaração com @, executada quando a classe é definida.' },
      { term: 'Fábrica de decorator', description: 'Função que recebe argumentos e devolve o decorator: @Get(\':id\').' },
      { term: 'Metadados', description: 'Informações associadas a classes e métodos com Reflect.defineMetadata, lidas depois pelo framework.' },
      { term: 'Tipos de decorator', description: 'De classe, de método, de propriedade e de parâmetro, cada um com uma assinatura própria.' },
      { term: 'createParamDecorator', description: 'Cria decorators de parâmetro, como @Body(), que extraem dados da requisição.' },
      { term: 'SetMetadata e Reflector', description: 'Gravar e ler metadados próprios. Base de @Roles e @Public no Módulo 07.' },
    ],
    examples: [
      {
        title: 'um mini @Controller e @Get do zero',
        description: 'O mesmo mecanismo do Nest, em 30 linhas: decorators que só gravam metadados, e um código que os lê depois.',
        sample: {
          filename: 'src/mini-decorators.ts',
          language: 'ts',
          code: `import 'reflect-metadata';

interface Rota {
  metodo: string;
  caminho: string;
  handler: string | symbol;
}

function Controller(prefixo: string): ClassDecorator {
  return (alvo) => Reflect.defineMetadata('prefixo', prefixo, alvo);
}

function Get(caminho: string): MethodDecorator {
  return (alvo, chave) => {
    const rotas: Rota[] = Reflect.getMetadata('rotas', alvo.constructor) ?? [];
    rotas.push({ metodo: 'GET', caminho, handler: chave });
    Reflect.defineMetadata('rotas', rotas, alvo.constructor);
  };
}

@Controller('/tarefas')
class TarefasController {
  @Get('/')
  listar() {}

  @Get('/:id')
  buscar() {}
}

const prefixo: string = Reflect.getMetadata('prefixo', TarefasController);
const rotas: Rota[] = Reflect.getMetadata('rotas', TarefasController);
for (const r of rotas) console.log(r.metodo, prefixo + r.caminho, '→', String(r.handler));`,
          lineNotes: [
            { line: '9-11', note: 'Decorator de classe: recebe a própria classe e grava o prefixo nela.' },
            { line: '13-19', note: 'Get(caminho) é a fábrica; a função devolvida recebe o protótipo (alvo) e o nome do método (chave).' },
            { line: '15-17', note: 'Acumula as rotas da classe em um metadado. Nenhum código de rota é executado aqui.' },
            { line: '21-28', note: 'Na definição da classe, os decorators rodam uma vez e gravam tudo.' },
            { line: '30-32', note: 'É o que o Nest faz na inicialização: lê os metadados e registra as rotas no servidor HTTP.' },
          ],
        },
      },
      {
        title: 'a ordem de execução',
        description: 'Com dois decorators no mesmo método: fábricas de cima para baixo, aplicação de baixo para cima.',
        sample: {
          filename: 'src/ordem-decorators.ts',
          language: 'ts',
          code: `function Marcar(nome: string): MethodDecorator {
  console.log('avaliando', nome);
  return () => console.log('aplicando', nome);
}

class Exemplo {
  @Marcar('A')
  @Marcar('B')
  metodo() {}
}`,
          lineNotes: [
            { line: '2', note: 'A fábrica roda na avaliação: imprime A e depois B, na ordem em que aparecem.' },
            { line: '3', note: 'O decorator roda na aplicação: imprime B e depois A. O mais próximo do método é aplicado primeiro.' },
            { line: '7-8', note: 'Saída: avaliando A, avaliando B, aplicando B, aplicando A.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Do @Get(\':id\') à rota registrada',
      steps: [
        { label: 'O arquivo do controller é carregado', detail: 'A classe é definida e os decorators rodam, uma única vez.' },
        { label: 'As fábricas são avaliadas', detail: "Get(':id') devolve um decorator; Controller('tarefas') também." },
        { label: 'Os decorators gravam metadados', detail: 'Caminho e método HTTP na função do método; prefixo na classe; tipos dos parâmetros via emitDecoratorMetadata.' },
        { label: 'NestFactory.create lê os metadados', detail: 'Com Reflect.getMetadata, para cada controller registrado em algum módulo.' },
        { label: 'As rotas são registradas', detail: 'O Nest cadastra GET /tarefas/:id no Express, apontando para o método.' },
      ],
    },
  ],
  practice: {
    goal:
      'Criar dois decorators próprios no tarefas-api: um de parâmetro, com createParamDecorator, que entrega o User-Agent da requisição, e um de método, que mede o tempo de execução dos métodos do service.',
    structure: `tarefas-api/src/
├── comum/
│   ├── user-agent.decorator.ts
│   └── medir-tempo.decorator.ts
├── health/
│   └── health.controller.ts
└── tarefas/
    └── tarefas.service.ts   (adicione @MedirTempo() em criar e listar)`,
    files: [
      {
        path: 'src/comum/user-agent.decorator.ts',
        purpose: 'Um decorator de parâmetro, como @Body() ou @Param(). Ele recebe o contexto da execução e devolve o valor que o parâmetro deve receber.',
        sample: {
          language: 'ts',
          code: `import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const UserAgent = createParamDecorator((_dados: unknown, contexto: ExecutionContext): string => {
  const requisicao = contexto.switchToHttp().getRequest<Request>();
  return requisicao.headers['user-agent'] ?? 'desconhecido';
});`,
          lineNotes: [
            { line: '4', note: '_dados recebe o argumento passado ao decorator, como em @Param(\'id\'). Aqui não usamos nenhum.' },
            { line: '5', note: 'ExecutionContext abstrai o tipo de aplicação (HTTP, WebSocket, fila). switchToHttp dá acesso à requisição do Express.' },
            { line: '6', note: 'O valor retornado é o que chega no parâmetro decorado.' },
          ],
        },
      },
      {
        path: 'src/comum/medir-tempo.decorator.ts',
        purpose: 'Um decorator de método que troca o método por uma versão que mede e registra o tempo de execução.',
        sample: {
          language: 'ts',
          code: `export function MedirTempo(): MethodDecorator {
  return (_alvo, chave, descritor: PropertyDescriptor) => {
    const original = descritor.value as (...args: unknown[]) => unknown;
    descritor.value = function (this: unknown, ...args: unknown[]) {
      const inicio = performance.now();
      try {
        return original.apply(this, args);
      } finally {
        console.log(String(chave) + ' levou ' + (performance.now() - inicio).toFixed(2) + ' ms');
      }
    };
    return descritor;
  };
}`,
          lineNotes: [
            { line: '3', note: 'Guarda o método original antes de substituí-lo.' },
            { line: '4', note: 'function (e não arrow function) para receber o this correto: a instância do service.' },
            { line: '7', note: 'Chama o original com o mesmo this e os mesmos argumentos.' },
            { line: '8-10', note: 'finally registra o tempo mesmo quando o método lança uma exceção.' },
          ],
        },
      },
      {
        path: 'src/health/health.controller.ts',
        purpose: 'O health check passa a informar quem fez a requisição, usando o decorator novo.',
        sample: {
          language: 'ts',
          code: `import { Controller, Get } from '@nestjs/common';
import { UserAgent } from '../comum/user-agent.decorator.js';

@Controller('health')
export class HealthController {
  @Get()
  verificar(@UserAgent() agente: string) {
    return {
      status: 'ok',
      uptimeSegundos: Math.round(process.uptime()),
      cliente: agente,
    };
  }
}`,
          lineNotes: [{ line: '7', note: 'Usado como os decorators do próprio Nest: o método recebe uma string pronta, sem tocar no objeto da requisição.' }],
        },
      },
    ],
    run: [
      'cd tarefas-api',
      "# Em tarefas.service.ts: import { MedirTempo } from '../comum/medir-tempo.decorator.js'; e @MedirTempo() acima de criar e de listar",
      'npm run start:dev',
      '# Opcional: compile e rode os exemplos da seção B',
      'npm run build',
      'node dist/mini-decorators.js',
      'node dist/ordem-decorators.js',
    ],
    httpTests: [
      {
        method: 'GET',
        url: 'http://localhost:3000/health',
        expected: '200 com "cliente": "Thunder Client (https://www.thunderclient.com)" ou o identificador da sua ferramenta.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Entender decorators" }`,
        expected: '201, e o terminal imprime "criar levou 0.0x ms".',
      },
    ],
    expected: `node dist/mini-decorators.js imprime:
GET /tarefas/ → listar
GET /tarefas/:id → buscar

node dist/ordem-decorators.js imprime:
avaliando A
avaliando B
aplicando B
aplicando A`,
  },
  commonErrors: [
    {
      title: 'Decorator de método acima do @Get e a rota some',
      symptom: 'A rota responde 404 e não aparece no log Mapped {...}, sem nenhum erro.',
      cause:
        '@MedirTempo() acima de @Get() é aplicado depois dele e troca a função do método por um wrapper novo, sem os metadados de rota que o @Get gravou na função original.',
      fix: 'Coloque decorators que substituem o método abaixo dos decorators do Nest, ou use-os em services. Para controllers, prefira um interceptor (aula de Fluxo de uma requisição).',
    },
    {
      title: 'Arrow function no wrapper e this undefined',
      symptom: "TypeError: Cannot read properties of undefined (reading 'tarefas') dentro do método decorado.",
      cause: 'Uma arrow function não tem this próprio; original.apply(this, args) chama o método sem a instância.',
      fix: 'Use function (...args) { ... } no wrapper e original.apply(this, args), como no exemplo.',
    },
    {
      title: 'Dezenas de erros de decorator depois de mexer no tsconfig',
      symptom: "error TS1241: Unable to resolve signature of method decorator when called as an expression e error TS1206: Decorators are not valid here (em @Body, @Param). Se só experimentalDecorators for desligado: error TS5052.",
      cause: 'experimentalDecorators foi desligado: o TypeScript passa a usar os decorators do padrão TC39, que não aceitam decorators de parâmetro como @Body().',
      fix: 'Mantenha experimentalDecorators e emitDecoratorMetadata ligados em projetos Nest.',
    },
    {
      title: 'Esperar que o decorator rode a cada chamada',
      symptom: 'Um console.log no corpo do decorator aparece uma vez só, na inicialização.',
      cause: 'O decorator roda quando a classe é definida. Só o wrapper que ele instala roda a cada chamada.',
      fix: 'Coloque a lógica de cada chamada dentro da função que substitui o método (ou em um interceptor).',
    },
  ],
  guidance: {
    before: ['Constructors: emitDecoratorMetadata.', 'Providers e Dependency Injection.', 'Módulo 01: closures e this.'],
    now: ['O que é um decorator e quando ele roda.', 'Fábricas e ordem de aplicação.', 'Metadados com reflect-metadata.', 'createParamDecorator.'],
    after: ['Fluxo de uma requisição: middleware, guards, interceptors, pipes e filters.', 'Módulo 03: decorators de validação.', 'Módulo 07: SetMetadata, Reflector e @Roles.'],
    officialDocs: [
      { label: 'NestJS · Custom decorators', url: 'https://docs.nestjs.com/custom-decorators' },
      { label: 'TypeScript Handbook · Decorators', url: 'https://www.typescriptlang.org/docs/handbook/decorators.html' },
      { label: 'tsconfig · experimentalDecorators', url: 'https://www.typescriptlang.org/tsconfig/#experimentalDecorators' },
    ],
  },
}

export default lesson
