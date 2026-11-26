import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'ValidationPipe é o pipe do Nest que valida automaticamente os argumentos das rotas. Para cada parâmetro tipado com uma classe (como @Body() dados: CriarTarefaDto), ele cria uma instância com class-transformer, valida com class-validator e, se houver erros, responde 400 antes de o controller rodar.',
    purpose:
      'Garantir que nenhum método de controller receba dados fora do contrato. A validação passa a ser uma etapa do pipeline, configurada uma única vez para a aplicação inteira.',
    problem:
      'Nas aulas anteriores, as regras existiam no DTO, mas ninguém as aplicava nas rotas: era preciso chamar plainToInstance e validate à mão em cada método, e lembrar de transformar os erros em resposta 400.',
    whyExists:
      'Validar a entrada é responsabilidade transversal: vale para todas as rotas. No pipeline do Nest (Módulo 02), pipes são justamente a etapa que transforma e valida argumentos logo antes do método.',
    whereUsed:
      'Em praticamente toda API Nest, registrado globalmente no main.ts ou pelo token APP_PIPE. As opções whitelist, forbidNonWhitelisted e transform, das próximas aulas, completam a configuração.',
  },
  technical: {
    internals: [
      'Para cada parâmetro, o pipe recebe o valor e os metadados do parâmetro, incluindo o tipo declarado (que vem de design:paramtypes, o mesmo metadado da injeção de dependência).',
      'Se o tipo for uma classe (e não String, Number, Boolean, Array ou Object), o pipe chama plainToInstance(Classe, valor) e depois validate(instancia).',
      'Com erros, o pipe lança BadRequestException com a lista de mensagens de todas as regras que falharam. Sem erros, o método recebe o valor (o original, ou a instância transformada se transform estiver ligado).',
      'Parâmetros com tipos primitivos ou interfaces não são validados. Por isso DTOs são classes.',
      'app.useGlobalPipes aplica o pipe a todas as rotas. Também é possível aplicar por rota com @UsePipes ou por parâmetro, como @Body(new ValidationPipe()).',
      'JSON malformado nunca chega ao pipe: o Express recusa antes, com 400 e a mensagem do JSON.parse.',
    ],
    concepts: [
      { term: 'ValidationPipe', description: 'Pipe que aplica plainToInstance e validate aos parâmetros tipados com classes.' },
      { term: 'useGlobalPipes', description: 'Registra o pipe para todas as rotas da aplicação.' },
      { term: '400 com lista de mensagens', description: 'O formato padrão do erro: message é um array com todas as falhas.' },
      { term: 'Metatype', description: 'O tipo declarado do parâmetro, que o pipe usa para saber qual classe validar.' },
      { term: 'Pipe global x local', description: 'Global no main.ts para tudo; local com @UsePipes ou no próprio decorator do parâmetro.' },
      { term: 'StandardSchemaValidationPipe', description: 'Alternativa do Nest 12 para validar com schemas (Zod, Valibot) em vez de classes.' },
    ],
    examples: [
      {
        title: 'o que o pipe faz por baixo',
        description: 'Uma versão simplificada da lógica do ValidationPipe, para entender os passos.',
        sample: {
          filename: 'pipe-simplificado.ts',
          language: 'ts',
          code: `import { BadRequestException, Injectable, type ArgumentMetadata, type PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

const SEM_REGRAS: unknown[] = [String, Number, Boolean, Array, Object];

@Injectable()
export class MeuValidationPipe implements PipeTransform {
  async transform(valor: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || SEM_REGRAS.includes(metatype)) return valor;

    const instancia = plainToInstance(metatype, valor) as object;
    const erros = await validate(instancia);
    if (erros.length > 0) {
      throw new BadRequestException(erros.flatMap((e) => Object.values(e.constraints ?? {})));
    }
    return valor;
  }
}`,
          lineNotes: [
            { line: '5', note: 'Tipos primitivos e Object (o que sobra de uma interface) não têm regras de validação.' },
            { line: '9', note: 'metatype é a classe declarada no parâmetro, como CriarTarefaDto.' },
            { line: '10', note: 'Sem classe com regras, o valor passa sem validação.' },
            { line: '12-13', note: 'Os dois passos das aulas anteriores: criar a instância e validar.' },
            { line: '14-16', note: 'Qualquer falha vira 400 com a lista de mensagens, e o controller não é chamado.' },
            { line: '17', note: 'Devolve o valor original. Com a opção transform, o pipe real devolve a instância (aula de Transform).' },
          ],
        },
      },
      {
        title: 'aplicar só em uma rota',
        description: 'Útil em casos especiais. No dia a dia, prefira o pipe global.',
        sample: {
          filename: 'pipe-local.ts',
          language: 'ts',
          code: `import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CriarTarefaDto } from './tarefas/dto/criar-tarefa.dto.js';

@Controller('exemplo')
export class ExemploController {
  @Post('a')
  @UsePipes(new ValidationPipe())
  rotaA(@Body() dados: CriarTarefaDto) {
    return dados;
  }

  @Post('b')
  rotaB(@Body(new ValidationPipe()) dados: CriarTarefaDto) {
    return dados;
  }
}`,
          lineNotes: [
            { line: '7', note: '@UsePipes aplica o pipe a todos os parâmetros desta rota.' },
            { line: '13', note: 'Passado ao decorator, o pipe vale só para este parâmetro.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'POST /tarefas com o ValidationPipe global',
      steps: [
        { label: 'O Express interpreta o JSON', detail: 'JSON malformado é recusado aqui, com 400.' },
        { label: 'Guards e interceptors rodam', detail: 'Como no pipeline do Módulo 02.' },
        { label: 'O ValidationPipe recebe o corpo', detail: 'E descobre, pelo metatype, que o parâmetro é um CriarTarefaDto.' },
        { label: 'plainToInstance + @Transform', detail: 'Cria a instância e apara os textos.' },
        { label: 'validate', detail: 'Confere todas as regras do DTO.' },
        { label: 'Erros → 400; sem erros → controller', detail: 'O método só roda com dados dentro do contrato.' },
      ],
    },
  ],
  practice: {
    goal: 'Ativar o ValidationPipe para toda a aplicação e ver as regras do DTO protegendo POST /tarefas, sem nenhuma validação manual no controller.',
    structure: `tarefas-api/src/
├── main.ts
└── tarefas/dto/
    └── criar-tarefa.dto.ts   (o da aula de Class Transformer)`,
    files: [
      {
        path: 'src/main.ts',
        purpose: 'Uma linha registra o pipe para todas as rotas. Apague os scripts validar-manual.ts e transformar.ts, que já cumpriram seu papel.',
        sample: {
          language: 'ts',
          code: `import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();`,
          lineNotes: [
            { line: '1', note: 'ValidationPipe vem de @nestjs/common e usa class-validator e class-transformer, que precisam estar instalados.' },
            { line: '7', note: 'Global: todo parâmetro tipado com uma classe passa a ser validado.' },
          ],
        },
      },
    ],
    run: ['cd tarefas-api', 'npm run start:dev'],
    httpTests: [
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "  Estudar ValidationPipe  ", "prioridade": 2 }`,
        expected: '201, com o título aparado: "Estudar ValidationPipe".',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": 123 }`,
        expected: '400 com {"message":["titulo must be longer than or equal to 3 and shorter than or equal to 80 characters","titulo must be a string"],"error":"Bad Request","statusCode":400}. Antes era um 500.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Oi", "prioridade": "alta" }`,
        expected: '400 com as mensagens de título curto e de prioridade (máximo, mínimo e inteiro).',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Campo extra", "admin": true }`,
        expected: '201: o campo admin ainda passa. É o assunto da próxima aula.',
      },
    ],
    expected: `Erros do cliente agora respondem 400 com mensagens, em vez de 500 ou de dados inválidos gravados.
O controller continua com uma linha por rota.`,
  },
  commonErrors: [
    {
      title: 'Nada é validado depois de registrar o pipe',
      symptom: 'Dados inválidos continuam passando.',
      cause: 'O parâmetro está tipado com uma interface, um type alias ou object, ou o DTO não tem nenhum decorator de validação.',
      fix: 'Tipe o parâmetro com uma classe que tenha decorators do class-validator.',
    },
    {
      title: 'Erro ao iniciar: o pacote "class-validator" não foi encontrado',
      symptom: 'A aplicação não sobe, com uma mensagem pedindo para instalar class-validator ou class-transformer.',
      cause: 'O ValidationPipe carrega essas bibliotecas na criação, e elas não estão instaladas.',
      fix: 'npm install class-validator class-transformer.',
    },
    {
      title: 'Pipe criado no main.ts sem acesso a providers',
      symptom: 'Você precisa injetar algo no pipe (ou em uma factory de erros) e não consegue.',
      cause: 'Pipes registrados com app.useGlobalPipes ficam fora do container de injeção de dependência.',
      fix: 'Registre com { provide: APP_PIPE, useValue: new ValidationPipe(...) } (ou useClass) em um módulo, como fizemos com APP_GUARD.',
    },
    {
      title: 'Testes e2e sem o pipe',
      symptom: 'Em testes, rotas aceitam dados que em produção são recusados.',
      cause: 'O app do teste é criado sem passar pelo main.ts, então o pipe global não é registrado.',
      fix: 'Registre o mesmo pipe no app de teste, ou use APP_PIPE no módulo para que ele valha em qualquer lugar (Módulo 08).',
    },
  ],
  guidance: {
    before: ['Class Validator e Class Transformer.', 'Módulo 02: Fluxo de uma requisição (pipes).'],
    now: ['O que o ValidationPipe faz por baixo.', 'Registro global e local.', 'O formato padrão do erro 400.'],
    after: ['Whitelist: remover campos que o DTO não declara.', 'Transform: receber instâncias e tipos convertidos.'],
    officialDocs: [
      { label: 'NestJS · Validation', url: 'https://docs.nestjs.com/application/validation' },
      { label: 'NestJS · Pipes', url: 'https://docs.nestjs.com/pipes' },
    ],
  },
}

export default lesson
