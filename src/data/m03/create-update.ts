import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'Create DTO e Update DTO são os dois contratos de um recurso: o de criação define o que é obrigatório para algo existir; o de atualização permite mudar só parte dos campos. No Nest, o segundo é derivado do primeiro com PartialType, sem repetir as regras.',
    purpose:
      'Ter regras consistentes entre criar e atualizar (o título tem sempre de 3 a 80 caracteres) e, ao mesmo tempo, permitir atualizações parciais: um PATCH que muda só a prioridade não precisa reenviar o título.',
    problem:
      'Copiar o DTO de criação e trocar tudo para opcional duplica as regras: quando o limite do título mudar, alguém atualiza um arquivo e esquece o outro. Usar o mesmo DTO nas duas rotas obriga o PATCH a enviar todos os campos obrigatórios.',
    whyExists:
      'É a mesma ideia dos utility types do TypeScript (Partial, Pick, Omit) aplicada a classes com metadados. Os mapped types do Nest copiam também as regras de validação e as transformações, algo que Partial<T> não faz.',
    whereUsed:
      'Em todo CRUD: POST com o DTO de criação, PATCH com o de atualização. PickType e OmitType cobrem casos como "atualizar só o e-mail" ou "criar sem o campo X".',
  },
  technical: {
    internals: [
      'PartialType(CriarTarefaDto) cria uma nova classe com as mesmas propriedades, todas opcionais, e herda os decorators de validação e de transformação de cada uma, acrescentando um @IsOptional implícito.',
      'Por padrão, esse opcional implícito ignora tanto undefined quanto null. Ou seja: { "titulo": null } passa pela validação de um Update DTO, e o service recebe null. Com { skipNullProperties: false }, null volta a ser validado e recusado.',
      'Os mapped types (PartialType, PickType, OmitType, IntersectionType) vêm do pacote @nestjs/mapped-types. Projetos com Swagger usam as versões de @nestjs/swagger, que também atualizam a documentação.',
      'No service, um campo undefined significa "não alterar". Por isso a atualização confere cada campo antes de aplicar, em vez de espalhar o DTO sobre a entidade.',
      'Regras de negócio continuam no service: no PATCH, o título único precisa ignorar a própria tarefa (ignorarId), senão uma tarefa conflitaria consigo mesma.',
    ],
    concepts: [
      { term: 'Create DTO', description: 'O que é obrigatório e permitido para criar o recurso.' },
      { term: 'Update DTO', description: 'Os mesmos campos, todos opcionais, para atualizações parciais.' },
      { term: 'PartialType', description: 'Deriva uma classe com tudo opcional, herdando validações e transformações.' },
      { term: 'PickType / OmitType', description: 'Derivam uma classe com só alguns campos, ou sem alguns campos.' },
      { term: 'skipNullProperties', description: 'Opção do PartialType: com false, null é validado em vez de ignorado.' },
      { term: 'undefined = não alterar', description: 'A convenção que permite PATCH parcial no service.' },
    ],
    examples: [
      {
        title: 'derivando DTOs',
        description: 'Três formas de reaproveitar as regras do DTO de criação.',
        sample: {
          filename: 'derivados.dto.ts',
          language: 'ts',
          code: `import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import { CriarTarefaDto } from './tarefas/dto/criar-tarefa.dto.js';

export class AtualizarTarefaDto extends PartialType(CriarTarefaDto) {}

export class RenomearTarefaDto extends PickType(CriarTarefaDto, ['titulo'] as const) {}

export class CriarRascunhoDto extends OmitType(CriarTarefaDto, ['prioridade'] as const) {}`,
          lineNotes: [
            { line: '4', note: 'Todos os campos opcionais, mesmas regras.' },
            { line: '6', note: 'Só o título, obrigatório como no original. as const preserva os nomes literais para os tipos.' },
            { line: '8', note: 'Todos os campos, exceto prioridade.' },
          ],
        },
      },
      {
        title: 'o null que escapa',
        description: 'Com o PartialType padrão, um null passa pela validação e quebra o service.',
        sample: {
          filename: 'null.http',
          language: 'http',
          code: `# AtualizarTarefaDto extends PartialType(CriarTarefaDto)
PATCH /tarefas/1 HTTP/1.1
Content-Type: application/json

{"titulo":null}

HTTP/1.1 500 Internal Server Error

# AtualizarTarefaDto extends PartialType(CriarTarefaDto, { skipNullProperties: false })
HTTP/1.1 400 Bad Request
{"message":["titulo must be longer than or equal to 3 characters","titulo must be a string"],...}`,
          lineNotes: [
            { line: '5', note: 'null é diferente de undefined: o cliente pediu explicitamente para apagar o título.' },
            { line: '7', note: 'A validação foi pulada e o service chamou null.toLowerCase() ao conferir o título único.' },
            { line: '9-11', note: 'Com skipNullProperties: false, null é validado como qualquer valor e recusado com 400.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'PATCH /tarefas/1 com { "prioridade": 5 }',
      steps: [
        { label: 'O ValidationPipe valida com AtualizarTarefaDto', detail: 'titulo e descricao estão ausentes: o @IsOptional implícito pula as regras deles.' },
        { label: 'prioridade é validada', detail: 'Inteiro entre 1 e 5, as mesmas regras do DTO de criação.' },
        { label: 'O service busca a tarefa', detail: '404 se não existir.' },
        { label: 'Aplica só o que veio', detail: 'titulo undefined → não altera; prioridade 5 → altera.' },
        { label: 'Regras de negócio', detail: 'Se o título vier, o service confere se é único, ignorando a própria tarefa.' },
        { label: 'Resposta', detail: '200 com a tarefa atualizada.' },
      ],
    },
  ],
  practice: {
    goal:
      'Criar o AtualizarTarefaDto com PartialType e a rota PATCH /tarefas/:id, e corrigir o caso do null descoberto nos testes.',
    structure: `tarefas-api/src/tarefas/
├── dto/
│   ├── criar-tarefa.dto.ts
│   ├── atualizar-tarefa.dto.ts
│   └── listar-tarefas.query.ts
├── tarefas.controller.ts
└── tarefas.service.ts`,
    files: [
      {
        path: 'src/tarefas/dto/atualizar-tarefa.dto.ts',
        purpose: 'O DTO de atualização em uma linha, recusando null explicitamente.',
        sample: {
          language: 'ts',
          code: `import { PartialType } from '@nestjs/mapped-types';
import { CriarTarefaDto } from './criar-tarefa.dto.js';

export class AtualizarTarefaDto extends PartialType(CriarTarefaDto, { skipNullProperties: false }) {}`,
          lineNotes: [
            { line: '1', note: 'Instale com npm install @nestjs/mapped-types.' },
            { line: '4', note: 'Herda regras e @Transform do DTO de criação. skipNullProperties: false faz { "titulo": null } responder 400, e não 500.' },
          ],
        },
      },
      {
        path: 'src/tarefas/tarefas.service.ts',
        purpose: 'O método atualizar aplica só os campos enviados e reaproveita a regra de título único.',
        sample: {
          language: 'ts',
          code: `import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AtualizarTarefaDto } from './dto/atualizar-tarefa.dto.js';
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

  listar(filtro: { concluida?: boolean; prioridade?: number } = {}): readonly Tarefa[] {
    return this.tarefas
      .filter((t) => filtro.concluida === undefined || t.concluida === filtro.concluida)
      .filter((t) => filtro.prioridade === undefined || t.prioridade === filtro.prioridade)
      .map((t) => ({ ...t }));
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

  atualizar(id: number, dados: AtualizarTarefaDto): Tarefa {
    const tarefa = this.buscarPorId(id);
    if (dados.titulo !== undefined) {
      this.garantirTituloUnico(dados.titulo, id);
      tarefa.titulo = dados.titulo;
    }
    if (dados.descricao !== undefined) tarefa.descricao = dados.descricao;
    if (dados.prioridade !== undefined) tarefa.prioridade = dados.prioridade;
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
            { line: '2', note: 'Os dois DTOs entram só como tipos.' },
            { line: '59-68', note: 'Cada campo só é aplicado se veio na requisição: undefined significa "não alterar".' },
            { line: '62', note: 'Passa o próprio id para que a tarefa não conflite com ela mesma.' },
          ],
        },
      },
      {
        path: 'src/tarefas/tarefas.controller.ts',
        purpose: 'A nova rota PATCH /tarefas/:id. PATCH /tarefas/:id/concluir continua separada: concluir é uma ação com regra própria.',
        sample: {
          language: 'ts',
          code: `import {
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
import { AtualizarTarefaDto } from './dto/atualizar-tarefa.dto.js';
import { CriarTarefaDto } from './dto/criar-tarefa.dto.js';
import { ListarTarefasQuery } from './dto/listar-tarefas.query.js';
import { TarefasService, type Tarefa } from './tarefas.service.js';

@Controller('tarefas')
export class TarefasController {
  constructor(private readonly tarefasService: TarefasService) {}

  @Get()
  listar(@Query() filtro: ListarTarefasQuery): readonly Tarefa[] {
    return this.tarefasService.listar(filtro);
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number): Tarefa {
    return this.tarefasService.buscarPorId(id);
  }

  @Post()
  criar(@Body() dados: CriarTarefaDto): Tarefa {
    return this.tarefasService.criar(dados);
  }

  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dados: AtualizarTarefaDto): Tarefa {
    return this.tarefasService.atualizar(id, dados);
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
          lineNotes: [{ line: '37-40', note: 'Dois parâmetros: o id da rota, convertido e validado pelo ParseIntPipe, e o corpo, validado pelo AtualizarTarefaDto.' }],
        },
      },
    ],
    run: ['cd tarefas-api', 'npm install @nestjs/mapped-types', 'npm run start:dev'],
    httpTests: [
      { method: 'POST', url: 'http://localhost:3000/tarefas', body: `{ "titulo": "Estudar mapped types" }`, expected: '201 com a tarefa 1.' },
      { method: 'POST', url: 'http://localhost:3000/tarefas', body: `{ "titulo": "Outra tarefa" }`, expected: '201 com a tarefa 2.' },
      { method: 'PATCH', url: 'http://localhost:3000/tarefas/1', body: `{ "prioridade": 5 }`, expected: '200: só a prioridade muda.' },
      { method: 'PATCH', url: 'http://localhost:3000/tarefas/1', body: `{ "titulo": "  Estudar PartialType  " }`, expected: '200 com o título aparado: o @Transform foi herdado.' },
      { method: 'PATCH', url: 'http://localhost:3000/tarefas/1', body: `{ "prioridade": 0 }`, expected: '400 com "prioridade must not be less than 1": as regras foram herdadas.' },
      { method: 'PATCH', url: 'http://localhost:3000/tarefas/1', body: `{ "titulo": "outra TAREFA" }`, expected: '409: título já usado pela tarefa 2.' },
      { method: 'PATCH', url: 'http://localhost:3000/tarefas/1', body: `{ "concluida": true }`, expected: '400 com "property concluida should not exist": concluir tem rota própria.' },
      { method: 'PATCH', url: 'http://localhost:3000/tarefas/1', body: `{ "titulo": null }`, expected: '400. Remova o { skipNullProperties: false } e envie de novo: 500.' },
    ],
    expected: `Criar e atualizar compartilham as mesmas regras, escritas uma única vez.
PATCH aceita qualquer subconjunto dos campos, e null é recusado com 400.`,
  },
  commonErrors: [
    {
      title: '500 ao enviar null em um PATCH',
      symptom: 'TypeError: Cannot read properties of null no service, com resposta 500.',
      cause: 'O PartialType padrão ignora null na validação, e o service trata null como um valor a aplicar.',
      fix: 'Use PartialType(Dto, { skipNullProperties: false }), ou trate null explicitamente no service.',
    },
    {
      title: 'Copiar o DTO de criação para criar o de atualização',
      symptom: 'Regras diferentes entre POST e PATCH depois de alguma manutenção.',
      cause: 'As regras foram duplicadas, e só uma das cópias foi alterada.',
      fix: 'Derive com PartialType, PickType ou OmitType.',
    },
    {
      title: 'Espalhar o Update DTO sobre a entidade',
      symptom: 'Campos não enviados viram undefined na tarefa, apagando valores.',
      cause: 'Object.assign(tarefa, dados) ou { ...tarefa, ...dados }: com transform, propriedades não enviadas existem com valor undefined na instância.',
      fix: 'Aplique campo a campo, só os que não são undefined, como no service da prática.',
    },
    {
      title: 'Usar Partial<CriarTarefaDto> como tipo do corpo',
      symptom: 'O PATCH não valida nada.',
      cause: 'Partial<T> é um tipo TypeScript, apagado na compilação; não existe classe com regras para o pipe usar.',
      fix: 'Use PartialType(CriarTarefaDto), que cria uma classe de verdade.',
    },
  ],
  guidance: {
    before: ['Transform.', 'Módulo 01: Métodos HTTP (PUT x PATCH).', 'Módulo 01: TypeScript (utility types).'],
    now: ['Create x Update DTO.', 'PartialType, PickType e OmitType.', 'null x undefined na atualização.', 'Atualização campo a campo no service.'],
    after: ['Validação de dados: arrays, validadores próprios e regras entre campos.', 'Módulo 04: PUT e PATCH no CRUD completo.'],
    officialDocs: [
      { label: 'NestJS · Validation (mapped types)', url: 'https://docs.nestjs.com/application/validation' },
      { label: 'NestJS · OpenAPI mapped types', url: 'https://docs.nestjs.com/openapi/mapped-types' },
    ],
  },
}

export default lesson
