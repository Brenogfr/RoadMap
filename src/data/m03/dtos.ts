import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'DTO (Data Transfer Object) é uma classe que descreve o formato dos dados que entram ou saem da API: quais campos existem, de que tipo e quais são opcionais. No Nest, o DTO é o tipo do parâmetro @Body() e, mais adiante neste módulo, também carrega as regras de validação.',
    purpose:
      'Ser o contrato da rota. Quem lê CriarTarefaDto sabe exatamente o que POST /tarefas aceita, e o service passa a receber um objeto com forma conhecida, em vez de "qualquer coisa que veio no JSON".',
    problem:
      'Até o Módulo 02, a rota recebia { titulo?: unknown } e validava à mão com if e typeof. Cada rota repetia esse trabalho, e o formato esperado ficava espalhado em condicionais. Pior: declarar um tipo TypeScript no @Body() não verifica nada em tempo de execução. Um JSON com titulo: 123 entra e quebra lá dentro.',
    whyExists:
      'Separar a forma dos dados de transporte (o que circula pela rede) das estruturas internas da aplicação. O conceito vem de arquiteturas em camadas: objetos simples, sem regras, para transportar dados entre fronteiras.',
    whereUsed:
      'Em toda rota que recebe corpo, query string ou parâmetros estruturados. Também em respostas, para controlar quais campos saem da API (nunca a senha de um usuário, por exemplo).',
  },
  technical: {
    internals: [
      'Um DTO é uma classe, e não uma interface, por um motivo prático: classes existem em tempo de execução. Interfaces são apagadas na compilação; classes continuam lá e podem carregar metadados de validação (próximas aulas).',
      'Declarar @Body() dados: CriarTarefaDto não transforma nem valida nada. O Nest entrega o objeto que o Express montou a partir do JSON; o tipo só existe para o compilador.',
      'Sem validação, o service confia em dados que ninguém conferiu: um número no lugar do título derruba a rota com 500, e uma string no lugar da prioridade é gravada como se fosse válida.',
      'O DTO de entrada é diferente da entidade interna. A Tarefa tem id, criadaEm e concluida, que o cliente não deve enviar. O DTO de criação contém só o que o cliente pode informar.',
      'Por convenção, DTOs ficam em uma pasta dto do módulo e seguem o padrão verbo + recurso + Dto: CriarTarefaDto, AtualizarTarefaDto.',
    ],
    concepts: [
      { term: 'DTO', description: 'Classe que descreve os dados que atravessam a fronteira da API.' },
      { term: 'Contrato', description: 'O que a rota aceita e devolve. O DTO o torna explícito e reutilizável.' },
      { term: 'Entidade x DTO', description: 'A entidade é o dado interno (com id e datas); o DTO é só o que o cliente envia.' },
      { term: 'Classe x interface', description: 'Classes existem em tempo de execução e podem ter decorators; interfaces não.' },
      { term: 'Type erasure', description: 'Os tipos somem na compilação: o DTO sozinho não protege nada em runtime.' },
      { term: 'DTO de resposta', description: 'Controla o que sai: só os campos que o cliente deve ver.' },
    ],
    examples: [
      {
        title: 'o tipo não protege nada',
        description: 'O mesmo JSON passa pelo controller tipado e chega ao service com os tipos errados.',
        sample: {
          filename: 'requisicoes.http',
          language: 'http',
          code: `POST /tarefas HTTP/1.1
Content-Type: application/json

{"titulo":123}

HTTP/1.1 500 Internal Server Error

{"statusCode":500,"message":"Internal server error"}

POST /tarefas HTTP/1.1
Content-Type: application/json

{"titulo":"Prioridade estranha","prioridade":"alta","admin":true}

HTTP/1.1 201 Created

{"id":2,"titulo":"Prioridade estranha","descricao":null,"prioridade":"alta",...}`,
          lineNotes: [
            { line: '4', note: 'titulo deveria ser texto. O TypeScript não vê esse JSON: ele chega em tempo de execução.' },
            { line: '6-8', note: 'O service chama dados.titulo.trim() e recebe TypeError: dados.titulo.trim is not a function. Um erro do cliente virou 500.' },
            { line: '13', note: 'prioridade deveria ser um número de 1 a 5, e admin nem existe no DTO.' },
            { line: '15-17', note: 'Aceito e gravado. Dados inválidos dentro do sistema são piores que um erro: aparecem depois, longe da origem.' },
          ],
        },
      },
      {
        title: 'entidade, DTO de entrada e DTO de resposta',
        description: 'Três formatos diferentes para três papéis diferentes.',
        sample: {
          filename: 'formatos.ts',
          language: 'ts',
          code: `// Entidade: como a tarefa existe dentro da aplicação
interface Tarefa {
  id: number;
  titulo: string;
  concluida: boolean;
  criadaEm: string;
  criadaPorUsuarioId: number;
}

// DTO de entrada: só o que o cliente pode enviar
class CriarTarefaDto {
  titulo: string;
}

// DTO de resposta: só o que o cliente deve ver
class TarefaResposta {
  id: number;
  titulo: string;
  concluida: boolean;
}`,
          lineNotes: [
            { line: '2-8', note: 'A entidade tem campos que só o servidor define (id, datas) e campos internos (quem criou).' },
            { line: '11-13', note: 'O cliente não escolhe id nem concluida. Se puder enviar, alguém vai enviar.' },
            { line: '16-20', note: 'A resposta omite o campo interno. No Módulo 07, o mesmo cuidado impede que a senha de um usuário saia da API.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'O caminho do JSON até o service, ainda sem validação',
      steps: [
        { label: 'O cliente envia o corpo', detail: 'Texto JSON, com qualquer formato.' },
        { label: 'O Express interpreta o JSON', detail: 'Vira um objeto JavaScript comum. JSON malformado já é recusado aqui, com 400.' },
        { label: 'O Nest entrega o objeto ao @Body()', detail: 'O tipo CriarTarefaDto é só uma anotação: nada é conferido.' },
        { label: 'O service usa os dados', detail: 'Se o formato estiver errado, o erro aparece aqui (500) ou, pior, nunca aparece e o dado ruim é gravado.' },
        { label: 'Próximas aulas', detail: 'class-validator descreve as regras, class-transformer cria a instância e o ValidationPipe confere tudo antes do controller.' },
      ],
    },
  ],
  practice: {
    goal:
      'Começar o Módulo 03 com o tarefas-api do fim do Módulo 02: trocar o corpo genérico por um CriarTarefaDto, adicionar descrição e prioridade às tarefas e observar que, sem validação, dados errados entram na API.',
    structure: `tarefas-api/src/
├── main.ts
├── app.module.ts
└── tarefas/
    ├── dto/
    │   └── criar-tarefa.dto.ts
    ├── tarefas.controller.ts
    └── tarefas.service.ts`,
    files: [
      {
        path: 'src/app.module.ts',
        purpose:
          'Remova os componentes didáticos da aula de Fluxo (middleware, guard, interceptor e o ErrosFilter). O filtro volta melhorado na última aula deste módulo; até lá, ele esconderia as mensagens de validação.',
        sample: { language: 'ts', code: `import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller.js';
import { RelatoriosModule } from './relatorios/relatorios.module.js';
import { TarefasModule } from './tarefas/tarefas.module.js';

@Module({
  imports: [TarefasModule, RelatoriosModule],
  controllers: [HealthController],
})
export class AppModule {}` },
      },
      {
        path: 'src/tarefas/dto/criar-tarefa.dto.ts',
        purpose: 'O primeiro DTO: só a forma dos dados, ainda sem nenhuma regra.',
        sample: {
          language: 'ts',
          code: `export class CriarTarefaDto {
  titulo: string;
  descricao?: string;
  prioridade?: number;
}`,
          lineNotes: [
            { line: '1', note: 'Uma classe, não uma interface: nas próximas aulas ela recebe decorators de validação.' },
            { line: '2', note: 'Sem inicializador: funciona porque o tsconfig do Nest desliga strictPropertyInitialization.' },
            { line: '3-4', note: 'Campos opcionais: o cliente pode omiti-los.' },
          ],
        },
      },
      {
        path: 'src/tarefas/tarefas.service.ts',
        purpose: 'O service recebe o DTO inteiro e ganha descrição e prioridade (padrão 3). O título único passa para um método privado, que a aula de Update DTO reaproveita.',
        sample: {
          language: 'ts',
          code: `import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CriarTarefaDto } from './dto/criar-tarefa.dto.js';
import { CONFIG_TAREFAS, RELOGIO, type ConfigTarefas, type Relogio } from './tarefas.tokens.js';

export interface Tarefa {
  id: number;
  titulo: string;
  descricao: string | null;
  prioridade: number;
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

  criar(dados: CriarTarefaDto): Tarefa {
    const titulo = dados.titulo.trim();
    this.garantirTituloUnico(titulo);

    const limite = this.config.limitePendentes;
    if (this.tarefas.filter((t) => !t.concluida).length >= limite) {
      throw new ConflictException('Limite de ' + limite + ' tarefas pendentes atingido. Conclua alguma antes.');
    }

    const tarefa: Tarefa = {
      id: this.proximoId++,
      titulo,
      descricao: dados.descricao ?? null,
      prioridade: dados.prioridade ?? 3,
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

  private garantirTituloUnico(titulo: string, ignorarId?: number): void {
    const repetido = this.tarefas.some((t) => t.id !== ignorarId && t.titulo.toLowerCase() === titulo.toLowerCase());
    if (repetido) throw new ConflictException('Já existe uma tarefa com o título "' + titulo + '"');
  }
}`,
          lineNotes: [
            { line: '2', note: 'import type: o service só usa o DTO como tipo.' },
            { line: '35-36', note: 'O service confia que titulo é texto. Com titulo: 123, trim() lança TypeError e a rota responde 500.' },
            { line: '47-48', note: 'Valores padrão para campos opcionais. prioridade "alta" seria gravada como está, porque ninguém conferiu.' },
            { line: '68-71', note: 'A regra de título único, agora reutilizável. ignorarId permite atualizar uma tarefa sem conflitar com ela mesma.' },
          ],
        },
      },
      {
        path: 'src/tarefas/tarefas.controller.ts',
        purpose: 'A validação manual do Módulo 02 sai do criar: o controller só recebe o DTO e repassa.',
        sample: {
          language: 'ts',
          code: `import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CriarTarefaDto } from './dto/criar-tarefa.dto.js';
import { TarefasService, type Tarefa } from './tarefas.service.js';

@Controller('tarefas')
export class TarefasController {
  constructor(private readonly tarefasService: TarefasService) {}

  @Get()
  listar(@Query('concluida') concluida?: string): readonly Tarefa[] {
    if (concluida === undefined) return this.tarefasService.listar();
    if (concluida !== 'true' && concluida !== 'false') {
      throw new BadRequestException('concluida deve ser true ou false');
    }
    return this.tarefasService.listar(concluida === 'true');
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number): Tarefa {
    return this.tarefasService.buscarPorId(id);
  }

  @Post()
  criar(@Body() dados: CriarTarefaDto): Tarefa {
    return this.tarefasService.criar(dados);
  }

  @Patch(':id/concluir')
  concluir(@Param('id', ParseIntPipe) id: number): Tarefa {
    return this.tarefasService.concluir(id);
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number): void {
    this.tarefasService.remover(id);
  }
}`,
          lineNotes: [{ line: '35-38', note: 'Uma linha, sem if: é o objetivo. Por enquanto, porém, nada garante que dados seja mesmo um CriarTarefaDto.' }],
        },
      },
    ],
    run: [
      'cd tarefas-api',
      "# O teste da aula de Dependency Injection chama criar('A'): troque por criar({ titulo: 'Tarefa A' })",
      'npm run start:dev',
    ],
    httpTests: [
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Estudar DTOs", "prioridade": 2 }`,
        expected: '201 com descricao null e prioridade 2.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": 123 }`,
        expected: '500 Internal Server Error. No terminal: TypeError: dados.titulo.trim is not a function.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Prioridade estranha", "prioridade": "alta", "admin": true }`,
        expected: '201: aceito e gravado com "prioridade": "alta". É exatamente o problema que as próximas aulas resolvem.',
      },
    ],
    expected: `O DTO deixou o controller mais limpo, mas não protege a API:
um erro do cliente vira 500, e dados inválidos são gravados.`,
  },
  commonErrors: [
    {
      title: 'Achar que o tipo do @Body() valida o corpo',
      symptom: 'Dados com tipos errados chegam ao service; erros aparecem como 500 ou como dados inválidos gravados.',
      cause: 'Tipos TypeScript são apagados na compilação. O Nest não confere o corpo contra a classe sem um pipe de validação.',
      fix: 'Use DTOs com class-validator e o ValidationPipe (aulas seguintes). Até lá, nenhum dado de entrada é confiável.',
    },
    {
      title: 'Usar interface no lugar de classe para o DTO',
      symptom: 'Depois de configurar o ValidationPipe, a validação simplesmente não acontece para aquela rota.',
      cause: 'Interfaces não existem em tempo de execução, então não há onde guardar regras nem o que instanciar.',
      fix: 'DTOs são sempre classes.',
    },
    {
      title: 'Receber a entidade inteira como corpo',
      symptom: 'O cliente consegue enviar id, concluida ou criadaEm, e o servidor aceita.',
      cause: '@Body() dados: Tarefa expõe campos que só o servidor deveria definir.',
      fix: 'Crie um DTO com apenas os campos que o cliente pode informar.',
    },
    {
      title: 'Devolver objetos internos sem filtrar',
      symptom: 'Campos internos ou sensíveis aparecem na resposta JSON.',
      cause: 'O controller retorna a entidade como está.',
      fix: 'Monte a resposta com só os campos necessários (um DTO de resposta ou um mapeamento explícito).',
    },
  ],
  guidance: {
    before: ['Módulo 02 inteiro, em especial Controllers e Services.', 'Módulo 01: TypeScript (type erasure).'],
    now: ['O que é um DTO e por que é uma classe.', 'Entidade x DTO de entrada x DTO de resposta.', 'Por que o tipo sozinho não valida.'],
    after: ['Class Validator: regras declarativas nos DTOs.', 'Class Transformer e ValidationPipe.'],
    officialDocs: [
      { label: 'NestJS · Controllers (DTOs no @Body)', url: 'https://docs.nestjs.com/controllers' },
      { label: 'NestJS · Validation', url: 'https://docs.nestjs.com/application/validation' },
    ],
  },
}

export default lesson
