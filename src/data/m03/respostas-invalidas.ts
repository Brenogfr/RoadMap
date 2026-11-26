import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'Tratar respostas inválidas é decidir como a API comunica um erro de validação: em que formato, com quais mensagens e com que nível de detalhe. Uma boa resposta diz qual campo está errado e o que fazer, em linguagem clara, sempre no mesmo formato.',
    purpose:
      'Permitir que o cliente corrija a requisição sem adivinhar. Um front-end consegue destacar o campo certo em um formulário, e quem integra a API entende o problema lendo a resposta, sem abrir o código.',
    problem:
      'A resposta padrão do ValidationPipe é uma lista de frases em inglês, sem indicar o campo de forma estruturada. Em uma única requisição, o mesmo campo pode gerar três mensagens. E o filtro de erros do Módulo 02 trocava tudo por "Bad Request Exception", escondendo os detalhes.',
    whyExists:
      'Erros fazem parte do contrato da API tanto quanto as respostas de sucesso. Um formato consistente e previsível é o que permite tratar erros de forma genérica no cliente.',
    whereUsed:
      'Em toda API consumida por um front-end ou por outras equipes. É comum padronizar um formato de erro para a empresa inteira, usado por todos os serviços.',
  },
  technical: {
    internals: [
      'exceptionFactory é uma opção do ValidationPipe que recebe a lista de ValidationError e devolve a exceção a ser lançada. Com ela, você monta o corpo do erro do jeito que quiser, por exemplo uma lista de { campo, mensagens }.',
      'Erros de objetos aninhados e de arrays aparecem em children. Percorrer a árvore recursivamente, acumulando o caminho (etiquetas.0, endereco.cep), dá ao cliente a localização exata do problema.',
      'stopAtFirstError: true para a validação de cada propriedade na primeira regra que falhar: uma mensagem por campo. Atenção à ordem: na prática, o decorator mais próximo da propriedade é o primeiro a rodar, então a regra mais básica (o tipo) deve ficar embaixo.',
      'As mensagens de cada regra são definidas com { message } no decorator. A mensagem de campo não permitido vem do próprio pipe (regra whitelistValidation) e pode ser traduzida na exceptionFactory.',
      'Um exception filter global que reescreve as respostas precisa preservar os detalhes: erro.getResponse() devolve o corpo original da exceção (com a lista de erros), enquanto erro.message é só uma frase genérica.',
    ],
    concepts: [
      { term: 'exceptionFactory', description: 'Função que transforma a lista de ValidationError na exceção lançada.' },
      { term: 'children', description: 'Erros de campos aninhados e de itens de arrays, dentro de cada ValidationError.' },
      { term: 'stopAtFirstError', description: 'Uma mensagem por campo: a validação de cada propriedade para no primeiro erro.' },
      { term: '{ message }', description: 'Mensagem própria por regra, em vez da padrão em inglês.' },
      { term: 'getResponse()', description: 'O corpo original de uma HttpException, com todos os detalhes.' },
      { term: 'Formato único de erro', description: 'statusCode, mensagem, erros e caminho em todas as respostas de erro.' },
    ],
    examples: [
      {
        title: 'antes e depois',
        description: 'A mesma requisição inválida com a configuração padrão e com a da prática.',
        sample: {
          filename: 'antes-depois.json',
          language: 'json',
          code: `{
  "antes": {
    "message": [
      "property admin should not exist",
      "titulo must be longer than or equal to 3 and shorter than or equal to 80 characters",
      "titulo must be a string",
      "prioridade must not be greater than 5"
    ],
    "error": "Bad Request",
    "statusCode": 400
  },
  "depois": {
    "statusCode": 400,
    "mensagem": "Dados inválidos",
    "erros": [
      { "campo": "admin", "mensagens": ["campo não permitido"] },
      { "campo": "titulo", "mensagens": ["titulo deve ser um texto"] },
      { "campo": "prioridade", "mensagens": ["prioridade deve ser no máximo 5"] }
    ],
    "caminho": "/tarefas",
    "momento": "2026-11-26T14:27:39.557Z"
  }
}`,
          lineNotes: [
            { line: '3-8', note: 'Frases soltas: para saber o campo, o cliente teria que ler o texto. O título gera duas mensagens.' },
            { line: '15-19', note: 'Uma entrada por campo, com o nome do campo separado da mensagem: fácil de exibir ao lado do input certo.' },
            { line: '20-21', note: 'O mesmo formato do ErrosFilter para qualquer erro da API (404, 409, 500).' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Do erro de validação à resposta',
      steps: [
        { label: 'validate encontra erros', detail: 'Com stopAtFirstError, no máximo um por propriedade.' },
        { label: 'exceptionFactory recebe os ValidationError', detail: 'Percorre a árvore (inclusive children) e monta { campo, mensagens }.' },
        { label: 'Lança BadRequestException', detail: 'Com o corpo { mensagem: "Dados inválidos", erros: [...] }.' },
        { label: 'O ErrosFilter captura', detail: 'Lê o corpo com getResponse() e preserva a lista de erros.' },
        { label: 'Resposta padronizada', detail: 'statusCode, mensagem, erros, caminho e momento: o mesmo formato de qualquer erro da API.' },
      ],
    },
  ],
  practice: {
    goal:
      'Padronizar as respostas de erro do tarefas-api: mensagens em português, uma por campo, no formato { campo, mensagens }, e o ErrosFilter de volta, agora preservando os detalhes.',
    structure: `tarefas-api/src/
├── main.ts
├── app.module.ts
├── comum/
│   ├── validacao.pipe.ts
│   └── erros.filter.ts
└── tarefas/dto/
    ├── criar-tarefa.dto.ts
    └── listar-tarefas.query.ts`,
    files: [
      {
        path: 'src/comum/validacao.pipe.ts',
        purpose: 'O ValidationPipe da aplicação, com todas as opções do módulo e um formato próprio de erro.',
        sample: {
          language: 'ts',
          code: `import { BadRequestException, ValidationPipe, type ValidationError } from '@nestjs/common';

export interface ErroDeCampo {
  campo: string;
  mensagens: string[];
}

// Mensagens geradas pelo próprio ValidationPipe, que não passam pelos decorators do DTO.
const TRADUCOES: Record<string, string> = {
  whitelistValidation: 'campo não permitido',
};

function listarErros(erros: ValidationError[], prefixo = ''): ErroDeCampo[] {
  return erros.flatMap((erro) => {
    const campo = prefixo + erro.property;
    const mensagens = Object.entries(erro.constraints ?? {}).map(([regra, texto]) => TRADUCOES[regra] ?? texto);
    const proprios = mensagens.length > 0 ? [{ campo, mensagens }] : [];
    return [...proprios, ...listarErros(erro.children ?? [], campo + '.')];
  });
}

export function criarValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    stopAtFirstError: true,
    exceptionFactory: (erros) =>
      new BadRequestException({ mensagem: 'Dados inválidos', erros: listarErros(erros) }),
  });
}`,
          lineNotes: [
            { line: '3-6', note: 'O formato de cada erro: o campo (com o caminho, para aninhados) e suas mensagens.' },
            { line: '9-11', note: 'A mensagem de campo não permitido vem do pipe, não do DTO. A tradução usa o nome interno da regra.' },
            { line: '13-20', note: 'Percorre a árvore de erros. Itens de arrays e objetos aninhados ficam em children, e o caminho se acumula (etiquetas.1).' },
            { line: '24-27', note: 'Todas as opções do módulo. stopAtFirstError deixa uma mensagem por campo.' },
            { line: '28-29', note: 'A exceção lançada, com o corpo no formato da API.' },
          ],
        },
      },
      {
        path: 'src/comum/erros.filter.ts',
        purpose: 'O filtro do Módulo 02, corrigido: ele lê o corpo original da exceção em vez de usar só erro.message.',
        sample: {
          language: 'ts',
          code: `import { Catch, HttpException, HttpStatus, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class ErrosFilter implements ExceptionFilter {
  catch(erro: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const requisicao = http.getRequest<Request>();
    const resposta = http.getResponse<Response>();

    const status = erro instanceof HttpException ? erro.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    if (!(erro instanceof HttpException)) console.error(erro);

    const corpo = erro instanceof HttpException ? erro.getResponse() : null;
    const detalhes = typeof corpo === 'object' && corpo !== null ? (corpo as Record<string, unknown>) : {};
    const mensagem =
      typeof detalhes.mensagem === 'string'
        ? detalhes.mensagem
        : erro instanceof HttpException
          ? erro.message
          : 'Erro interno do servidor';

    resposta.status(status).json({
      statusCode: status,
      mensagem,
      ...(Array.isArray(detalhes.erros) ? { erros: detalhes.erros } : {}),
      caminho: requisicao.originalUrl,
      momento: new Date().toISOString(),
    });
  }
}`,
          lineNotes: [
            { line: '14-15', note: 'getResponse() devolve o corpo que a exceção carrega, como { mensagem, erros } da exceptionFactory.' },
            { line: '16-21', note: 'Usa a mensagem do corpo quando existe. Antes, erro.message devolvia apenas "Bad Request Exception".' },
            { line: '26', note: 'A lista de erros só aparece quando existe: respostas de 404 e 409 continuam com o mesmo formato, sem o campo.' },
          ],
        },
      },
      {
        path: 'src/main.ts',
        purpose: 'O main.ts passa a usar o pipe configurado.',
        sample: { language: 'ts', code: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { criarValidationPipe } from './comum/validacao.pipe.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(criarValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();` },
      },
      {
        path: 'src/app.module.ts',
        purpose: 'O ErrosFilter volta como filtro global.',
        sample: { language: 'ts', code: `import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ErrosFilter } from './comum/erros.filter.js';
import { HealthController } from './health/health.controller.js';
import { RelatoriosModule } from './relatorios/relatorios.module.js';
import { TarefasModule } from './tarefas/tarefas.module.js';

@Module({
  imports: [TarefasModule, RelatoriosModule],
  controllers: [HealthController],
  providers: [{ provide: APP_FILTER, useClass: ErrosFilter }],
})
export class AppModule {}` },
      },
      {
        path: 'src/tarefas/dto/criar-tarefa.dto.ts',
        purpose: 'Mensagens em português e a ordem das regras ajustada para o stopAtFirstError: a regra mais básica fica embaixo.',
        sample: {
          language: 'ts',
          code: `import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsDefined,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { DataFutura } from '../../comum/data-futura.validator.js';

const aparar = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// Com stopAtFirstError, o validador mais próximo da propriedade roda primeiro.
// Por isso a verificação mais básica (o tipo) fica embaixo, logo acima do campo.
export class CriarTarefaDto {
  @Transform(aparar)
  @Length(3, 80, { message: 'titulo deve ter entre 3 e 80 caracteres' })
  @IsString({ message: 'titulo deve ser um texto' })
  titulo: string;

  @IsOptional()
  @Transform(aparar)
  @Length(0, 500, { message: 'descricao deve ter no máximo 500 caracteres' })
  @IsString({ message: 'descricao deve ser um texto' })
  descricao?: string;

  @IsOptional()
  @Max(5, { message: 'prioridade deve ser no máximo 5' })
  @Min(1, { message: 'prioridade deve ser no mínimo 1' })
  @IsInt({ message: 'prioridade deve ser um número inteiro' })
  prioridade?: number;

  @IsOptional()
  @Length(1, 20, { each: true, message: 'cada etiqueta deve ter entre 1 e 20 caracteres' })
  @IsString({ each: true, message: 'cada etiqueta deve ser um texto' })
  @ArrayMaxSize(5, { message: 'etiquetas aceita no máximo 5 itens' })
  @IsArray({ message: 'etiquetas deve ser uma lista' })
  etiquetas?: string[];

  @ValidateIf((dto: CriarTarefaDto) => dto.prioridade === 5 || dto.prazo !== undefined)
  @DataFutura()
  @IsDateString({}, { message: 'prazo deve ser uma data no formato ISO 8601, como 2030-01-31' })
  @IsDefined({ message: 'prazo é obrigatório para tarefas de prioridade 5' })
  prazo?: string;
}`,
          lineNotes: [
            { line: '19-20', note: 'O comentário registra a decisão para quem for mexer no DTO depois.' },
            { line: '23-24', note: 'IsString embaixo: para titulo: 12, a mensagem é "titulo deve ser um texto", e não a de tamanho.' },
            { line: '47-49', note: 'Ordem: existe? É uma data ISO? Está no futuro? Para "amanha", a mensagem é a do formato.' },
          ],
        },
      },
      {
        path: 'src/tarefas/dto/listar-tarefas.query.ts',
        purpose: 'O DTO da query com o mesmo tratamento: mensagens em português e ordem ajustada.',
        sample: { language: 'ts', code: `import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

const paraBooleano = ({ value }: { value: unknown }) => (value === 'true' ? true : value === 'false' ? false : value);

export class ListarTarefasQuery {
  @IsOptional()
  @Transform(paraBooleano)
  @IsBoolean({ message: 'concluida deve ser true ou false' })
  concluida?: boolean;

  @IsOptional()
  @Type(() => Number)
  @Max(5, { message: 'prioridade deve ser no máximo 5' })
  @Min(1, { message: 'prioridade deve ser no mínimo 1' })
  @IsInt({ message: 'prioridade deve ser um número inteiro' })
  prioridade?: number;
}` },
      },
    ],
    run: ['cd tarefas-api', 'npm run start:dev'],
    httpTests: [
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": 12, "prioridade": 9, "etiquetas": ["ok", ""], "admin": true }`,
        expected:
          '400 com "erros": admin → "campo não permitido", titulo → "titulo deve ser um texto", prioridade → "prioridade deve ser no máximo 5" e etiquetas → "cada etiqueta deve ter entre 1 e 20 caracteres". Uma mensagem por campo.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Prazo invalido", "prazo": "amanha" }`,
        expected: '400 com prazo → "prazo deve ser uma data no formato ISO 8601, como 2030-01-31".',
      },
      {
        method: 'GET',
        url: 'http://localhost:3000/tarefas?prioridade=abc',
        expected: '400 com prioridade → "prioridade deve ser um número inteiro".',
      },
      {
        method: 'GET',
        url: 'http://localhost:3000/tarefas/99',
        expected: '404 com {"statusCode":404,"mensagem":"Tarefa 99 não encontrada","caminho":"/tarefas/99",...}: o mesmo formato, sem "erros".',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Urgente", "prioridade": 5, "prazo": "2030-01-31" }`,
        expected: '201: dentro do contrato, nada mudou.',
      },
    ],
    expected: `Todas as respostas de erro seguem o formato { statusCode, mensagem, erros?, caminho, momento }.
Erros de validação trazem uma mensagem por campo, em português.`,
  },
  commonErrors: [
    {
      title: '"mensagem": "Bad Request Exception"',
      symptom: 'Depois de adicionar um filtro global, as respostas de validação perdem a lista de erros.',
      cause: 'O filtro usa erro.message, que para exceções criadas com um objeto é uma frase genérica.',
      fix: 'Leia o corpo com erro.getResponse() e preserve os detalhes, como o ErrosFilter da prática.',
    },
    {
      title: 'stopAtFirstError mostrando a mensagem errada',
      symptom: 'Para titulo: 12, a resposta diz "deve ter entre 3 e 80 caracteres", e não "deve ser um texto".',
      cause: 'O decorator mais próximo da propriedade roda primeiro, e a regra de tamanho estava embaixo.',
      fix: 'Coloque a regra mais básica (o tipo) logo acima da propriedade.',
    },
    {
      title: 'Erros de itens de array sem localização',
      symptom: 'A resposta diz que uma etiqueta é inválida, mas não qual.',
      cause: 'Com { each: true }, a mensagem é do campo inteiro; com @ValidateNested, os detalhes ficam em children.',
      fix: 'Percorra children acumulando o caminho, como listarErros faz, e escreva mensagens que ajudem a localizar o problema.',
    },
    {
      title: 'Detalhes demais na resposta',
      symptom: 'O erro devolve o valor enviado, o nome da classe do DTO ou mensagens internas.',
      cause: 'A exceptionFactory repassa o ValidationError inteiro (target, value).',
      fix: 'Monte a resposta só com campo e mensagens. O ValidationPipe já desliga target por padrão; não o ligue de volta.',
    },
  ],
  guidance: {
    before: ['Validação de dados.', 'Módulo 02: Fluxo de uma requisição (exception filters).', 'Módulo 01: Tratamento de erros.'],
    now: ['exceptionFactory e o formato de erro.', 'children e caminhos de campos.', 'stopAtFirstError e a ordem dos decorators.', 'Filtros que preservam detalhes.'],
    after: ['Exercício do módulo: cadastro validado.', 'Módulo 04: APIs REST e CRUD, com o formato de erro consistente.'],
    officialDocs: [
      { label: 'NestJS · Validation (exceptionFactory e stopAtFirstError)', url: 'https://docs.nestjs.com/application/validation' },
      { label: 'NestJS · Exception filters', url: 'https://docs.nestjs.com/exception-filters' },
    ],
  },
}

export default lesson
