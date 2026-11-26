import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'Um feature module é um módulo que agrupa tudo o que pertence a um domínio da aplicação: o controller, o service e o que mais for específico daquele assunto (tarefas, usuários, pedidos). O AppModule apenas importa esses módulos.',
    purpose:
      'Organizar a aplicação por assunto, e não por tipo de arquivo. Quem precisa mexer em tarefas encontra tudo em src/tarefas, e cada módulo decide o que deixa outros módulos usarem.',
    problem:
      'Sem divisão por domínio, todos os services ficam visíveis para todos, e qualquer parte do código passa a depender de qualquer outra. Com o tempo, mudar uma regra de tarefas quebra relatórios, usuários e notificações, e ninguém sabe exatamente quem usa o quê.',
    whyExists:
      'Módulos com fronteiras explícitas (o que é público fica em exports) são a forma do Nest de aplicar encapsulamento no nível da aplicação, não só no nível da classe.',
    whereUsed:
      'Em qualquer API Nest com mais de um assunto. É também o primeiro passo para, um dia, extrair um domínio para um serviço separado: as dependências entre módulos já estão declaradas.',
  },
  technical: {
    internals: [
      'Cada módulo é um escopo próprio no container de injeção de dependência. Um provider declarado em TarefasModule só pode ser injetado dentro de TarefasModule.',
      'Para outro módulo usar esse provider, duas coisas precisam acontecer: TarefasModule lista o provider em exports, e o outro módulo lista TarefasModule em imports.',
      'Módulos são singletons: importar TarefasModule em dois lugares não cria dois TarefasService. A mesma instância é compartilhada por todos que importam o módulo.',
      'Importar um módulo não dá acesso aos imports dele (não é transitivo). Se RelatoriosModule precisa de algo de UsuariosModule, precisa importar UsuariosModule também, a menos que alguém reexporte.',
      'nest generate module tarefas cria a pasta, o arquivo do módulo e o adiciona aos imports do AppModule. nest g controller e nest g service criam as classes e as registram no módulo da pasta.',
    ],
    concepts: [
      { term: 'Feature module', description: 'Módulo que agrupa controller, service e afins de um único domínio.' },
      { term: 'Encapsulamento', description: 'Providers são privados do módulo por padrão. Só o que está em exports é visível para fora.' },
      { term: 'exports', description: 'A API pública do módulo: os providers que outros módulos podem injetar.' },
      { term: 'imports', description: 'Os módulos de que este depende. Declara a dependência de forma explícita.' },
      { term: 'Módulo compartilhado', description: 'Todo módulo é compartilhável: importado em vários lugares, entrega a mesma instância.' },
      { term: 'Organização por domínio', description: 'src/tarefas, src/usuarios... em vez de src/controllers, src/services.' },
    ],
    examples: [
      {
        title: 'um módulo que expõe só o necessário',
        description: 'TarefasModule registra seu controller e seu service, e exporta apenas o service.',
        sample: {
          filename: 'src/tarefas/tarefas.module.ts',
          language: 'ts',
          code: `import { Module } from '@nestjs/common';
import { TarefasController } from './tarefas.controller.js';
import { TarefasService } from './tarefas.service.js';

@Module({
  controllers: [TarefasController],
  providers: [TarefasService],
  exports: [TarefasService],
})
export class TarefasModule {}`,
          lineNotes: [
            { line: '6', note: 'As rotas de tarefas pertencem a este módulo. Elas existem assim que o módulo entra no grafo.' },
            { line: '7', note: 'O Nest cria um TarefasService para este módulo. Sem a linha seguinte, ninguém de fora poderia usá-lo.' },
            { line: '8', note: 'Exportar é uma decisão de design: diz que outros domínios podem depender deste service.' },
          ],
        },
      },
      {
        title: 'esquecer o exports',
        description: 'RelatoriosModule importa TarefasModule, mas TarefasService não está em exports.',
        sample: {
          filename: 'terminal',
          language: 'text',
          code: `ERROR [ExceptionHandler] UnknownDependenciesException [Error]:
Nest can't resolve dependencies of the RelatoriosController (?).
Please make sure that the argument TarefasService at index [0]
is available in the RelatoriosModule module.

- If TarefasService is exported from a separate @Module, is that
  module imported within RelatoriosModule?`,
          lineNotes: [
            { line: '2-4', note: 'O provider existe, mas não está visível no escopo de RelatoriosModule.' },
            { line: '6-7', note: 'A dica cobre os dois lados: o módulo de origem precisa exportar, e o de destino precisa importar.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Como RelatoriosController recebe o TarefasService',
      steps: [
        { label: 'AppModule importa os dois módulos', detail: 'TarefasModule e RelatoriosModule entram no grafo.' },
        { label: 'TarefasModule cria o TarefasService', detail: 'Uma única instância, guardada no escopo do módulo.' },
        { label: 'TarefasModule exporta o service', detail: 'A instância passa a ser visível para quem importar o módulo.' },
        { label: 'RelatoriosModule importa TarefasModule', detail: 'O escopo de relatórios passa a enxergar os exports de tarefas.' },
        { label: 'O Nest cria o RelatoriosController', detail: 'Encontra TarefasService no escopo e entrega a mesma instância usada pelo TarefasController.' },
      ],
    },
  ],
  practice: {
    goal:
      'Reorganizar o tarefas-api em dois feature modules: tarefas (lista as tarefas) e relatorios (usa o service de tarefas para montar um resumo). Os arquivos de exemplo app.controller e app.service deixam de ser usados.',
    structure: `tarefas-api/src/
├── main.ts
├── app.module.ts
├── health/
│   └── health.controller.ts
├── tarefas/
│   ├── tarefas.module.ts
│   ├── tarefas.controller.ts
│   └── tarefas.service.ts
└── relatorios/
    ├── relatorios.module.ts
    └── relatorios.controller.ts`,
    files: [
      {
        path: 'src/tarefas/tarefas.service.ts',
        purpose: 'Por enquanto, as tarefas ficam em um array em memória. Na aula de Services ele ganha regras de negócio.',
        sample: {
          language: 'ts',
          code: `import { Injectable } from '@nestjs/common';

export interface Tarefa {
  id: number;
  titulo: string;
  concluida: boolean;
}

@Injectable()
export class TarefasService {
  private readonly tarefas: Tarefa[] = [
    { id: 1, titulo: 'Estudar módulos do Nest', concluida: true },
    { id: 2, titulo: 'Criar o primeiro feature module', concluida: false },
  ];

  listar(): Tarefa[] {
    return this.tarefas;
  }
}`,
        },
      },
      {
        path: 'src/tarefas/tarefas.controller.ts',
        purpose: 'O controller de tarefas, com o prefixo de rota /tarefas.',
        sample: {
          language: 'ts',
          code: `import { Controller, Get } from '@nestjs/common';
import { TarefasService, type Tarefa } from './tarefas.service.js';

@Controller('tarefas')
export class TarefasController {
  constructor(private readonly tarefasService: TarefasService) {}

  @Get()
  listar(): Tarefa[] {
    return this.tarefasService.listar();
  }
}`,
        },
      },
      {
        path: 'src/tarefas/tarefas.module.ts',
        purpose: 'Igual ao exemplo da seção B: controller, provider e o export do service.',
        sample: {
          language: 'ts',
          code: `import { Module } from '@nestjs/common';
import { TarefasController } from './tarefas.controller.js';
import { TarefasService } from './tarefas.service.js';

@Module({
  controllers: [TarefasController],
  providers: [TarefasService],
  exports: [TarefasService],
})
export class TarefasModule {}`,
        },
      },
      {
        path: 'src/relatorios/relatorios.controller.ts',
        purpose: 'Um domínio que depende de outro: o relatório usa o service de tarefas, sem acessar o array diretamente.',
        sample: {
          language: 'ts',
          code: `import { Controller, Get } from '@nestjs/common';
import { TarefasService } from '../tarefas/tarefas.service.js';

@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly tarefasService: TarefasService) {}

  @Get('resumo')
  resumo() {
    const tarefas = this.tarefasService.listar();
    const concluidas = tarefas.filter((t) => t.concluida).length;
    return { total: tarefas.length, concluidas, pendentes: tarefas.length - concluidas };
  }
}`,
          lineNotes: [
            { line: '2', note: 'O import dá acesso à classe, que também serve de identificador para a injeção. Mas importar o arquivo não autoriza a injeção: quem decide é o sistema de módulos do Nest.' },
            { line: '8', note: "@Get('resumo') somado ao prefixo 'relatorios' resulta em GET /relatorios/resumo." },
          ],
        },
      },
      {
        path: 'src/relatorios/relatorios.module.ts',
        purpose: 'Declara a dependência de relatórios em tarefas, de forma explícita.',
        sample: {
          language: 'ts',
          code: `import { Module } from '@nestjs/common';
import { TarefasModule } from '../tarefas/tarefas.module.js';
import { RelatoriosController } from './relatorios.controller.js';

@Module({
  imports: [TarefasModule],
  controllers: [RelatoriosController],
})
export class RelatoriosModule {}`,
          lineNotes: [{ line: '6', note: 'Sem este import, a aplicação não sobe: TarefasService não estaria visível aqui.' }],
        },
      },
      {
        path: 'src/app.module.ts',
        purpose: 'O módulo raiz agora só compõe os domínios. Apague app.controller.ts e app.service.ts.',
        sample: {
          language: 'ts',
          code: `import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller.js';
import { RelatoriosModule } from './relatorios/relatorios.module.js';
import { TarefasModule } from './tarefas/tarefas.module.js';

@Module({
  imports: [TarefasModule, RelatoriosModule],
  controllers: [HealthController],
})
export class AppModule {}`,
        },
      },
    ],
    run: [
      'cd tarefas-api',
      '# Gere a base com a CLI e depois ajuste o conteúdo dos arquivos:',
      'nest g module tarefas',
      'nest g controller tarefas --no-spec',
      'nest g service tarefas --no-spec',
      'nest g module relatorios',
      'nest g controller relatorios --no-spec',
      'npm run start:dev',
    ],
    httpTests: [
      { method: 'GET', url: 'http://localhost:3000/tarefas', expected: '200 com as duas tarefas.' },
      { method: 'GET', url: 'http://localhost:3000/relatorios/resumo', expected: '200 com {"total":2,"concluidas":1,"pendentes":1}.' },
      { method: 'GET', url: 'http://localhost:3000/health', expected: '200: a rota do módulo raiz continua funcionando.' },
    ],
    verify:
      'Remova exports: [TarefasService] de tarefas.module.ts e salve: a aplicação não sobe, com o erro mostrado na seção B. Restaure e depois remova o imports de relatorios.module.ts: o mesmo erro aparece. São os dois lados da fronteira.',
    expected: `Log de inicialização com TarefasController {/tarefas} e RelatoriosController {/relatorios}.
O resumo usa os mesmos dados da listagem: é a mesma instância de TarefasService.`,
  },
  commonErrors: [
    {
      title: 'Provider usado em outro módulo sem estar em exports',
      symptom: "Nest can't resolve dependencies of the RelatoriosController (?).",
      cause: 'TarefasService é privado de TarefasModule até ser exportado.',
      fix: 'Adicione o provider em exports do módulo de origem e importe esse módulo no destino.',
    },
    {
      title: 'Declarar o mesmo service em providers de dois módulos',
      symptom: 'O relatório não enxerga as tarefas criadas: os dados parecem duplicados ou somem.',
      cause: 'Cada módulo que lista TarefasService em providers cria sua própria instância, com seu próprio array.',
      fix: 'Declare o provider em um único módulo, exporte-o e importe o módulo onde for preciso.',
    },
    {
      title: 'Importar o controller ou o service em vez do módulo',
      symptom: 'Erros de inicialização ao colocar TarefasService ou TarefasController em imports.',
      cause: 'imports aceita apenas módulos.',
      fix: 'Em imports vai TarefasModule; o que ele exporta fica disponível automaticamente.',
    },
    {
      title: 'Dependência circular entre módulos',
      symptom: "Em projetos ESM, a aplicação não sobe com ReferenceError: Cannot access 'RelatoriosModule' before initialization.",
      cause: 'TarefasModule importa RelatoriosModule e RelatoriosModule importa TarefasModule: um dos arquivos é lido antes de o outro terminar de ser definido.',
      fix: 'Repense a fronteira: normalmente um dos lados não deveria depender do outro, ou a parte comum vira um terceiro módulo. forwardRef existe, mas deve ser exceção.',
    },
  ],
  guidance: {
    before: ['AppModule: as quatro listas do @Module.'],
    now: ['Organização por domínio.', 'exports e imports como fronteira.', 'Instância única compartilhada.', 'Gerar módulos com a CLI.'],
    after: ['Controllers: rotas, parâmetros, corpo e status codes no Nest.', 'Módulo 09: modularização e fronteiras em profundidade.'],
    officialDocs: [
      { label: 'NestJS · Modules (feature e shared modules)', url: 'https://docs.nestjs.com/modules' },
      { label: 'NestJS · CLI overview', url: 'https://docs.nestjs.com/cli/overview' },
      { label: 'NestJS · Circular dependency', url: 'https://docs.nestjs.com/fundamentals/circular-dependency' },
    ],
  },
}

export default lesson
