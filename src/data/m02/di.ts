import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'Injeção de dependência (DI) é a técnica de entregar a uma classe, de fora, os objetos de que ela precisa, em vez de ela mesma criá-los. No Nest, quem entrega é o container de injeção: ele lê o que cada classe pede no construtor, cria cada provider uma vez e monta tudo na ordem certa.',
    purpose:
      'Separar o uso da construção. O TarefasService usa uma configuração e um relógio, mas não decide quais. Quem decide é o módulo, ou o teste. Trocar uma peça vira uma mudança de configuração, e não de código.',
    problem:
      'Quando cada classe chama new nas suas dependências, a aplicação vira uma corrente rígida: testar o service exige o banco real, simular uma data exige mudar o relógio do sistema, e trocar o serviço de e-mail exige editar todas as classes que o criam.',
    whyExists:
      'É uma aplicação do princípio de inversão de controle: em vez de o seu código controlar a criação dos objetos, o framework controla, e o seu código só declara o que precisa. O Nest herdou o modelo de frameworks como Angular e Spring.',
    whereUsed:
      'Em toda a aplicação Nest, e principalmente nos testes: o @nestjs/testing monta um módulo de teste em que qualquer provider pode ser trocado por uma versão controlada.',
  },
  technical: {
    internals: [
      'Na inicialização, o container monta um grafo de dependências a partir dos construtores (design:paramtypes e @Inject). Ele cria primeiro quem não depende de ninguém e vai subindo: config e relógio antes do TarefasService, e o service antes do TarefasController.',
      'Cada provider é criado uma única vez por padrão (escopo DEFAULT, singleton) e reaproveitado em todos os lugares que o pedem. Existem os escopos REQUEST e TRANSIENT, para casos específicos, com custo de desempenho.',
      'A classe não sabe quem a criou nem de onde vieram as dependências. Por isso o mesmo TarefasService funciona com a configuração real em produção e com uma configuração de teste, sem nenhum if.',
      'Test.createTestingModule recebe a mesma descrição de um @Module, compila um container isolado e permite registrar providers falsos (useValue) para qualquer token, ou trocar um provider de um módulo real com overrideProvider.',
      'modulo.get(TarefasService) devolve a instância criada pelo container, já com as dependências injetadas, pronta para ser testada.',
    ],
    concepts: [
      { term: 'Inversão de controle', description: 'O framework cria e conecta os objetos; o seu código só declara do que precisa.' },
      { term: 'Container de DI', description: 'O componente do Nest que guarda os providers e resolve as dependências.' },
      { term: 'Grafo de dependências', description: 'Quem depende de quem. Define a ordem de criação.' },
      { term: 'Escopo singleton', description: 'Uma instância por provider, compartilhada. É o padrão do Nest.' },
      { term: 'Test.createTestingModule', description: 'Monta um container de teste com os providers que você escolher.' },
      { term: 'Dublê de teste', description: 'Uma versão controlada de uma dependência: relógio fixo, configuração mínima, repositório em memória.' },
    ],
    examples: [
      {
        title: 'o que o container faz por você',
        description: 'A mesma composição feita à mão. Em uma aplicação real seriam dezenas de classes, na ordem certa.',
        sample: {
          filename: 'composicao-manual.ts',
          language: 'ts',
          code: `import { TarefasController } from './tarefas/tarefas.controller.js';
import { TarefasService } from './tarefas/tarefas.service.js';

const config = { limitePendentes: Number(process.env.LIMITE_PENDENTES ?? 5) };
const relogio = { agora: () => new Date() };

const tarefasService = new TarefasService(config, relogio);
const tarefasController = new TarefasController(tarefasService);

console.log(tarefasController.listar());`,
          lineNotes: [
            { line: '4-5', note: 'Primeiro, as dependências sem dependências.' },
            { line: '7', note: 'Depois, quem depende delas, recebendo-as pelo construtor.' },
            { line: '8', note: 'Por fim, o controller com o service. A ordem é obrigatória e cresce com a aplicação.' },
            { line: '10', note: 'Funciona, mas cada novo provider exige editar esta composição. O container do Nest faz isso a partir dos módulos.' },
          ],
        },
      },
      {
        title: 'trocar um provider de um módulo real',
        description: 'overrideProvider substitui um provider de um módulo existente, sem reescrever a lista de providers.',
        sample: {
          filename: 'override.spec.ts',
          language: 'ts',
          code: `import { Test } from '@nestjs/testing';
import { TarefasModule } from './tarefas/tarefas.module.js';
import { TarefasService } from './tarefas/tarefas.service.js';
import { RELOGIO } from './tarefas/tarefas.tokens.js';

it('usa o módulo real com um relógio fixo', async () => {
  const modulo = await Test.createTestingModule({ imports: [TarefasModule] })
    .overrideProvider(RELOGIO)
    .useValue({ agora: () => new Date('2026-01-01T09:00:00.000Z') })
    .compile();

  const service = modulo.get(TarefasService);
  expect(service.criar('Estudar DI').criadaEm).toBe('2026-01-01T09:00:00.000Z');
});`,
          lineNotes: [
            { line: '7', note: 'Importa o módulo de verdade, com todos os seus providers.' },
            { line: '8-9', note: 'Só o relógio é trocado. Config e service continuam os reais.' },
            { line: '12', note: 'O service vem do container, com o relógio falso já injetado.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'O container montando o TarefasModule',
      steps: [
        { label: 'Lê os providers do módulo', detail: 'TarefasService, CONFIG_TAREFAS (factory) e RELOGIO (valor).' },
        { label: 'Monta o grafo', detail: 'TarefasService depende de CONFIG_TAREFAS e RELOGIO; TarefasController depende de TarefasService.' },
        { label: 'Cria as folhas', detail: 'Executa a factory da config e guarda o valor do relógio.' },
        { label: 'Cria o TarefasService', detail: 'new TarefasService(config, relogio).' },
        { label: 'Cria o TarefasController', detail: 'new TarefasController(service), com a mesma instância usada pelo relatório.' },
        { label: 'Em testes, o mesmo processo', detail: 'Com os providers que o teste registrou ou substituiu.' },
      ],
    },
  ],
  practice: {
    goal:
      'Escrever o primeiro teste do tarefas-api: um módulo de teste com configuração e relógio controlados, para verificar as regras do service de forma previsível.',
    structure: `tarefas-api/
├── vitest.config.ts       (gerado pela CLI)
└── src/tarefas/
    ├── tarefas.service.ts
    ├── tarefas.tokens.ts
    └── tarefas.service.spec.ts`,
    files: [
      {
        path: 'src/tarefas/tarefas.service.spec.ts',
        purpose: 'Um teste com Vitest (padrão dos projetos ESM do Nest 12). Configuração e relógio são dublês controlados pelo teste.',
        sample: {
          language: 'ts',
          code: `import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TarefasController } from './tarefas.controller.js';
import { TarefasService } from './tarefas.service.js';
import { CONFIG_TAREFAS, RELOGIO } from './tarefas.tokens.js';

describe('TarefasService', () => {
  let service: TarefasService;
  let controller: TarefasController;

  beforeEach(async () => {
    const modulo = await Test.createTestingModule({
      controllers: [TarefasController],
      providers: [
        TarefasService,
        { provide: CONFIG_TAREFAS, useValue: { limitePendentes: 1 } },
        { provide: RELOGIO, useValue: { agora: () => new Date('2026-01-01T09:00:00.000Z') } },
      ],
    }).compile();
    service = modulo.get(TarefasService);
    controller = modulo.get(TarefasController);
  });

  it('usa o relógio injetado', () => {
    expect(service.criar('A').criadaEm).toBe('2026-01-01T09:00:00.000Z');
  });

  it('respeita o limite configurado', () => {
    service.criar('A');
    expect(() => service.criar('B')).toThrow(ConflictException);
  });

  it('controller recebe a mesma instância', () => {
    service.criar('A');
    expect(controller.listar()).toHaveLength(1);
  });
});`,
          lineNotes: [
            { line: '7', note: 'describe, it, expect e beforeEach são globais no Vitest com a configuração gerada pela CLI.' },
            { line: '11-19', note: 'beforeEach monta um container novo a cada teste: nenhum teste herda tarefas criadas por outro.' },
            { line: '16', note: 'Limite 1, em vez de 5: o teste da regra fica curto e não depende do ambiente.' },
            { line: '17', note: 'Relógio fixo: a data esperada é conhecida, então o teste é determinístico.' },
            { line: '20-21', note: 'As instâncias vêm do container, com as dependências já injetadas.' },
            { line: '33-36', note: 'Prova o singleton: o que o service criou aparece na listagem do controller.' },
          ],
        },
      },
    ],
    run: ['cd tarefas-api', 'npm test'],
    verify:
      'Os três testes devem passar. Depois, mude o relógio do teste para outra data sem mudar a expectativa: o primeiro teste falha, mostrando a data recebida. Troque o limite para 2: o segundo falha, porque a segunda tarefa passa a ser aceita. Os testes medem exatamente as regras.',
    expected: ` Test Files  1 passed (1)
      Tests  3 passed (3)`,
  },
  commonErrors: [
    {
      title: "Nest can't resolve dependencies of the TarefasService (?, Symbol(RELOGIO)) no teste",
      symptom: 'O teste falha no beforeEach, antes de qualquer it.',
      cause: 'O módulo de teste não registrou um provider para um token que o service pede.',
      fix: 'Registre todos os tokens do construtor no createTestingModule (com useValue para os dublês), ou importe o módulo real e use overrideProvider.',
    },
    {
      title: 'Testes que passam sozinhos e falham juntos',
      symptom: 'A ordem dos testes muda o resultado.',
      cause: 'O container (e o estado do service) foi criado uma vez, em beforeAll, e compartilhado entre testes.',
      fix: 'Crie o módulo em beforeEach, para que cada teste comece com um service novo.',
    },
    {
      title: 'Usar jest.fn() em um projeto ESM do Nest 12',
      symptom: 'ReferenceError: jest is not defined.',
      cause: 'O projeto gerado usa Vitest. Exemplos de versões anteriores usam Jest.',
      fix: 'Use vi.fn() e vi.spyOn() do Vitest. A API de expect é praticamente a mesma.',
    },
    {
      title: 'Instanciar com new no teste e perder a DI',
      symptom: 'O teste precisa repetir a montagem de várias dependências, e quebra sempre que um construtor muda.',
      cause: 'A composição foi feita à mão, em vez de pedir ao container.',
      fix: 'Use Test.createTestingModule e modulo.get(). Para classes sem dependências, new continua aceitável.',
    },
  ],
  guidance: {
    before: ['Providers: tokens, useValue e useFactory.', 'Services: regras de negócio.'],
    now: ['Inversão de controle.', 'O container e o grafo de dependências.', 'Escopo singleton.', 'Test.createTestingModule e overrideProvider.'],
    after: ['Decorators: como @Injectable e @Inject gravam o que o container lê.', 'Módulo 08: testes automatizados em profundidade.'],
    officialDocs: [
      { label: 'NestJS · Providers (dependency injection)', url: 'https://docs.nestjs.com/providers' },
      { label: 'NestJS · Custom providers', url: 'https://docs.nestjs.com/fundamentals/custom-providers' },
      { label: 'NestJS · Injection scopes', url: 'https://docs.nestjs.com/fundamentals/injection-scopes' },
      { label: 'NestJS · Testing', url: 'https://docs.nestjs.com/fundamentals/testing' },
    ],
  },
}

export default lesson
