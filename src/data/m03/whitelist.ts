import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'whitelist é uma opção do ValidationPipe que remove do objeto validado todas as propriedades que não têm nenhum decorator de validação no DTO. O que não foi declarado no contrato simplesmente não chega ao controller.',
    purpose:
      'Garantir que a rota receba apenas os campos previstos. Campos extras, enviados por engano ou de propósito, são descartados antes de qualquer código seu tocar neles.',
    problem:
      'Sem whitelist, o objeto que chega ao controller contém tudo o que o cliente mandou. Basta um service que faça { ...padrao, ...dados } para um cliente conseguir definir campos que deveriam ser do servidor, como id, concluida, papel ou saldo. É a vulnerabilidade conhecida como mass assignment.',
    whyExists:
      'Validar o que veio não basta: também é preciso garantir que nada além disso entre. Listas de permissão (whitelist) são mais seguras que listas de bloqueio: novos campos perigosos ficam de fora por padrão.',
    whereUsed:
      'Em praticamente todas as APIs Nest, sempre ligada junto com o ValidationPipe global. Ganha importância quando o DTO é repassado para o banco de dados (Prisma, no Módulo 06).',
  },
  technical: {
    internals: [
      'Com whitelist: true, o class-validator percorre as propriedades da instância e apaga as que não têm metadados de validação registrados para aquela classe.',
      'O critério é ter ao menos um decorator de validação. Uma propriedade declarada no DTO, mas sem decorator nenhum, também é removida. Por isso campos opcionais levam @IsOptional() e mais alguma regra.',
      'A remoção acontece em silêncio: a requisição continua válida e o cliente não fica sabendo. Para recusar em vez de remover, existe forbidNonWhitelisted (próxima aula).',
      'A whitelist vale também para objetos aninhados validados com @ValidateNested e @Type.',
      'Como o DTO é uma classe com target ES2023, as propriedades declaradas existem na instância mesmo sem valor: um log mostra descricao: undefined para campos não enviados.',
    ],
    concepts: [
      { term: 'whitelist', description: 'Remove propriedades sem decorator de validação.' },
      { term: 'Mass assignment', description: 'Vulnerabilidade em que o cliente define campos que deveriam ser do servidor.' },
      { term: 'Lista de permissão', description: 'Aceitar só o que foi declarado, em vez de bloquear o que se conhece como perigoso.' },
      { term: 'Remoção silenciosa', description: 'O campo some sem erro. Bom para robustez, ruim para descobrir erros de digitação.' },
      { term: 'Decorator obrigatório', description: 'Toda propriedade aceita precisa de ao menos uma regra de validação.' },
      { term: 'Spread de objetos', description: '{ ...a, ...b }: as propriedades de b sobrescrevem as de a, inclusive as que você não esperava.' },
    ],
    examples: [
      {
        title: 'mass assignment em três linhas',
        description: 'Um service ingênuo que espalha o corpo da requisição sobre os valores padrão.',
        sample: {
          filename: 'mass-assignment.ts',
          language: 'ts',
          code: `interface Tarefa {
  id: number;
  titulo: string;
  concluida: boolean;
}
const tarefas: Tarefa[] = [];

function criarIngenuo(dados: { titulo: string }): Tarefa {
  const tarefa = { id: tarefas.length + 1, concluida: false, ...dados } as Tarefa;
  tarefas.push(tarefa);
  return tarefa;
}

const corpo = JSON.parse('{"titulo":"Pagar fornecedor","concluida":true,"id":999}');
console.log(criarIngenuo(corpo));`,
          lineNotes: [
            { line: '8', note: 'O tipo do parâmetro diz { titulo: string }, mas em tempo de execução o objeto tem o que o cliente mandou.' },
            { line: '9', note: 'O spread vem por último: cada campo do corpo sobrescreve os valores padrão.' },
            { line: '14-15', note: 'Imprime { id: 999, concluida: true, titulo: \'Pagar fornecedor\' }: o cliente escolheu o id e marcou a tarefa como concluída.' },
          ],
        },
      },
      {
        title: 'propriedade sem decorator também some',
        description: 'Com whitelist, declarar o campo no DTO não basta: ele precisa de uma regra.',
        sample: {
          filename: 'sem-decorator.dto.ts',
          language: 'ts',
          code: `import { IsString, Length } from 'class-validator';

export class ExemploDto {
  @IsString()
  @Length(3, 80)
  titulo: string;

  observacao?: string;
}`,
          lineNotes: [
            { line: '4-6', note: 'Tem regras: é mantido.' },
            { line: '8', note: 'Declarado, mas sem decorator: com whitelist, é removido como se não existisse. Use @IsOptional() e @IsString().' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Um corpo com campos extras passando pela whitelist',
      steps: [
        { label: 'O cliente envia', detail: '{ "titulo": "Com whitelist", "concluida": true, "id": 999, "admin": true }' },
        { label: 'plainToInstance', detail: 'A instância de CriarTarefaDto recebe todos os campos, inclusive os extras.' },
        { label: 'whitelist remove os extras', detail: 'concluida, id e admin não têm decorators no DTO: são apagados.' },
        { label: 'validate', detail: 'O título é válido; descricao e prioridade são opcionais.' },
        { label: 'O controller recebe', detail: '{ titulo: "Com whitelist", descricao: undefined, prioridade: undefined }.' },
      ],
    },
  ],
  practice: {
    goal: 'Ligar a whitelist e observar, com um log temporário no controller, o que chega antes e depois.',
    structure: `tarefas-api/src/
├── main.ts
└── tarefas/
    └── tarefas.controller.ts   (com um console.log temporário em criar)`,
    files: [
      {
        path: 'src/main.ts',
        purpose: 'O ValidationPipe passa a remover campos não declarados.',
        sample: {
          language: 'ts',
          code: `import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();`,
          lineNotes: [{ line: '7', note: 'whitelist: true. Experimente primeiro sem a opção, para ver o objeto chegar com os campos extras.' }],
        },
      },
      {
        path: 'src/tarefas/tarefas.controller.ts',
        purpose: 'Um console.log temporário no criar, para ver o DTO que o método recebe. Remova-o ao final da aula.',
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
    console.log('DTO recebido:', dados);
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
          lineNotes: [{ line: '36-37', note: 'O log mostra exatamente o que passou pelo pipe.' }],
        },
      },
    ],
    run: ['cd tarefas-api', 'npm run start:dev'],
    httpTests: [
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Com whitelist", "concluida": true, "id": 999, "admin": true }`,
        expected:
          '201 com id 1 e concluida false. No terminal: DTO recebido: { titulo: \'Com whitelist\', descricao: undefined, prioridade: undefined }. Sem whitelist, o log mostraria concluida, id e admin.',
      },
    ],
    expected: `Com whitelist, o controller nunca vê campos que o DTO não declara.
O cliente não recebe nenhum aviso: os campos extras simplesmente somem.`,
  },
  commonErrors: [
    {
      title: 'Campo válido sumindo da requisição',
      symptom: 'Um campo enviado corretamente chega undefined ao service.',
      cause: 'A propriedade está no DTO, mas sem nenhum decorator de validação, e a whitelist a removeu.',
      fix: 'Adicione ao menos uma regra (por exemplo, @IsOptional() e @IsString()).',
    },
    {
      title: 'Espalhar o DTO sobre valores do servidor',
      symptom: 'Clientes conseguem definir id, concluida ou papel enviando esses campos.',
      cause: '{ ...padrao, ...dados } sem whitelist: tudo o que veio sobrescreve os valores padrão.',
      fix: 'Ligue whitelist e, no service, copie campo a campo o que deve ser aceito, como o TarefasService faz.',
    },
    {
      title: 'Erro de digitação ignorado',
      symptom: 'O cliente envia "titlo" e não entende por que o título não foi salvo.',
      cause: 'A whitelist remove o campo desconhecido em silêncio.',
      fix: 'Ligue também forbidNonWhitelisted para responder 400 com o nome do campo (próxima aula).',
    },
    {
      title: 'Achar que whitelist valida tipos',
      symptom: 'Campos declarados com tipo errado passam.',
      cause: 'whitelist só decide quais campos ficam. Tipos e formatos dependem das regras de cada campo.',
      fix: 'Combine whitelist com decorators completos em todos os campos.',
    },
  ],
  guidance: {
    before: ['ValidationPipe.', 'Módulo 01: JavaScript (spread de objetos).'],
    now: ['Mass assignment.', 'Como a whitelist decide o que remove.', 'Remoção silenciosa e suas consequências.'],
    after: ['ForbidNonWhitelisted: recusar em vez de remover.', 'Módulo 07: segurança de APIs.'],
    officialDocs: [
      { label: 'NestJS · Validation (stripping properties)', url: 'https://docs.nestjs.com/application/validation' },
      { label: 'MDN · Spread syntax', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax' },
    ],
  },
}

export default lesson
