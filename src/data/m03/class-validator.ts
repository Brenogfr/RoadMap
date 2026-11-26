import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'class-validator é uma biblioteca que valida objetos a partir de decorators colocados nas propriedades de uma classe: @IsString(), @Length(3, 80), @IsInt(), @Min(1). A função validate(objeto) confere cada regra e devolve a lista de erros.',
    purpose:
      'Declarar as regras de formato dos dados uma única vez, junto do próprio DTO, em vez de escrever if e typeof em cada rota. O DTO passa a ser, ao mesmo tempo, a documentação e a verificação do contrato.',
    problem:
      'Validação manual cresce rápido: cada campo precisa de checagem de tipo, tamanho, faixa e obrigatoriedade, com uma mensagem para cada caso. Isso se repete entre criar e atualizar, e é fácil esquecer um campo ou deixar mensagens inconsistentes.',
    whyExists:
      'Validação declarativa é um padrão consolidado (Bean Validation, no Java, segue a mesma ideia). class-validator traz esse modelo ao TypeScript usando decorators, e o Nest o integra pelo ValidationPipe.',
    whereUsed:
      'Em praticamente todos os projetos NestJS com DTOs. Também pode ser usada fora do Nest, em qualquer código TypeScript que precise validar objetos.',
  },
  technical: {
    internals: [
      'Cada decorator de validação registra uma regra em um armazenamento global de metadados, associada à classe e à propriedade. Nada é validado quando a classe é definida.',
      'validate(objeto) descobre a classe do objeto pelo construtor dele, busca as regras registradas para essa classe e executa cada uma. Por isso o objeto precisa ser uma instância do DTO.',
      'O resultado é uma lista de ValidationError: uma entrada por propriedade com problema, com property, value e constraints (um mapa nome-da-regra → mensagem).',
      '@IsOptional() faz as outras regras daquela propriedade serem ignoradas quando o valor é undefined ou null. Sem ele, um campo ausente falha nas outras regras.',
      'A opção { each: true } aplica a regra a cada item de um array, como @IsString({ each: true }).',
      'Na versão atual, validate em um objeto que não é instância de uma classe com regras devolve o erro "an unknown value was passed to the validate function" (opção forbidUnknownValues, ligada por padrão).',
    ],
    concepts: [
      { term: '@IsString, @IsInt, @IsBoolean', description: 'Conferem o tipo do valor.' },
      { term: '@Length, @Min, @Max', description: 'Limites de tamanho (textos) e de valor (números).' },
      { term: '@IsOptional', description: 'O campo pode faltar; as demais regras só valem se ele vier.' },
      { term: '@IsEmail, @IsUUID, @IsUrl, @Matches', description: 'Formatos comuns e expressões regulares.' },
      { term: 'validate()', description: 'Executa as regras e devolve uma lista de ValidationError.' },
      { term: 'constraints', description: 'O mapa de regras que falharam com suas mensagens, dentro de cada erro.' },
    ],
    examples: [
      {
        title: 'um catálogo de regras comuns',
        description: 'Decorators que você vai usar no dia a dia, em um DTO ilustrativo.',
        sample: {
          filename: 'catalogo.dto.ts',
          language: 'ts',
          code: `import { IsEmail, IsIn, IsOptional, IsPositive, IsUrl, IsUUID, Length, Matches } from 'class-validator';

export class CadastroExemploDto {
  @IsEmail()
  email: string;

  @Length(8, 64)
  @Matches(/[0-9]/, { message: 'senha deve conter ao menos um número' })
  senha: string;

  @IsIn(['admin', 'cliente'])
  papel: string;

  @IsOptional()
  @IsUrl()
  site?: string;

  @IsUUID()
  convite: string;

  @IsPositive()
  limiteDeCredito: number;
}`,
          lineNotes: [
            { line: '4-5', note: '@IsEmail confere o formato do e-mail, não se ele existe.' },
            { line: '7-9', note: 'Várias regras na mesma propriedade. message substitui a mensagem padrão, em inglês.' },
            { line: '11-12', note: '@IsIn aceita apenas os valores listados. Funciona bem com tipos união.' },
            { line: '14-16', note: 'Opcional: se vier, precisa ser uma URL.' },
          ],
        },
      },
      {
        title: 'a forma de um erro de validação',
        description: 'O que validate() devolve para { titulo: "Oi", prioridade: 9 }, simplificado.',
        sample: {
          filename: 'erros.json',
          language: 'json',
          code: `[
  {
    "property": "titulo",
    "value": "Oi",
    "constraints": {
      "isLength": "titulo must be longer than or equal to 3 characters"
    }
  },
  {
    "property": "prioridade",
    "value": 9,
    "constraints": {
      "max": "prioridade must not be greater than 5"
    }
  }
]`,
          lineNotes: [
            { line: '3-4', note: 'Qual campo falhou e com qual valor.' },
            { line: '5-7', note: 'Uma chave por regra que falhou. O nome da regra (isLength) serve para traduzir ou tratar mensagens.' },
            { line: '11-14', note: 'Só as regras que falharam aparecem. @IsInt passou, então não está na lista.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Do decorator ao erro',
      steps: [
        { label: 'A classe é definida', detail: 'Cada decorator registra sua regra nos metadados do class-validator.' },
        { label: 'Um objeto é criado a partir dos dados', detail: 'Ele precisa ser uma instância do DTO para que as regras sejam encontradas.' },
        { label: 'validate(objeto) é chamado', detail: 'Busca as regras da classe do objeto.' },
        { label: 'Cada regra é executada', detail: '@IsOptional pode pular as demais quando o valor está ausente.' },
        { label: 'Os erros são devolvidos', detail: 'Uma entrada por propriedade, com as mensagens das regras que falharam. Lista vazia significa válido.' },
      ],
    },
  ],
  practice: {
    goal: 'Instalar class-validator, colocar regras no CriarTarefaDto e validar objetos à mão, com um script, para ver exatamente o que a biblioteca devolve.',
    structure: `tarefas-api/src/
├── validar-manual.ts
└── tarefas/dto/
    └── criar-tarefa.dto.ts`,
    files: [
      {
        path: 'src/tarefas/dto/criar-tarefa.dto.ts',
        purpose: 'O DTO ganha regras: título com 3 a 80 caracteres, descrição opcional de até 500 e prioridade inteira de 1 a 5.',
        sample: {
          language: 'ts',
          code: `import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CriarTarefaDto {
  @IsString()
  @Length(3, 80)
  titulo: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  descricao?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  prioridade?: number;
}`,
          lineNotes: [
            { line: '4-6', note: 'Obrigatório (não há @IsOptional), texto, de 3 a 80 caracteres.' },
            { line: '8-11', note: 'Opcional. Se vier, precisa ser texto de até 500 caracteres.' },
            { line: '13-17', note: 'Opcional, inteiro (3.5 falha) e entre 1 e 5.' },
          ],
        },
      },
      {
        path: 'src/validar-manual.ts',
        purpose: 'Um script que monta instâncias do DTO e as valida, sem servidor.',
        sample: {
          language: 'ts',
          code: `import { validate } from 'class-validator';
import { CriarTarefaDto } from './tarefas/dto/criar-tarefa.dto.js';

async function verificar(dados: object) {
  const dto = Object.assign(new CriarTarefaDto(), dados);
  const erros = await validate(dto);
  console.log(JSON.stringify(dados));
  if (erros.length === 0) console.log('  válido');
  for (const erro of erros) console.log('  ' + erro.property + ':', Object.values(erro.constraints ?? {}).join(' | '));
}

await verificar({ titulo: 'Estudar class-validator', prioridade: 2 });
await verificar({ titulo: 'Oi', prioridade: 9 });
await verificar({ titulo: 123, prioridade: 'alta' });
await verificar({});`,
          lineNotes: [
            { line: '5', note: 'Object.assign copia os dados para uma instância de CriarTarefaDto. Na próxima aula, o class-transformer faz isso melhor.' },
            { line: '6', note: 'validate é assíncrona: regras podem consultar recursos externos.' },
            { line: '9', note: 'constraints traz uma mensagem por regra que falhou.' },
          ],
        },
      },
    ],
    run: ['cd tarefas-api', 'npm install class-validator class-transformer', 'npm run build', 'node dist/validar-manual.js'],
    verify:
      'Rode o script e compare com o resultado esperado. Depois troque titulo: "Oi" por "Oi!" e rode de novo: o erro de tamanho do título some. A rota ainda não valida nada: isso acontece na aula de ValidationPipe.',
    expected: `{"titulo":"Estudar class-validator","prioridade":2}
  válido
{"titulo":"Oi","prioridade":9}
  titulo: titulo must be longer than or equal to 3 characters
  prioridade: prioridade must not be greater than 5
{"titulo":123,"prioridade":"alta"}
  titulo: titulo must be longer than or equal to 3 and shorter than or equal to 80 characters | titulo must be a string
  prioridade: prioridade must not be greater than 5 | prioridade must not be less than 1 | prioridade must be an integer number
{}
  titulo: titulo must be longer than or equal to 3 characters | titulo must be a string`,
  },
  commonErrors: [
    {
      title: 'an unknown value was passed to the validate function',
      symptom: 'validate() devolve esse erro mesmo para dados aparentemente corretos.',
      cause: 'O objeto passado não é uma instância de uma classe com regras (por exemplo, o resultado direto de JSON.parse).',
      fix: 'Crie uma instância do DTO antes de validar: plainToInstance (próxima aula) ou, no Nest, deixe o ValidationPipe fazer isso.',
    },
    {
      title: 'Campo opcional que falha quando não é enviado',
      symptom: 'Erros como "descricao must be a string" mesmo sem enviar descricao.',
      cause: 'Faltou @IsOptional(): sem ele, undefined é validado pelas outras regras.',
      fix: 'Adicione @IsOptional() aos campos que podem faltar.',
    },
    {
      title: 'Validar arrays sem { each: true }',
      symptom: '@IsString() em um campo string[] sempre falha, ou itens inválidos passam.',
      cause: 'Sem each, a regra é aplicada ao array inteiro, e não a cada item.',
      fix: 'Use @IsArray() para o campo e { each: true } nas regras dos itens (aula de Validação de dados).',
    },
    {
      title: 'Mensagens em inglês na resposta da API',
      symptom: 'O cliente recebe "titulo must be a string".',
      cause: 'Essas são as mensagens padrão da biblioteca.',
      fix: 'Passe { message: "..." } em cada decorator. A aula de Tratamento de respostas inválidas padroniza tudo.',
    },
  ],
  guidance: {
    before: ['O que são DTOs.', 'Módulo 02: Decorators (metadados).'],
    now: ['Os decorators mais comuns.', '@IsOptional e { each: true }.', 'validate() e a forma de ValidationError.'],
    after: ['Class Transformer: transformar JSON em instâncias.', 'ValidationPipe: validação automática nas rotas.'],
    officialDocs: [
      { label: 'NestJS · Validation', url: 'https://docs.nestjs.com/application/validation' },
      { label: 'class-validator (repositório oficial)', url: 'https://github.com/typestack/class-validator' },
    ],
  },
}

export default lesson
