import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'O construtor é o método que roda quando uma classe é instanciada. No Nest, ele tem um papel a mais: é pelos parâmetros do construtor que uma classe declara do que depende. constructor(private readonly tarefasService: TarefasService) significa "para existir, preciso de um TarefasService".',
    purpose:
      'Declarar dependências de forma explícita e verificável. Quem lê a classe vê, na primeira linha, tudo de que ela precisa; o Nest lê a mesma informação para entregar as instâncias certas.',
    problem:
      'Se cada classe criasse suas dependências com new dentro dos métodos, seria impossível trocar uma delas (por um banco diferente ou por uma versão falsa em testes) sem editar a classe. As dependências ficariam escondidas no meio do código.',
    whyExists:
      'O construtor é o ponto natural para receber o que uma classe precisa antes de ser usada. O TypeScript acrescenta as parameter properties, um atalho que declara e atribui a propriedade em uma só linha, e a opção emitDecoratorMetadata, que permite ao Nest ler os tipos desses parâmetros em tempo de execução.',
    whereUsed:
      'Em todo controller, service, guard ou interceptor do Nest que dependa de outra classe. É o padrão chamado constructor injection.',
  },
  technical: {
    internals: [
      'Parameter properties: um modificador (private, public, protected ou readonly) antes de um parâmetro do construtor faz o TypeScript declarar a propriedade e copiar o valor recebido para ela. É uma conveniência de sintaxe: o JavaScript gerado tem a atribuição explícita.',
      'Com emitDecoratorMetadata, o tsc grava em toda classe decorada o metadado design:paramtypes: a lista dos tipos dos parâmetros do construtor, como referências às classes (por exemplo, [TarefasService]).',
      'Na inicialização, o Nest lê design:paramtypes de cada controller e provider, procura cada tipo no escopo do módulo e chama o construtor com as instâncias encontradas, na mesma ordem.',
      'Interfaces e type aliases não existem em JavaScript. Se o parâmetro for tipado com uma interface, o metadado registra apenas Object, e o Nest não tem como saber o que injetar. Para esses casos existem tokens com @Inject (aula de Providers).',
      'O metadado só é emitido para classes com algum decorator. Por isso todo provider com dependências precisa de @Injectable(), mesmo que o decorator pareça não fazer nada.',
    ],
    concepts: [
      { term: 'Constructor injection', description: 'Receber as dependências pelos parâmetros do construtor, em vez de criá-las.' },
      { term: 'Parameter property', description: 'private readonly x: X no construtor: declara e atribui a propriedade em uma linha.' },
      { term: 'design:paramtypes', description: 'Metadado com os tipos dos parâmetros do construtor, gravado pelo tsc e lido pelo Nest.' },
      { term: 'emitDecoratorMetadata', description: 'Opção do tsconfig que faz o compilador gravar esses metadados.' },
      { term: 'reflect-metadata', description: 'Biblioteca que implementa Reflect.getMetadata e Reflect.defineMetadata, usada pelo Nest.' },
      { term: 'Type erasure', description: 'Interfaces somem na compilação; classes continuam existindo e podem ser usadas como identificador.' },
    ],
    examples: [
      {
        title: 'a forma curta e a forma longa',
        description: 'As duas classes são equivalentes. O Nest usa a forma curta em todos os exemplos.',
        sample: {
          filename: 'forma-curta-e-longa.ts',
          language: 'ts',
          code: `// Forma longa: declara, recebe e atribui
export class TarefasControllerLongo {
  private readonly tarefasService: TarefasService;

  constructor(tarefasService: TarefasService) {
    this.tarefasService = tarefasService;
  }
}

// Forma curta: parameter property
export class TarefasControllerCurto {
  constructor(private readonly tarefasService: TarefasService) {}
}`,
          lineNotes: [
            { line: '3', note: 'A propriedade precisa ser declarada na classe.' },
            { line: '5-7', note: 'O construtor recebe o valor e o guarda na propriedade.' },
            { line: '12', note: 'private readonly antes do parâmetro faz as três coisas acima. O corpo vazio {} é normal.' },
          ],
        },
      },
      {
        title: 'o que o compilador gera',
        description: 'Trecho real de dist/tarefas/tarefas.controller.js depois do npm run build. É aqui que o Nest encontra as dependências.',
        sample: {
          filename: 'dist/tarefas/tarefas.controller.js (trecho)',
          language: 'js',
          code: `import { TarefasService } from './tarefas.service.js';
let TarefasController = class TarefasController {
    tarefasService;
    constructor(tarefasService) {
        this.tarefasService = tarefasService;
    }
    // ... métodos das rotas
};
TarefasController = __decorate([
    Controller('tarefas'),
    __metadata("design:paramtypes", [TarefasService])
], TarefasController);
export { TarefasController };`,
          lineNotes: [
            { line: '1', note: 'O import continua no JavaScript porque TarefasService é usado em tempo de execução, como valor.' },
            { line: '3-6', note: 'A parameter property virou uma propriedade comum e uma atribuição. private e readonly sumiram: só existem para o compilador.' },
            { line: '10', note: '@Controller(\'tarefas\') aplicado à classe, guardando o prefixo como metadado.' },
            { line: '11', note: 'A lista de dependências. O Nest lê [TarefasService] e entrega a instância desse provider no parâmetro 0.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Do construtor à instância pronta',
      steps: [
        { label: 'Você escreve o construtor', detail: 'constructor(private readonly tarefasService: TarefasService) {}' },
        { label: 'O tsc compila', detail: 'Gera a atribuição this.tarefasService = tarefasService e o metadado design:paramtypes = [TarefasService].' },
        { label: 'O Nest lê o metadado', detail: 'Na inicialização, para cada classe registrada no módulo.' },
        { label: 'Procura cada tipo no escopo do módulo', detail: 'Encontra o provider TarefasService (do próprio módulo ou de um módulo importado que o exporta).' },
        { label: 'Chama o construtor', detail: 'new TarefasController(instanciaDeTarefasService), na ordem dos parâmetros.' },
        { label: 'Falha se não encontrar', detail: 'UnknownDependenciesException, com o índice do parâmetro que faltou.' },
      ],
    },
  ],
  practice: {
    goal:
      'Ver com os próprios olhos o metadado que o Nest usa: compilar o tarefas-api, abrir o JavaScript gerado e listar as dependências de cada classe com Reflect.getMetadata, inclusive o que acontece quando o tipo é uma interface.',
    structure: `tarefas-api/src/
├── inspecionar-construtores.ts
├── tarefas/...
└── relatorios/...`,
    files: [
      {
        path: 'src/inspecionar-construtores.ts',
        purpose: 'Um script que lê design:paramtypes das classes do projeto e de uma classe de exemplo que depende de uma interface.',
        sample: {
          language: 'ts',
          code: `import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { RelatoriosController } from './relatorios/relatorios.controller.js';
import { TarefasController } from './tarefas/tarefas.controller.js';

interface Relogio {
  agora(): Date;
}

@Injectable()
class ServicoComInterface {
  constructor(private readonly relogio: Relogio) {}
}

for (const classe of [TarefasController, RelatoriosController, ServicoComInterface]) {
  const tipos = Reflect.getMetadata('design:paramtypes', classe) as Function[] | undefined;
  console.log(classe.name, '→', tipos?.map((t) => t.name));
}`,
          lineNotes: [
            { line: '1', note: 'Carrega a implementação de Reflect.getMetadata. O Nest faz isso internamente.' },
            { line: '6-8', note: 'Uma interface: existe só para o TypeScript.' },
            { line: '10-13', note: 'Uma classe que depende da interface. Compila sem erro, mas o Nest não teria como injetá-la.' },
            { line: '16', note: 'O mesmo metadado que o Nest lê na inicialização.' },
          ],
        },
      },
    ],
    run: ['cd tarefas-api', 'npm run build', 'node dist/inspecionar-construtores.js', '# Abra dist/tarefas/tarefas.controller.js e procure design:paramtypes'],
    verify:
      'Compare a saída do script com o JavaScript gerado em dist. Depois, desligue emitDecoratorMetadata no tsconfig.json, rode npm run build e o script de novo: as listas viram undefined. Suba a aplicação nesse estado: ela sobe, mas GET /tarefas responde 500, porque tarefasService chega undefined. É um erro silencioso na inicialização e barulhento na primeira requisição. Volte a opção para true.',
    expected: `TarefasController → [ 'TarefasService' ]
RelatoriosController → [ 'TarefasService' ]
ServicoComInterface → [ 'Object' ]

Object é tudo o que sobra de uma interface em tempo de execução.`,
  },
  commonErrors: [
    {
      title: 'Injetar uma interface pelo tipo',
      symptom: "Nest can't resolve dependencies of the ServicoComInterface (?). Please make sure that the argument at index [0] is available in the current module.",
      cause: 'Interfaces são apagadas na compilação; o metadado registra Object, e não existe um provider chamado Object.',
      fix: 'Use uma classe como tipo, ou um token com @Inject(\'NOME\') e um provider registrado com esse token (aula de Providers).',
    },
    {
      title: 'Esquecer o modificador e a dependência ficar undefined',
      symptom: 'TypeError: Cannot read properties of undefined (reading \'listar\') ao chamar this.tarefasService.listar().',
      cause: 'Sem private, public ou readonly, o parâmetro existe só dentro do construtor. Nada é guardado em this.',
      fix: 'Escreva private readonly tarefasService: TarefasService, ou atribua manualmente no corpo do construtor.',
    },
    {
      title: 'Importar só o tipo da classe injetada',
      symptom: 'A compilação passa, mas o metadado registra Function em vez de TarefasService, e o Nest não consegue injetar.',
      cause: 'import type { TarefasService } é apagado na compilação, e o metadado perde a referência à classe.',
      fix: 'Importe a classe como valor: import { TarefasService } from \'./tarefas.service.js\'. Use import type só para interfaces e tipos.',
    },
    {
      title: 'Criar a dependência com new dentro da classe',
      symptom: 'Dois TarefasService com dados diferentes; um teste não consegue substituir a dependência.',
      cause: 'private service = new TarefasService() ignora o container: cria uma instância separada, fora do controle do Nest.',
      fix: 'Receba a dependência pelo construtor e deixe o Nest criá-la uma única vez.',
    },
  ],
  guidance: {
    before: ['Services.', 'Módulo 01: TypeScript (classes e type erasure).'],
    now: ['Parameter properties.', 'design:paramtypes e emitDecoratorMetadata.', 'Por que interfaces não podem ser injetadas pelo tipo.'],
    after: ['Private e Readonly: o que esses modificadores garantem.', 'Providers: tokens e @Inject para injetar o que não é classe.'],
    officialDocs: [
      { label: 'TypeScript Handbook · Classes (parameter properties)', url: 'https://www.typescriptlang.org/docs/handbook/2/classes.html' },
      { label: 'TypeScript Handbook · Decorators (metadados)', url: 'https://www.typescriptlang.org/docs/handbook/decorators.html' },
      { label: 'tsconfig · emitDecoratorMetadata', url: 'https://www.typescriptlang.org/tsconfig/#emitDecoratorMetadata' },
      { label: 'NestJS · Providers (dependency injection)', url: 'https://docs.nestjs.com/providers' },
    ],
  },
}

export default lesson
