import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'forbidNonWhitelisted é uma opção do ValidationPipe usada junto com whitelist. Em vez de remover em silêncio as propriedades não declaradas no DTO, ela recusa a requisição com 400 e diz qual campo não deveria existir.',
    purpose:
      'Tornar o contrato estrito e visível: o cliente descobre na hora que enviou algo que a API não aceita, seja por engano, por versão desatualizada da documentação ou por tentativa de mass assignment.',
    problem:
      'Com whitelist sozinha, um erro de digitação como "titlo" faz o campo sumir sem aviso, e o cliente recebe uma mensagem confusa (título obrigatório) ou, pior, um sucesso com dados incompletos. Erros silenciosos custam horas de investigação.',
    whyExists:
      'Falhar cedo e de forma explícita é um princípio de APIs robustas. Um erro claro na fronteira é muito mais barato que um comportamento inesperado lá dentro.',
    whereUsed:
      'Em APIs que querem contratos estritos, principalmente as consumidas por outras equipes ou clientes externos. Algumas APIs públicas preferem só whitelist, para tolerar clientes que enviam campos a mais; é uma decisão de design.',
  },
  technical: {
    internals: [
      'forbidNonWhitelisted só tem efeito com whitelist: true. Sozinha, não faz nada.',
      'Cada propriedade extra gera um erro de validação com a mensagem "property NOME should not exist", reunido com os demais erros na mesma resposta 400.',
      'A verificação usa o mesmo critério da whitelist: propriedades sem decorator de validação no DTO são consideradas não permitidas.',
      'Ela também vale para query strings validadas com DTOs: ?ordem=asc em uma rota cujo DTO não declara ordem é recusado.',
      'A mensagem padrão vem do class-validator, não do seu DTO. A aula de Tratamento de respostas inválidas mostra como traduzi-la.',
    ],
    concepts: [
      { term: 'forbidNonWhitelisted', description: 'Transforma propriedades extras em erro 400, em vez de removê-las.' },
      { term: 'Contrato estrito', description: 'A API aceita exatamente o que declara, nem mais nem menos.' },
      { term: 'Falhar cedo', description: 'Recusar na entrada, com uma mensagem clara, em vez de seguir com dados inesperados.' },
      { term: 'Tolerância x rigor', description: 'Ignorar campos extras facilita a evolução de clientes; recusá-los evita erros silenciosos.' },
      { term: 'whitelistValidation', description: 'O nome interno da regra que gera "property X should not exist".' },
    ],
    examples: [
      {
        title: 'a mesma requisição com cada configuração',
        description: 'Um erro de digitação no nome do campo, em três configurações do ValidationPipe.',
        sample: {
          filename: 'comparacao.http',
          language: 'http',
          code: `POST /tarefas HTTP/1.1
Content-Type: application/json

{"titlo":"Erro de digitação"}

# Sem whitelist: o DTO recebe titlo, e titulo falha nas regras
HTTP/1.1 400 Bad Request
{"message":["titulo must be longer than or equal to 3 characters","titulo must be a string"],...}

# Com whitelist: titlo some em silêncio, e a mensagem é a mesma
HTTP/1.1 400 Bad Request
{"message":["titulo must be longer than or equal to 3 characters","titulo must be a string"],...}

# Com whitelist + forbidNonWhitelisted: o erro aponta a causa real
HTTP/1.1 400 Bad Request
{"message":["property titlo should not exist","titulo must be longer than or equal to 3 characters","titulo must be a string"],...}`,
          lineNotes: [
            { line: '4', note: '"titlo" em vez de "titulo".' },
            { line: '6-12', note: 'Nos dois primeiros casos, a resposta fala só do título ausente. O cliente procura o erro no lugar errado.' },
            { line: '14-16', note: 'A primeira mensagem diz exatamente o que está errado.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Decidindo entre remover e recusar',
      steps: [
        { label: 'A instância é criada com todos os campos', detail: 'plainToInstance copia tudo o que veio.' },
        { label: 'whitelist encontra os campos sem decorator', detail: 'concluida e id, por exemplo.' },
        { label: 'Sem forbidNonWhitelisted', detail: 'Os campos são removidos e a validação continua.' },
        { label: 'Com forbidNonWhitelisted', detail: 'Cada campo vira um erro "property X should not exist".' },
        { label: 'Resposta', detail: '400 com todos os erros juntos: campos proibidos e regras que falharam.' },
      ],
    },
  ],
  practice: {
    goal: 'Ligar forbidNonWhitelisted e comparar as respostas para campos extras e para erros de digitação.',
    structure: `tarefas-api/src/
└── main.ts   (remova o console.log temporário do controller)`,
    files: [
      {
        path: 'src/main.ts',
        purpose: 'whitelist e forbidNonWhitelisted juntos: o contrato fica estrito.',
        sample: {
          language: 'ts',
          code: `import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();`,
          lineNotes: [{ line: '7', note: 'As duas opções juntas. forbidNonWhitelisted sem whitelist não tem efeito.' }],
        },
      },
    ],
    run: ['cd tarefas-api', 'npm run start:dev'],
    httpTests: [
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Com forbid", "concluida": true, "id": 999 }`,
        expected: '400 com {"message":["property concluida should not exist","property id should not exist"],"error":"Bad Request","statusCode":400}.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titlo": "Erro de digitação" }`,
        expected: '400 com "property titlo should not exist" como primeira mensagem.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Com forbid", "prioridade": 2 }`,
        expected: '201: dentro do contrato, tudo funciona como antes.',
      },
    ],
    expected: `Campos que o DTO não declara agora geram 400 com o nome do campo.
Requisições dentro do contrato não mudam.`,
  },
  commonErrors: [
    {
      title: 'Cliente antigo começa a receber 400',
      symptom: 'Depois de ligar a opção, um front-end ou integração existente passa a falhar.',
      cause: 'Ele envia campos que a API nunca usou (e que antes eram ignorados).',
      fix: 'Avise e corrija os clientes, ou ligue a opção só em APIs novas. É uma mudança de contrato: trate como tal.',
    },
    {
      title: 'Ligar forbidNonWhitelisted sem whitelist',
      symptom: 'Campos extras continuam passando, sem erro.',
      cause: 'A opção depende de whitelist: true para funcionar.',
      fix: 'Use as duas opções juntas.',
    },
    {
      title: 'Campo legítimo recusado como "should not exist"',
      symptom: 'property descricao should not exist, embora descricao esteja no DTO.',
      cause: 'A propriedade foi declarada sem nenhum decorator de validação.',
      fix: 'Adicione as regras do campo (no mínimo @IsOptional() e o tipo).',
    },
    {
      title: 'Parâmetros de paginação recusados na listagem',
      symptom: '?pagina=2 responde "property pagina should not exist".',
      cause: 'O DTO da query não declara o parâmetro.',
      fix: 'Declare todos os parâmetros aceitos no DTO da query (aula de Transform).',
    },
  ],
  guidance: {
    before: ['Whitelist.'],
    now: ['Remover x recusar campos extras.', 'Contratos estritos e mudanças de contrato.'],
    after: ['Transform: DTOs para query strings e conversão de tipos.', 'Tratamento de respostas inválidas: traduzir as mensagens.'],
    officialDocs: [{ label: 'NestJS · Validation (stripping properties)', url: 'https://docs.nestjs.com/application/validation' }],
  },
}

export default lesson
