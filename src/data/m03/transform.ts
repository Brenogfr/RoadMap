import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'transform é uma opção do ValidationPipe que faz o método do controller receber a instância transformada do DTO, e não o objeto original. Ela também converte parâmetros primitivos para o tipo declarado: um @Param(\'id\') id: number deixa de chegar como texto.',
    purpose:
      'Receber dados já no formato certo: instâncias reais dos DTOs, textos aparados pelo @Transform e números e booleanos convertidos. Com isso, filtros de listagem podem ser descritos por um DTO de query, com as mesmas regras e mensagens do corpo.',
    problem:
      'Query strings e parâmetros de rota são sempre texto. No Módulo 02, o controller convertia "true"/"false" à mão e validava cada valor com if. Com mais filtros (prioridade, página, ordenação), essa lógica toma conta do controller.',
    whyExists:
      'Validação e conversão andam juntas: não adianta validar que "3" é um inteiro se o código vai receber a string. A opção transform fecha o ciclo, entregando ao método o que foi validado.',
    whereUsed:
      'Em praticamente toda API Nest com filtros, paginação e ordenação (Módulo 04). Normalmente ligada no ValidationPipe global, junto com whitelist e forbidNonWhitelisted.',
  },
  technical: {
    internals: [
      'Sem transform, o pipe valida a instância, mas entrega ao método o valor original (o objeto comum). Com transform, entrega a instância, com os @Transform e @Type aplicados.',
      'Para parâmetros primitivos (@Param(\'id\') id: number), transform converte usando o tipo declarado: Number("7") vira 7. Mas Number("abc") vira NaN, sem nenhum erro: a conversão não valida.',
      'Em DTOs de query, cada campo precisa da conversão explícita: @Type(() => Number) para números e um @Transform para booleanos, já que "false" é uma string não vazia e viraria true em uma conversão ingênua.',
      'A conversão roda antes da validação: @IsInt() valida o número já convertido, e @IsBoolean() o booleano já convertido.',
      'Existe também a opção enableImplicitConversion (em transformOptions), que converte pelos tipos TypeScript sem @Type. Ela é prática, mas esconde conversões e trata casos como "false" de forma surpreendente; prefira conversões explícitas.',
    ],
    concepts: [
      { term: 'transform: true', description: 'O método recebe a instância do DTO e parâmetros primitivos convertidos.' },
      { term: 'DTO de query', description: 'Uma classe que descreve e valida os filtros da query string.' },
      { term: '@Type(() => Number)', description: 'Converte o texto da query em número antes de validar.' },
      { term: 'Booleano em query', description: '"true" e "false" precisam de @Transform explícito.' },
      { term: 'Conversão não é validação', description: 'Number("abc") é NaN. Para ids, mantenha o ParseIntPipe.' },
      { term: 'enableImplicitConversion', description: 'Conversão automática pelos tipos TypeScript. Evite: é implícita demais.' },
    ],
    examples: [
      {
        title: 'conversão sem validação',
        description: 'Com transform: true, o ParseIntPipe parece desnecessário. Não é.',
        sample: {
          filename: 'conversao.http',
          language: 'http',
          code: `# @Get(':id') buscar(@Param('id') id: number), sem ParseIntPipe
GET /tarefas/abc HTTP/1.1

HTTP/1.1 404 Not Found
{"message":"Tarefa NaN não encontrada","error":"Not Found","statusCode":404}

# @Get(':id') buscar(@Param('id', ParseIntPipe) id: number)
GET /tarefas/abc HTTP/1.1

HTTP/1.1 400 Bad Request
{"message":"Validation failed (numeric string is expected)","error":"Bad Request","statusCode":400}`,
          lineNotes: [
            { line: '1-5', note: 'transform converteu "abc" em NaN e o service procurou a tarefa NaN. O cliente recebe 404, quando o erro é dele (400).' },
            { line: '7-11', note: 'ParseIntPipe valida e converte: a resposta correta, 400.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'GET /tarefas?concluida=true&prioridade=5',
      steps: [
        { label: 'O Express lê a query', detail: '{ concluida: "true", prioridade: "5" }: tudo texto.' },
        { label: 'plainToInstance(ListarTarefasQuery, query)', detail: 'O @Transform converte "true" em true; o @Type converte "5" em 5.' },
        { label: 'whitelist e forbid', detail: 'Parâmetros que o DTO não declara (como ?ordem=asc) geram 400.' },
        { label: 'validate', detail: '@IsBoolean e @IsInt/@Min/@Max conferem os valores já convertidos.' },
        { label: 'transform entrega a instância', detail: 'O controller recebe { concluida: true, prioridade: 5 } e repassa ao service.' },
      ],
    },
  ],
  practice: {
    goal:
      'Ligar transform, criar um DTO para os filtros da listagem (concluida e prioridade) e remover do controller toda a conversão manual da query string.',
    structure: `tarefas-api/src/
├── main.ts
└── tarefas/
    ├── dto/
    │   ├── criar-tarefa.dto.ts
    │   └── listar-tarefas.query.ts
    ├── tarefas.controller.ts
    └── tarefas.service.ts`,
    files: [
      {
        path: 'src/main.ts',
        purpose: 'As três opções do pipe que usaremos daqui em diante.',
        sample: { language: 'ts', code: `import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();`, lineNotes: [{ line: '7', note: 'transform: true se junta às opções das aulas anteriores.' }] },
      },
      {
        path: 'src/tarefas/dto/listar-tarefas.query.ts',
        purpose: 'Os filtros da listagem como um DTO: converte, valida e documenta a query string.',
        sample: {
          language: 'ts',
          code: `import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

const paraBooleano = ({ value }: { value: unknown }) => (value === 'true' ? true : value === 'false' ? false : value);

export class ListarTarefasQuery {
  @IsOptional()
  @Transform(paraBooleano)
  @IsBoolean()
  concluida?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  prioridade?: number;
}`,
          lineNotes: [
            { line: '4', note: '"true" → true, "false" → false. Qualquer outro valor passa como está, para @IsBoolean recusar.' },
            { line: '8-9', note: 'Converte e depois valida: ?concluida=talvez responde 400.' },
            { line: '13', note: 'Sem @Type, "5" continuaria texto e falharia em @IsInt.' },
          ],
        },
      },
      {
        path: 'src/tarefas/tarefas.service.ts',
        purpose: 'listar recebe um objeto de filtros. Só o método listar muda; o resto do service é igual ao da aula de DTOs.',
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
          lineNotes: [{ line: '24-29', note: 'Cada filtro só é aplicado se tiver sido informado. O padrão {} mantém listar() sem argumentos funcionando para o relatório.' }],
        },
      },
      {
        path: 'src/tarefas/tarefas.controller.ts',
        purpose: 'A listagem fica com uma linha. O import de BadRequestException sai, porque nenhuma validação manual sobrou.',
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
          lineNotes: [
            { line: '21-24', note: '@Query() sem nome entrega a query inteira, já convertida e validada como ListarTarefasQuery.' },
            { line: '27', note: 'ParseIntPipe continua: transform converteria "abc" em NaN sem reclamar.' },
          ],
        },
      },
    ],
    run: [
      'cd tarefas-api',
      '# No teste da aula de Dependency Injection, troque controller.listar() por controller.listar({})',
      'npm run start:dev',
    ],
    httpTests: [
      { method: 'POST', url: 'http://localhost:3000/tarefas', body: `{ "titulo": "Alta prioridade", "prioridade": 5 }`, expected: '201.' },
      { method: 'GET', url: 'http://localhost:3000/tarefas?prioridade=5', expected: '200 com apenas as tarefas de prioridade 5.' },
      { method: 'GET', url: 'http://localhost:3000/tarefas?concluida=talvez', expected: '400 com {"message":["concluida must be a boolean value"],...}.' },
      { method: 'GET', url: 'http://localhost:3000/tarefas?prioridade=9', expected: '400 com "prioridade must not be greater than 5".' },
      { method: 'GET', url: 'http://localhost:3000/tarefas?ordem=asc', expected: '400 com "property ordem should not exist".' },
    ],
    expected: `Filtros convertidos e validados pelo DTO, com as mesmas regras e formato de erro do corpo.
O controller não tem mais nenhuma conversão manual.`,
  },
  commonErrors: [
    {
      title: '"Tarefa NaN não encontrada"',
      symptom: 'GET /tarefas/abc responde 404, e não 400.',
      cause: 'O ParseIntPipe foi removido confiando em transform, que converte sem validar.',
      fix: 'Mantenha @Param(\'id\', ParseIntPipe) para ids numéricos.',
    },
    {
      title: '?concluida=false filtra as concluídas',
      symptom: 'O filtro booleano devolve o oposto do pedido.',
      cause: 'Uma conversão ingênua, como Boolean("false"), resulta em true: toda string não vazia é verdadeira.',
      fix: 'Converta explicitamente com @Transform, como em listar-tarefas.query.ts.',
    },
    {
      title: 'prioridade must be an integer number para ?prioridade=3',
      symptom: 'Um número válido na query é recusado.',
      cause: 'Faltou @Type(() => Number): o valor continua "3", texto.',
      fix: 'Adicione @Type(() => Number) aos campos numéricos do DTO de query.',
    },
    {
      title: 'dados instanceof CriarTarefaDto é false no controller',
      symptom: 'Métodos ou getters do DTO não existem no objeto recebido.',
      cause: 'Sem transform: true, o pipe entrega o objeto original.',
      fix: 'Ligue transform: true no ValidationPipe.',
    },
  ],
  guidance: {
    before: ['Class Transformer: @Type e @Transform.', 'ForbidNonWhitelisted.'],
    now: ['O que transform entrega ao método.', 'DTOs de query.', 'Conversão explícita de números e booleanos.', 'Por que o ParseIntPipe continua.'],
    after: ['Create DTO e Update DTO.', 'Módulo 04: paginação, filtros e ordenação.'],
    officialDocs: [{ label: 'NestJS · Validation (transform payload objects)', url: 'https://docs.nestjs.com/application/validation' }],
  },
}

export default lesson
