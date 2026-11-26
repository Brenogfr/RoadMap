import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'Provider é qualquer coisa que o Nest sabe criar e entregar por injeção: uma classe (o caso mais comum, como um service), um valor pronto, o resultado de uma função ou um apelido para outro provider. Cada provider é registrado com um token, o identificador usado para pedi-lo.',
    purpose:
      'Permitir injetar não só services, mas também configuração, clientes de serviços externos, relógios, geradores de id e implementações alternativas, sempre pelo mesmo mecanismo e sempre substituíveis.',
    problem:
      'Uma regra que lê process.env direto ou chama new Date() no meio do código fica presa ao ambiente: não dá para testar o limite de tarefas com outro valor, nem simular que hoje é dia 31, sem alterar o código. E interfaces, como você viu na aula de Constructors, não podem ser injetadas pelo tipo.',
    whyExists:
      'O container de injeção precisa de um mapa token → como criar. A forma curta providers: [TarefasService] cobre classes; os providers personalizados (useValue, useFactory, useClass, useExisting) cobrem todo o resto.',
    whereUsed:
      'Configuração da aplicação, conexão com banco (o PrismaService do Módulo 06 é um provider), clientes de e-mail e pagamento, e a troca de implementações em testes.',
  },
  technical: {
    internals: [
      'providers: [TarefasService] é um atalho para { provide: TarefasService, useClass: TarefasService }: o token é a própria classe, e o Nest a instancia resolvendo o construtor.',
      'useValue registra um valor pronto (objeto, número, função). useFactory registra uma função cujo retorno vira o provider; ela pode ser async e receber outros providers via inject. useClass escolhe qual classe instanciar para um token. useExisting cria um apelido para outro provider.',
      'Tokens podem ser classes, strings ou Symbols. Para tokens que não são classes, o construtor precisa de @Inject(TOKEN), porque o metadado design:paramtypes não tem como dizer qual valor usar.',
      'Symbols são únicos: dois Symbol(\'CONFIG\') são diferentes, o que evita colisões entre módulos. Strings são mais simples, mas qualquer outro módulo pode usar o mesmo nome por engano.',
      'Providers personalizados seguem as mesmas regras de escopo: são privados do módulo e precisam estar em exports (pelo token) para serem usados em outros módulos.',
      'Factories rodam uma vez, na inicialização (escopo singleton). Uma factory async faz o Nest esperar antes de abrir a porta, útil para conectar a um banco.',
    ],
    concepts: [
      { term: 'Token', description: 'O identificador de um provider: uma classe, uma string ou um Symbol.' },
      { term: 'useClass', description: 'Qual classe instanciar para o token. A forma curta é useClass com a própria classe.' },
      { term: 'useValue', description: 'Um valor pronto, entregue como está.' },
      { term: 'useFactory', description: 'Uma função que cria o valor; pode receber outros providers em inject e ser async.' },
      { term: 'useExisting', description: 'Um apelido: o token passa a entregar a mesma instância de outro provider.' },
      { term: '@Inject(TOKEN)', description: 'Diz ao Nest qual provider entregar em um parâmetro cujo tipo não é uma classe.' },
    ],
    examples: [
      {
        title: 'as formas de registrar um provider',
        description: 'Um módulo ilustrativo com todas as variações lado a lado.',
        sample: {
          filename: 'formas.module.ts',
          language: 'ts',
          code: `import { Module } from '@nestjs/common';

export const CONFIG = Symbol('CONFIG');
export const RELOGIO = Symbol('RELOGIO');
export const AGORA = Symbol('AGORA');

class EmailService {}
class EmailFalso {}

@Module({
  providers: [
    EmailService,
    { provide: CONFIG, useValue: { limitePendentes: 5 } },
    { provide: RELOGIO, useFactory: () => ({ agora: () => new Date() }) },
    { provide: EmailService, useClass: process.env.NODE_ENV === 'test' ? EmailFalso : EmailService },
    { provide: AGORA, useExisting: RELOGIO },
  ],
  exports: [CONFIG, RELOGIO],
})
export class FormasModule {}`,
          lineNotes: [
            { line: '3-5', note: 'Tokens como Symbols: únicos e importáveis, sem risco de dois módulos usarem o mesmo nome.' },
            { line: '12', note: 'Forma curta: o token é a classe e o Nest a instancia.' },
            { line: '13', note: 'useValue: entrega o objeto como está. Ótimo para configuração fixa.' },
            { line: '14', note: 'useFactory: a função roda uma vez, na inicialização, e o retorno vira o provider.' },
            { line: '15', note: 'useClass: o mesmo token, implementações diferentes. Quem injeta EmailService nem percebe a troca.' },
            { line: '16', note: 'useExisting: AGORA e RELOGIO entregam a mesma instância.' },
            { line: '18', note: 'Providers personalizados são exportados pelo token.' },
          ],
        },
      },
      {
        title: 'injetar por token',
        description: 'Para tokens que não são classes, @Inject diz ao Nest qual valor entregar.',
        sample: {
          filename: 'injetar-token.ts',
          language: 'ts',
          code: `import { Inject, Injectable } from '@nestjs/common';
import { CONFIG, RELOGIO } from './formas.module.js';

interface Config {
  limitePendentes: number;
}
interface Relogio {
  agora(): Date;
}

@Injectable()
export class ExemploService {
  constructor(
    @Inject(CONFIG) private readonly config: Config,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  resumo(): string {
    return 'limite ' + this.config.limitePendentes + ' às ' + this.relogio.agora().toISOString();
  }
}`,
          lineNotes: [
            { line: '4-9', note: 'Interfaces descrevem a forma do valor injetado. Elas somem na compilação; quem identifica o provider é o token.' },
            { line: '14', note: 'Sem @Inject(CONFIG), o metadado diria apenas Object e a aplicação não subiria.' },
            { line: '15', note: 'O service não sabe se recebeu o relógio real ou um falso, fixo em uma data, como num teste.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Como o Nest resolve @Inject(CONFIG_TAREFAS)',
      steps: [
        { label: 'O decorator grava o token', detail: '@Inject(CONFIG_TAREFAS) registra que o parâmetro 0 deve receber o provider desse token.' },
        { label: 'Inicialização do módulo', detail: 'O Nest encontra { provide: CONFIG_TAREFAS, useFactory } em providers.' },
        { label: 'A factory roda', detail: 'Lê LIMITE_PENDENTES do ambiente e devolve { limitePendentes }. O resultado fica guardado (singleton).' },
        { label: 'O service é criado', detail: 'new TarefasService(config, relogio), com os valores dos tokens na ordem dos parâmetros.' },
        { label: 'Em testes', detail: 'O mesmo token pode receber outro valor, sem mudar uma linha do service (aula de Dependency Injection).' },
      ],
    },
  ],
  practice: {
    goal:
      'Tirar do TarefasService duas dependências escondidas: o limite fixo no código e o new Date(). As duas passam a ser providers com tokens, e o limite vem de uma variável de ambiente.',
    structure: `tarefas-api/src/tarefas/
├── tarefas.tokens.ts
├── tarefas.module.ts
├── tarefas.controller.ts
└── tarefas.service.ts`,
    files: [
      {
        path: 'src/tarefas/tarefas.tokens.ts',
        purpose: 'Tokens e tipos dos providers personalizados, em um arquivo próprio para evitar imports circulares.',
        sample: {
          language: 'ts',
          code: `export const CONFIG_TAREFAS = Symbol('CONFIG_TAREFAS');
export const RELOGIO = Symbol('RELOGIO');

export interface ConfigTarefas {
  limitePendentes: number;
}

export interface Relogio {
  agora(): Date;
}`,
        },
      },
      {
        path: 'src/tarefas/tarefas.module.ts',
        purpose: 'Registra a configuração com useFactory (lê o ambiente uma vez) e o relógio com useValue.',
        sample: {
          language: 'ts',
          code: `import { Module } from '@nestjs/common';
import { TarefasController } from './tarefas.controller.js';
import { TarefasService } from './tarefas.service.js';
import { CONFIG_TAREFAS, RELOGIO, type ConfigTarefas, type Relogio } from './tarefas.tokens.js';

@Module({
  controllers: [TarefasController],
  providers: [
    TarefasService,
    {
      provide: CONFIG_TAREFAS,
      useFactory: (): ConfigTarefas => ({ limitePendentes: Number(process.env.LIMITE_PENDENTES ?? 5) }),
    },
    { provide: RELOGIO, useValue: { agora: () => new Date() } satisfies Relogio },
  ],
  exports: [TarefasService],
})
export class TarefasModule {}`,
          lineNotes: [
            { line: '10-13', note: 'A factory roda uma vez, na inicialização. Mudar a variável exige reiniciar a aplicação.' },
            { line: '14', note: 'satisfies confere a forma do objeto sem perder o tipo literal.' },
            { line: '16', note: 'Só o service é exportado: config e relógio são detalhes internos do módulo de tarefas.' },
          ],
        },
      },
      {
        path: 'src/tarefas/tarefas.service.ts',
        purpose: 'O service recebe config e relógio por token. Cada tarefa passa a registrar a data de criação.',
        sample: {
          language: 'ts',
          code: `import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CONFIG_TAREFAS, RELOGIO, type ConfigTarefas, type Relogio } from './tarefas.tokens.js';

export interface Tarefa {
  id: number;
  titulo: string;
  concluida: boolean;
  criadaEm: string;
}

@Injectable()
export class TarefasService {
  private tarefas: Tarefa[] = [];
  private proximoId = 1;

  constructor(
    @Inject(CONFIG_TAREFAS) private readonly config: ConfigTarefas,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  listar(concluida?: boolean): readonly Tarefa[] {
    const filtradas = concluida === undefined ? this.tarefas : this.tarefas.filter((t) => t.concluida === concluida);
    return filtradas.map((t) => ({ ...t }));
  }

  buscarPorId(id: number): Tarefa {
    const tarefa = this.tarefas.find((t) => t.id === id);
    if (!tarefa) throw new NotFoundException('Tarefa ' + id + ' não encontrada');
    return tarefa;
  }

  criar(titulo: string): Tarefa {
    const normalizado = titulo.trim();
    const repetido = this.tarefas.some((t) => t.titulo.toLowerCase() === normalizado.toLowerCase());
    if (repetido) throw new ConflictException('Já existe uma tarefa com o título "' + normalizado + '"');

    const limite = this.config.limitePendentes;
    if (this.tarefas.filter((t) => !t.concluida).length >= limite) {
      throw new ConflictException('Limite de ' + limite + ' tarefas pendentes atingido. Conclua alguma antes.');
    }

    const tarefa: Tarefa = {
      id: this.proximoId++,
      titulo: normalizado,
      concluida: false,
      criadaEm: this.relogio.agora().toISOString(),
    };
    this.tarefas.push(tarefa);
    return tarefa;
  }

  concluir(id: number): Tarefa {
    const tarefa = this.buscarPorId(id);
    if (tarefa.concluida) throw new ConflictException('A tarefa ' + id + ' já está concluída');
    tarefa.concluida = true;
    return tarefa;
  }

  remover(id: number): void {
    this.buscarPorId(id);
    this.tarefas = this.tarefas.filter((t) => t.id !== id);
  }
}`,
          lineNotes: [
            { line: '2', note: 'Os tokens são valores (import normal); as interfaces, só tipos (import type).' },
            { line: '16-19', note: 'Duas dependências que antes estavam escondidas no código agora aparecem no construtor.' },
            { line: '37-40', note: 'O limite vem da configuração injetada, e não de uma constante no arquivo.' },
            { line: '46', note: 'A data vem do relógio injetado. Num teste, um relógio fixo torna o resultado previsível.' },
          ],
        },
      },
    ],
    run: [
      'cd tarefas-api',
      '# O exemplo verificar-regras.ts da aula de Services usa new TarefasService() sem argumentos: apague-o ou passe { limitePendentes: 5 } e { agora: () => new Date() }',
      'npm run start:dev',
      '# Para testar outro limite, no PowerShell:',
      '$env:LIMITE_PENDENTES=2; npm run start:dev',
    ],
    httpTests: [
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Estudar providers" }`,
        expected: '201 com a tarefa, agora com "criadaEm" no formato ISO (ex.: "2026-11-26T13:40:00.000Z").',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Outra tarefa" }`,
        expected: 'Com LIMITE_PENDENTES=2, a terceira tarefa pendente recebe 409 "Limite de 2 tarefas pendentes atingido". Com o padrão, o limite é 5.',
      },
    ],
    expected: `O comportamento muda pela configuração, sem editar o service.
Remova o @Inject(CONFIG_TAREFAS) e salve: a aplicação não sobe, porque o parâmetro tem tipo de interface. Restaure o decorator.`,
  },
  commonErrors: [
    {
      title: 'Esquecer o @Inject em um token que não é classe',
      symptom: "Nest can't resolve dependencies of the TarefasService (?, Symbol(RELOGIO)). Please make sure that the argument at index [0] is available in the current module.",
      cause: 'O tipo do parâmetro é uma interface; o metadado só informa Object.',
      fix: 'Adicione @Inject(CONFIG_TAREFAS) antes do parâmetro.',
    },
    {
      title: 'Token registrado em um módulo e usado em outro sem exports',
      symptom: 'O mesmo erro de dependência não encontrada, citando o token (por exemplo, Symbol(CONFIG_TAREFAS)).',
      cause: 'Providers personalizados também são privados do módulo.',
      fix: 'Exporte pelo token (exports: [CONFIG_TAREFAS]) e importe o módulo, ou registre a configuração em um módulo próprio.',
    },
    {
      title: 'Dois Symbols com a mesma descrição',
      symptom: 'O provider "existe", mas a injeção falha: o Nest não encontra o token.',
      cause: "Symbol('CONFIG') criado em dois arquivos gera dois tokens diferentes.",
      fix: 'Crie cada token uma única vez, em um arquivo próprio (como tarefas.tokens.ts), e importe-o onde precisar.',
    },
    {
      title: 'Ler process.env espalhado pelo código',
      symptom: 'Variáveis lidas em vários lugares, com valores padrão diferentes e conversões repetidas.',
      cause: 'A configuração não passou por um único provider.',
      fix: 'Leia e converta o ambiente uma vez, em um provider de configuração. No Módulo 07 isso evolui para @nestjs/config com validação.',
    },
  ],
  guidance: {
    before: ['Constructors: design:paramtypes e por que interfaces não são injetáveis.', 'Feature Modules: exports.'],
    now: ['useClass, useValue, useFactory e useExisting.', 'Tokens: classes, strings e Symbols.', '@Inject.', 'Configuração como provider.'],
    after: ['Dependency Injection: o container e a troca de providers em testes.', 'Módulo 06: PrismaService como provider.'],
    officialDocs: [
      { label: 'NestJS · Providers', url: 'https://docs.nestjs.com/providers' },
      { label: 'NestJS · Custom providers', url: 'https://docs.nestjs.com/fundamentals/custom-providers' },
    ],
  },
}

export default lesson
