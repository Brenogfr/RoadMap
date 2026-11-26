import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'O fluxo de uma requisição no Nest é a sequência de etapas pela qual toda requisição passa até virar resposta: middleware, guards, interceptors, pipes, o método do controller (e o service que ele chama), de novo os interceptors na volta e, se algo der errado, os exception filters.',
    purpose:
      'Saber em qual etapa colocar cada responsabilidade. Log de acesso, bloqueio de acesso, medição de tempo, conversão de parâmetros e formatação de erros têm lugares próprios, e cada um roda uma única vez para todas as rotas, sem repetir código nos controllers.',
    problem:
      'Sem esse mapa, responsabilidades transversais acabam espalhadas: um try/catch em cada rota, uma checagem de permissão copiada em cada método, um log diferente por controller. E fica difícil entender por que uma requisição foi barrada antes de chegar ao controller.',
    whyExists:
      'É a mesma ideia do pipeline de middlewares que você construiu à mão no Módulo 01 (Ciclo de vida de uma requisição), dividida em etapas com papéis específicos e integrada à injeção de dependência.',
    whereUsed:
      'Em toda API Nest real: guards para autenticação e autorização (Módulo 07), pipes para validação (Módulo 03), interceptors para log, cache e transformação de respostas, filters para padronizar erros.',
  },
  technical: {
    internals: [
      'Middleware roda primeiro, com acesso direto a req, res e next do Express. Não sabe qual método de controller vai atender a requisição. Bom para log de acesso, CORS e request id.',
      'Guards decidem se a requisição pode seguir (canActivate devolve true ou lança uma exceção). Eles já conhecem o controller e o método de destino pelo ExecutionContext. Uso típico: autenticação e permissões.',
      'Interceptors envolvem a execução do método: rodam código antes e, pelo Observable devolvido por next.handle(), depois. Servem para medir tempo, transformar a resposta, aplicar cache e timeouts.',
      'Pipes transformam e validam os argumentos de cada parâmetro (@Param, @Body, @Query) logo antes do método. Vários pipes no mesmo parâmetro rodam em sequência, e o primeiro que lançar exceção interrompe os seguintes.',
      'Exception filters capturam exceções não tratadas lançadas em qualquer etapa (inclusive guards e pipes) e montam a resposta de erro. Sem um filter próprio, o Nest usa o padrão { message, error, statusCode }.',
      'Cada componente pode ser aplicado globalmente (APP_GUARD, APP_INTERCEPTOR, APP_FILTER, APP_PIPE no módulo, com DI), por controller ou por rota (@UseGuards, @UseInterceptors, @UsePipes, @UseFilters). A ordem é global → controller → rota; filters são a exceção e resolvem da rota para o global.',
    ],
    concepts: [
      { term: 'Middleware', description: 'Primeira etapa, estilo Express (req, res, next). Configurado no módulo com configure().' },
      { term: 'Guard', description: 'Decide se a requisição segue. canActivate → true ou exceção (401, 403, 503).' },
      { term: 'Interceptor', description: 'Antes e depois do método, com RxJS. Tempo, cache, transformação de resposta.' },
      { term: 'Pipe', description: 'Transforma e valida argumentos: ParseIntPipe, ValidationPipe (Módulo 03).' },
      { term: 'Exception filter', description: 'Transforma exceções não tratadas em respostas de erro.' },
      { term: 'APP_GUARD e afins', description: 'Tokens para registrar componentes globais pelo módulo, com injeção de dependência.' },
    ],
    examples: [
      {
        title: 'um interceptor que mede o tempo',
        description: 'O código antes de next.handle() roda na ida; o que está dentro de tap roda na volta, quando o método já respondeu.',
        sample: {
          filename: 'src/comum/tempo.interceptor.ts',
          language: 'ts',
          code: `import { Injectable, type CallHandler, type ExecutionContext, type NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import { tap, type Observable } from 'rxjs';

@Injectable()
export class TempoInterceptor implements NestInterceptor {
  intercept(contexto: ExecutionContext, next: CallHandler): Observable<unknown> {
    console.log('3. interceptor   (antes)');
    const inicio = performance.now();
    return next.handle().pipe(
      tap(() => {
        const ms = (performance.now() - inicio).toFixed(1);
        contexto.switchToHttp().getResponse<Response>().setHeader('X-Tempo-Ms', ms);
        console.log('7. interceptor   (depois) ' + ms + ' ms');
      }),
    );
  }
}`,
          lineNotes: [
            { line: '7', note: 'contexto dá acesso à requisição, à resposta e ao método de destino; next representa o restante do fluxo.' },
            { line: '8-9', note: 'Etapa de ida: roda antes dos pipes e do controller.' },
            { line: '10', note: 'next.handle() executa pipes, controller e service, e devolve um Observable com o resultado.' },
            { line: '11-15', note: 'tap roda quando o resultado chega, antes de a resposta ser enviada: ainda dá tempo de adicionar um header.' },
          ],
        },
      },
      {
        title: 'um filter que padroniza erros',
        description: '@Catch() sem argumentos captura qualquer exceção, de qualquer etapa.',
        sample: {
          filename: 'src/comum/erros.filter.ts',
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
    const mensagem = erro instanceof HttpException ? erro.message : 'Erro interno do servidor';
    if (!(erro instanceof HttpException)) console.error(erro);

    console.log('!  filter        status', status);
    resposta.status(status).json({
      statusCode: status,
      mensagem,
      caminho: requisicao.originalUrl,
      momento: new Date().toISOString(),
    });
  }
}`,
          lineNotes: [
            { line: '4', note: '@Catch() vazio captura tudo. @Catch(HttpException) capturaria só exceções HTTP.' },
            { line: '11-12', note: 'Exceções HTTP trazem status e mensagem próprios; qualquer outra vira 500, com mensagem genérica.' },
            { line: '13', note: 'Erros inesperados vão para o log com stack trace, nunca para o cliente.' },
            { line: '16-21', note: 'Um formato único para todos os erros da API, incluindo o caminho e o momento do erro.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'GET /tarefas/1 pelo pipeline do Nest',
      steps: [
        { label: '1. Middleware', detail: 'LogMiddleware registra método e URL e chama next().' },
        { label: '2. Guard', detail: 'ManutencaoGuard verifica se a API está em manutenção. Se estiver, lança 503 e nada mais roda.' },
        { label: '3. Interceptor (ida)', detail: 'TempoInterceptor marca o início.' },
        { label: '4. Pipes', detail: 'ParseIntPipe converte "1" em 1; PositivoPipe recusa valores menores ou iguais a zero.' },
        { label: '5–6. Controller e service', detail: 'buscar(1) chama tarefasService.buscarPorId(1).' },
        { label: '7. Interceptor (volta)', detail: 'Calcula o tempo e adiciona o header X-Tempo-Ms à resposta.' },
        { label: 'Exception filter (se algo falhar)', detail: 'Em qualquer etapa, uma exceção não tratada vai para o ErrosFilter, que monta a resposta de erro.' },
      ],
      caption: 'Ordem documentada pelo Nest: middleware → guards → interceptors (antes) → pipes → controller → interceptors (depois) → filters em caso de exceção.',
    },
  ],
  practice: {
    goal:
      'Implementar um componente de cada tipo no tarefas-api, com logs numerados, e observar a ordem real de execução, inclusive quando a requisição é interrompida em etapas diferentes.',
    structure: `tarefas-api/src/
├── app.module.ts
├── comum/
│   ├── log.middleware.ts
│   ├── manutencao.guard.ts
│   ├── tempo.interceptor.ts
│   ├── positivo.pipe.ts
│   └── erros.filter.ts
└── tarefas/
    ├── tarefas.controller.ts
    └── tarefas.service.ts   (adicione o log 6 em buscarPorId)`,
    files: [
      {
        path: 'src/comum/log.middleware.ts',
        purpose: 'Middleware de classe: implementa use(req, res, next), como no Express.',
        sample: {
          language: 'ts',
          code: `import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class LogMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    console.log('1. middleware   ', req.method, req.originalUrl);
    next();
  }
}`,
          lineNotes: [{ line: '8', note: 'Sem next(), a requisição para aqui e nunca recebe resposta.' }],
        },
      },
      {
        path: 'src/comum/manutencao.guard.ts',
        purpose: 'Um guard que bloqueia a API inteira quando MANUTENCAO=1. No Módulo 07, guards fazem autenticação e autorização.',
        sample: {
          language: 'ts',
          code: `import { Injectable, ServiceUnavailableException, type CanActivate } from '@nestjs/common';

@Injectable()
export class ManutencaoGuard implements CanActivate {
  canActivate(): boolean {
    console.log('2. guard        ');
    if (process.env.MANUTENCAO === '1') {
      throw new ServiceUnavailableException('API em manutenção. Tente novamente em alguns minutos.');
    }
    return true;
  }
}`,
          lineNotes: [
            { line: '7-9', note: 'Lançar uma exceção dá uma resposta clara (503). Devolver false resultaria em um 403 genérico.' },
            { line: '10', note: 'true: a requisição segue para os interceptors e pipes.' },
          ],
        },
      },
      {
        path: 'src/comum/tempo.interceptor.ts',
        purpose: 'O interceptor da seção B.',
        sample: { language: 'ts', code: `import { Injectable, type CallHandler, type ExecutionContext, type NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import { tap, type Observable } from 'rxjs';

@Injectable()
export class TempoInterceptor implements NestInterceptor {
  intercept(contexto: ExecutionContext, next: CallHandler): Observable<unknown> {
    console.log('3. interceptor   (antes)');
    const inicio = performance.now();
    return next.handle().pipe(
      tap(() => {
        const ms = (performance.now() - inicio).toFixed(1);
        contexto.switchToHttp().getResponse<Response>().setHeader('X-Tempo-Ms', ms);
        console.log('7. interceptor   (depois) ' + ms + ' ms');
      }),
    );
  }
}` },
      },
      {
        path: 'src/comum/positivo.pipe.ts',
        purpose: 'Um pipe próprio, aplicado depois do ParseIntPipe no mesmo parâmetro.',
        sample: {
          language: 'ts',
          code: `import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';

@Injectable()
export class PositivoPipe implements PipeTransform<number, number> {
  transform(valor: number): number {
    console.log('4. pipe          valor =', valor);
    if (valor <= 0) throw new BadRequestException('O id deve ser um número positivo');
    return valor;
  }
}`,
          lineNotes: [
            { line: '4', note: 'PipeTransform<entrada, saída>: recebe o number que o ParseIntPipe já converteu.' },
            { line: '7-8', note: 'Recusa com 400 ou devolve o valor (possivelmente transformado) para o próximo pipe ou para o método.' },
          ],
        },
      },
      {
        path: 'src/comum/erros.filter.ts',
        purpose: 'O filter da seção B.',
        sample: { language: 'ts', code: `import { Catch, HttpException, HttpStatus, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class ErrosFilter implements ExceptionFilter {
  catch(erro: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const requisicao = http.getRequest<Request>();
    const resposta = http.getResponse<Response>();

    const status = erro instanceof HttpException ? erro.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const mensagem = erro instanceof HttpException ? erro.message : 'Erro interno do servidor';
    if (!(erro instanceof HttpException)) console.error(erro);

    console.log('!  filter        status', status);
    resposta.status(status).json({
      statusCode: status,
      mensagem,
      caminho: requisicao.originalUrl,
      momento: new Date().toISOString(),
    });
  }
}` },
      },
      {
        path: 'src/app.module.ts',
        purpose: 'Guard, interceptor e filter registrados globalmente pelo módulo; o middleware, aplicado às rotas de tarefas.',
        sample: {
          language: 'ts',
          code: `import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ErrosFilter } from './comum/erros.filter.js';
import { LogMiddleware } from './comum/log.middleware.js';
import { ManutencaoGuard } from './comum/manutencao.guard.js';
import { TempoInterceptor } from './comum/tempo.interceptor.js';
import { HealthController } from './health/health.controller.js';
import { RelatoriosModule } from './relatorios/relatorios.module.js';
import { TarefasController } from './tarefas/tarefas.controller.js';
import { TarefasModule } from './tarefas/tarefas.module.js';

@Module({
  imports: [TarefasModule, RelatoriosModule],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ManutencaoGuard },
    { provide: APP_INTERCEPTOR, useClass: TempoInterceptor },
    { provide: APP_FILTER, useClass: ErrosFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes(TarefasController);
  }
}`,
          lineNotes: [
            { line: '15-19', note: 'APP_GUARD, APP_INTERCEPTOR e APP_FILTER tornam os componentes globais e permitem injetar dependências neles, ao contrário de app.useGlobalGuards() no main.ts.' },
            { line: '21-24', note: 'Middlewares são configurados implementando NestModule. forRoutes aceita controllers, caminhos ou objetos { path, method }.' },
          ],
        },
      },
      {
        path: 'src/tarefas/tarefas.controller.ts',
        purpose: 'A rota de busca recebe os dois pipes e um log. O resto é igual ao da aula de Services.',
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
import { PositivoPipe } from '../comum/positivo.pipe.js';
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
  buscar(@Param('id', ParseIntPipe, PositivoPipe) id: number): Tarefa {
    console.log('5. controller    buscar', id);
    return this.tarefasService.buscarPorId(id);
  }

  @Post()
  criar(@Body() corpo: { titulo?: unknown }): Tarefa {
    if (typeof corpo?.titulo !== 'string' || corpo.titulo.trim() === '') {
      throw new BadRequestException('titulo é obrigatório');
    }
    return this.tarefasService.criar(corpo.titulo);
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
            { line: '31', note: 'Pipes em sequência: ParseIntPipe primeiro, PositivoPipe depois. Se o primeiro falhar, o segundo nem roda.' },
            { line: '32', note: 'Log da etapa 5.' },
          ],
        },
      },
    ],
    run: [
      'cd tarefas-api',
      "# Em tarefas.service.ts, primeira linha de buscarPorId: console.log('6. service       buscarPorId', id);",
      'npm run start:dev',
      '# Para testar o guard, no PowerShell:',
      '$env:MANUTENCAO=1; npm run start:dev',
    ],
    httpTests: [
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Ver o fluxo" }`,
        expected: '201 com a tarefa 1. Na aba Headers, X-Tempo-Ms.',
      },
      {
        method: 'GET',
        url: 'http://localhost:3000/tarefas/1',
        expected: '200 com a tarefa. No terminal, os logs de 1 a 7, nessa ordem.',
      },
      {
        method: 'GET',
        url: 'http://localhost:3000/tarefas/0',
        expected: '400 com {"statusCode":400,"mensagem":"O id deve ser um número positivo","caminho":"/tarefas/0",...}. Logs: 1, 2, 3, 4 e o filter.',
      },
      {
        method: 'GET',
        url: 'http://localhost:3000/tarefas/abc',
        expected: '400 "Validation failed (numeric string is expected)". Logs: 1, 2, 3 e o filter: o ParseIntPipe falhou antes do pipe 4 rodar.',
      },
      {
        method: 'GET',
        url: 'http://localhost:3000/tarefas/99',
        expected: '404 no formato do ErrosFilter. Logs de 1 a 6 e o filter: o erro saiu do service.',
      },
      {
        method: 'GET',
        url: 'http://localhost:3000/health',
        expected: 'Com MANUTENCAO=1: 503 "API em manutenção...". Logs: só 2 e o filter. O guard é global, e o middleware só vale para tarefas.',
      },
    ],
    expected: `Para GET /tarefas/1:
1. middleware    GET /tarefas/1
2. guard
3. interceptor   (antes)
4. pipe          valor = 1
5. controller    buscar 1
6. service       buscarPorId 1
7. interceptor   (depois) 0.5 ms`,
  },
  commonErrors: [
    {
      title: 'Middleware sem next()',
      symptom: 'Todas as rotas afetadas ficam carregando até o timeout.',
      cause: 'O middleware não respondeu nem chamou next(), então o pipeline parou nele.',
      fix: 'Sempre chame next(), ou responda. É a mesma regra do pipeline do Módulo 01.',
    },
    {
      title: 'Guard que devolve false em vez de lançar uma exceção',
      symptom: 'O cliente recebe 403 "Forbidden resource" em situações que não são falta de permissão.',
      cause: 'Quando canActivate devolve false, o Nest lança ForbiddenException por padrão.',
      fix: 'Lance a exceção que descreve a situação: UnauthorizedException (401), ForbiddenException (403), ServiceUnavailableException (503).',
    },
    {
      title: 'useGlobalGuards no main.ts e a dependência não é injetada',
      symptom: 'Um guard global que recebe um service no construtor falha, ou exige new Guard(dependências) à mão.',
      cause: 'Componentes registrados com app.useGlobal*() ficam fora do container de injeção de dependência.',
      fix: 'Registre com { provide: APP_GUARD, useClass: MeuGuard } em um módulo, como na prática.',
    },
    {
      title: 'Colocar a responsabilidade na etapa errada',
      symptom: 'Validação dentro do interceptor, autenticação em pipe, log de tempo no middleware sem saber o resultado final.',
      cause: 'Cada etapa tem informações e garantias diferentes.',
      fix: 'Acesso: guard. Formato dos argumentos: pipe. Antes e depois do método (tempo, transformação, cache): interceptor. Erros: filter. Requisição crua (log de acesso, CORS): middleware.',
    },
  ],
  guidance: {
    before: ['Decorators.', 'Dependency Injection.', 'Módulo 01: Ciclo de vida de uma requisição.'],
    now: ['A ordem do pipeline.', 'O papel de cada componente.', 'Registro global com APP_* e local com @Use*().', 'Onde cada responsabilidade deve ficar.'],
    after: [
      'Exercício do módulo: primeiro feature module completo.',
      'Módulo 03: ValidationPipe e DTOs.',
      'Módulo 07: guards de autenticação e autorização.',
    ],
    officialDocs: [
      { label: 'NestJS · Request lifecycle', url: 'https://docs.nestjs.com/faq/request-lifecycle' },
      { label: 'NestJS · Middleware', url: 'https://docs.nestjs.com/middleware' },
      { label: 'NestJS · Guards', url: 'https://docs.nestjs.com/guards' },
      { label: 'NestJS · Interceptors', url: 'https://docs.nestjs.com/interceptors' },
      { label: 'NestJS · Pipes', url: 'https://docs.nestjs.com/pipes' },
      { label: 'NestJS · Exception filters', url: 'https://docs.nestjs.com/exception-filters' },
    ],
  },
}

export default lesson
