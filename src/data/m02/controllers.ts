import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'Um controller é a classe que recebe as requisições HTTP de um recurso. Com decorators, cada método vira uma rota (@Get, @Post, @Patch, @Delete), e os dados da requisição chegam como parâmetros (@Param, @Query, @Body). O valor retornado vira a resposta.',
    purpose:
      'Traduzir HTTP em chamadas de código e o resultado de volta em HTTP. O controller sabe de rotas, parâmetros e status codes; a regra de negócio fica no service.',
    problem:
      'No Módulo 01 você escreveu o roteamento à mão: comparar método e URL, extrair o id com expressão regular, ler o corpo em pedaços, chamar JSON.parse e JSON.stringify. Isso se repete em toda rota e é fácil errar. O controller declara a intenção e o framework faz o resto.',
    whyExists:
      'Separar a camada de entrada (HTTP) do resto da aplicação. A mesma regra de negócio pode ser chamada por uma rota REST, por um consumidor de fila ou por um teste, sem depender de req e res.',
    whereUsed:
      'Em toda API Nest: um controller por recurso (TarefasController, UsuariosController), com os métodos de cada rota daquele recurso.',
  },
  technical: {
    internals: [
      'Os decorators gravam metadados: @Controller(\'tarefas\') guarda o prefixo, @Get(\':id\') guarda método e caminho. Na inicialização, o Nest lê esses metadados e registra cada rota no Express.',
      'Quando a requisição chega, o Nest extrai os valores pedidos pelos decorators de parâmetro (@Param, @Query, @Body, @Headers) e chama o método com eles.',
      'O retorno é serializado automaticamente: objetos e arrays viram JSON, strings viram texto. Retornar uma Promise funciona: o Nest espera e responde com o valor.',
      'Status padrão: 200 para todos os métodos, exceto POST, que responde 201. @HttpCode(204) muda o status de uma rota.',
      'Valores de @Param e @Query chegam como strings. Pipes como ParseIntPipe convertem e validam antes do método rodar, respondendo 400 se o valor for inválido.',
      'Lançar uma exceção HTTP do Nest (NotFoundException, BadRequestException, ConflictException...) interrompe a rota e gera a resposta de erro com o status certo, no formato padrão { message, error, statusCode }.',
    ],
    concepts: [
      { term: '@Controller(prefixo)', description: 'Define o caminho base das rotas da classe.' },
      { term: '@Get / @Post / @Patch / @Put / @Delete', description: 'Mapeiam um método da classe para um método HTTP e um caminho.' },
      { term: '@Param, @Query, @Body', description: 'Extraem parâmetro de rota, query string e corpo da requisição.' },
      { term: 'ParseIntPipe', description: 'Converte "7" em 7 e responde 400 se o valor não for um inteiro.' },
      { term: '@HttpCode', description: 'Define o status de sucesso da rota (ex.: 204 em DELETE).' },
      { term: 'Exceções HTTP', description: 'NotFoundException (404), BadRequestException (400), ConflictException (409) e outras.' },
    ],
    examples: [
      {
        title: 'do decorator à rota',
        description: 'Cada decorator corresponde a algo que você fazia à mão no Módulo 01.',
        sample: {
          filename: 'exemplo.controller.ts',
          language: 'ts',
          code: `import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Query } from '@nestjs/common';

@Controller('tarefas')
export class ExemploController {
  @Get()
  listar(@Query('concluida') concluida?: string) {
    return { rota: 'GET /tarefas', concluida };
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return { rota: 'GET /tarefas/:id', id, tipo: typeof id };
  }

  @Post()
  criar(@Body() corpo: unknown) {
    return { rota: 'POST /tarefas', recebido: corpo };
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number) {
    console.log('removendo', id);
  }
}`,
          lineNotes: [
            { line: '3', note: 'Prefixo comum: todas as rotas abaixo começam com /tarefas.' },
            { line: '6', note: 'GET /tarefas?concluida=true entrega "true" (string). Sem o parâmetro na URL, chega undefined.' },
            { line: '11', note: 'O pipe converte o id antes de o método rodar. /tarefas/abc responde 400 sem executar o método.' },
            { line: '16-17', note: '@Body() entrega o JSON já interpretado. unknown lembra que ainda não foi validado (Módulo 03).' },
            { line: '20-21', note: 'DELETE responde 204 No Content. Sem @HttpCode, seria 200 com corpo vazio.' },
          ],
        },
      },
      {
        title: 'erros com exceções HTTP',
        description: 'Lançar a exceção certa basta: o Nest monta a resposta de erro.',
        sample: {
          filename: 'exemplo-erros.ts',
          language: 'ts',
          code: `import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

throw new NotFoundException('Tarefa 99 não encontrada');
// 404 {"message":"Tarefa 99 não encontrada","error":"Not Found","statusCode":404}

throw new BadRequestException('titulo é obrigatório');
// 400 {"message":"titulo é obrigatório","error":"Bad Request","statusCode":400}

throw new ConflictException('Já existe uma tarefa com esse título');
// 409 {"message":"Já existe uma tarefa com esse título","error":"Conflict","statusCode":409}`,
          lineNotes: [
            { line: '3-4', note: 'É a mesma ideia do HttpError da aula de Tratamento de erros (Módulo 01), agora pronta no framework.' },
            { line: '6-10', note: 'Qualquer erro que não seja uma exceção HTTP vira 500 com {"statusCode":500,"message":"Internal server error"}, sem expor detalhes.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'GET /tarefas/2 até a resposta',
      steps: [
        { label: 'O Express encontra a rota', detail: 'Registrada na inicialização a partir de @Controller(\'tarefas\') + @Get(\':id\').' },
        { label: 'O Nest extrai os parâmetros', detail: '@Param(\'id\') lê "2" da URL.' },
        { label: 'Pipes transformam e validam', detail: 'ParseIntPipe converte "2" em 2, ou responde 400 para "abc".' },
        { label: 'O método do controller roda', detail: 'Chama o service e devolve o resultado (ou lança uma exceção HTTP).' },
        { label: 'O retorno vira resposta', detail: 'Objeto → JSON com status 200 (201 em POST, ou o de @HttpCode).' },
        { label: 'Exceções viram respostas de erro', detail: 'NotFoundException → 404 no formato padrão do Nest.' },
      ],
    },
  ],
  practice: {
    goal: 'Completar as rotas de tarefas: listar com filtro, buscar por id, criar e remover, com os status codes corretos e sem regra de negócio no controller.',
    structure: `tarefas-api/src/tarefas/
├── tarefas.module.ts
├── tarefas.controller.ts
└── tarefas.service.ts`,
    files: [
      {
        path: 'src/tarefas/tarefas.service.ts',
        purpose: 'O service ganha os métodos que as rotas precisam. Na próxima aula ele recebe regras de negócio de verdade.',
        sample: {
          language: 'ts',
          code: `import { Injectable, NotFoundException } from '@nestjs/common';

export interface Tarefa {
  id: number;
  titulo: string;
  concluida: boolean;
}

@Injectable()
export class TarefasService {
  private tarefas: Tarefa[] = [
    { id: 1, titulo: 'Estudar módulos do Nest', concluida: true },
    { id: 2, titulo: 'Criar o primeiro feature module', concluida: false },
  ];
  private proximoId = 3;

  listar(concluida?: boolean): Tarefa[] {
    return concluida === undefined ? this.tarefas : this.tarefas.filter((t) => t.concluida === concluida);
  }

  buscarPorId(id: number): Tarefa {
    const tarefa = this.tarefas.find((t) => t.id === id);
    if (!tarefa) throw new NotFoundException('Tarefa ' + id + ' não encontrada');
    return tarefa;
  }

  criar(titulo: string): Tarefa {
    const tarefa: Tarefa = { id: this.proximoId++, titulo, concluida: false };
    this.tarefas.push(tarefa);
    return tarefa;
  }

  remover(id: number): void {
    this.buscarPorId(id);
    this.tarefas = this.tarefas.filter((t) => t.id !== id);
  }
}`,
          lineNotes: [
            { line: '17-19', note: 'O filtro é opcional: sem valor, devolve tudo.' },
            { line: '21-25', note: 'Buscar e não encontrar é um 404. Lançar aqui evita repetir a verificação em cada rota.' },
            { line: '33-34', note: 'remover reaproveita buscarPorId: remover algo inexistente também responde 404.' },
          ],
        },
      },
      {
        path: 'src/tarefas/tarefas.controller.ts',
        purpose: 'Cada método só traduz HTTP: lê os parâmetros, chama o service e devolve o resultado.',
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
  Post,
  Query,
} from '@nestjs/common';
import { TarefasService, type Tarefa } from './tarefas.service.js';

@Controller('tarefas')
export class TarefasController {
  constructor(private readonly tarefasService: TarefasService) {}

  @Get()
  listar(@Query('concluida') concluida?: string): Tarefa[] {
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
  criar(@Body() corpo: { titulo?: unknown }): Tarefa {
    if (typeof corpo?.titulo !== 'string' || corpo.titulo.trim() === '') {
      throw new BadRequestException('titulo é obrigatório');
    }
    return this.tarefasService.criar(corpo.titulo.trim());
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number): void {
    this.tarefasService.remover(id);
  }
}`,
          lineNotes: [
            { line: '20-26', note: 'Query string sempre chega como texto. Converter "true"/"false" em boolean é tradução de HTTP, papel do controller.' },
            { line: '29', note: 'ParseIntPipe garante que o service recebe um number.' },
            { line: '34-38', note: 'Validação manual, provisória. No Módulo 03 ela vira um DTO com class-validator e o controller fica com uma linha.' },
            { line: '41-43', note: '204 sem corpo: o método não retorna nada.' },
          ],
        },
      },
    ],
    run: ['cd tarefas-api', 'npm run start:dev'],
    httpTests: [
      { method: 'GET', url: 'http://localhost:3000/tarefas?concluida=false', expected: '200 com apenas a tarefa 2.' },
      { method: 'GET', url: 'http://localhost:3000/tarefas/1', expected: '200 com a tarefa 1.' },
      {
        method: 'GET',
        url: 'http://localhost:3000/tarefas/abc',
        expected: '400 com {"message":"Validation failed (numeric string is expected)","error":"Bad Request","statusCode":400}.',
      },
      { method: 'GET', url: 'http://localhost:3000/tarefas/99', expected: '404 com {"message":"Tarefa 99 não encontrada","error":"Not Found","statusCode":404}.' },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Entender controllers" }`,
        expected: '201 Created com {"id":3,"titulo":"Entender controllers","concluida":false}.',
      },
      { method: 'POST', url: 'http://localhost:3000/tarefas', body: `{ }`, expected: '400 com "titulo é obrigatório".' },
      { method: 'DELETE', url: 'http://localhost:3000/tarefas/3', expected: '204 sem corpo. Envie de novo: 404.' },
    ],
    expected: `Log de inicialização com as rotas:
Mapped {/tarefas, GET}, {/tarefas/:id, GET}, {/tarefas, POST}, {/tarefas/:id, DELETE}.
Todas as respostas de erro seguem o formato padrão do Nest.`,
  },
  commonErrors: [
    {
      title: 'Comparar o id da rota sem converter',
      symptom: 'buscarPorId nunca encontra nada: toda busca responde 404.',
      cause: '@Param(\'id\') entrega "1" (string), e a comparação t.id === "1" é sempre falsa.',
      fix: 'Use @Param(\'id\', ParseIntPipe) id: number. O tipo number na assinatura sozinho não converte nada.',
    },
    {
      title: 'Usar @Res() e a resposta nunca chega',
      symptom: 'A requisição fica pendurada até o timeout.',
      cause: 'Ao injetar @Res(), você assume o controle da resposta do Express e precisa chamar res.json() ou res.send() manualmente. O retorno do método é ignorado.',
      fix: 'Evite @Res(). Retorne o valor e use @HttpCode e exceções HTTP. Se precisar do objeto, use @Res({ passthrough: true }).',
    },
    {
      title: 'Ordem das rotas: GET /tarefas/:id captura /tarefas/pendentes',
      symptom: 'GET /tarefas/pendentes responde 400 "numeric string is expected".',
      cause: 'A rota com parâmetro foi declarada antes da rota fixa, e :id aceita qualquer segmento.',
      fix: 'Declare rotas fixas (@Get(\'pendentes\')) antes das rotas com parâmetro, ou use query string (?concluida=false).',
    },
    {
      title: 'Regra de negócio dentro do controller',
      symptom: 'O mesmo cálculo aparece em duas rotas, ou em um controller e em um job; corrigir em um lugar não corrige no outro.',
      cause: 'O controller passou a decidir regras (limites, conflitos, cálculos) em vez de só traduzir HTTP.',
      fix: 'Mova a regra para o service. O controller lê os dados, chama o service e devolve o resultado.',
    },
  ],
  guidance: {
    before: ['Feature Modules.', 'Módulo 01: Métodos HTTP e Status Codes.'],
    now: ['Decorators de rota e de parâmetro.', 'Serialização automática do retorno.', 'Status padrão, @HttpCode e exceções HTTP.', 'ParseIntPipe.'],
    after: ['Services: onde as regras de negócio moram.', 'Módulo 03: DTOs e ValidationPipe para validar o corpo.'],
    officialDocs: [
      { label: 'NestJS · Controllers', url: 'https://docs.nestjs.com/controllers' },
      { label: 'NestJS · Exception filters (exceções HTTP prontas)', url: 'https://docs.nestjs.com/exception-filters' },
      { label: 'NestJS · Pipes (ParseIntPipe)', url: 'https://docs.nestjs.com/pipes' },
    ],
  },
}

export default lesson
