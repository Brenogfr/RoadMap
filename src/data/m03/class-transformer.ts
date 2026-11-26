import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'class-transformer é uma biblioteca que converte objetos comuns (como o resultado de um JSON.parse) em instâncias de classes, e o caminho inverso. Com decorators como @Transform e @Type, ela também ajusta os valores durante a conversão: apara espaços, converte textos em números ou datas, monta objetos aninhados.',
    purpose:
      'Fazer a ponte entre o JSON que chega, que é só dados, e o DTO, que é uma classe com regras. Sem uma instância do DTO, o class-validator não encontra as regras. Na saída, a mesma biblioteca controla quais campos viram JSON.',
    problem:
      'JSON.parse devolve objetos sem classe. Converter à mão (new Dto(), copiar campo a campo, converter tipos) é repetitivo e esquece casos: objetos aninhados, arrays de objetos, datas que chegam como texto, espaços sobrando nos textos.',
    whyExists:
      'Em TypeScript, tipos não existem em tempo de execução. Quem precisa de comportamento de classe (métodos, metadados, instanceof) precisa de uma instância de verdade, e alguém precisa criá-la a partir dos dados recebidos.',
    whereUsed:
      'Dentro do ValidationPipe do Nest (que chama plainToInstance antes de validar), em DTOs que convertem ou normalizam valores, e na serialização de respostas com @Exclude e @Expose.',
  },
  technical: {
    internals: [
      'plainToInstance(Classe, objeto) cria uma instância da classe e copia as propriedades do objeto para ela, aplicando as transformações declaradas com decorators.',
      '@Transform(({ value }) => ...) recebe o valor original e devolve o valor que ficará na instância. Ele roda antes da validação, então a validação enxerga o valor já ajustado (o título já aparado).',
      '@Type(() => Classe) diz qual classe usar para um campo aninhado ou de array, ou para converter primitivos: @Type(() => Number) transforma "5" em 5, e @Type(() => Date) transforma texto em Date.',
      'Sem decorators, a conversão copia os valores como estão: "5" continua sendo string. Tipos TypeScript (prioridade: number) não influenciam nada.',
      'instanceToPlain faz o caminho inverso, respeitando @Exclude (nunca sai) e @Expose. No Nest, o ClassSerializerInterceptor aplica isso às respostas.',
    ],
    concepts: [
      { term: 'plainToInstance', description: 'Objeto comum → instância da classe, com as transformações aplicadas.' },
      { term: 'instanceToPlain', description: 'Instância → objeto comum, respeitando @Exclude e @Expose.' },
      { term: '@Transform', description: 'Função que ajusta o valor durante a conversão: aparar, normalizar, converter.' },
      { term: '@Type', description: 'Define a classe de campos aninhados e converte primitivos (Number, Date).' },
      { term: '@Exclude / @Expose', description: 'Controlam quais propriedades saem na serialização.' },
      { term: 'Instância x objeto literal', description: 'Só a instância carrega as regras de validação da classe.' },
    ],
    examples: [
      {
        title: 'conversão de tipos e objetos aninhados',
        description: 'Com @Type, um JSON vira uma instância com tipos corretos em todos os níveis.',
        sample: {
          filename: 'aninhados.ts',
          language: 'ts',
          code: `import 'reflect-metadata';
import { plainToInstance, Type } from 'class-transformer';

class ItemDto {
  produto: string;
  @Type(() => Number)
  quantidade: number;
}

class PedidoDto {
  @Type(() => Date)
  entregarEm: Date;
  @Type(() => ItemDto)
  itens: ItemDto[];
}

const json = JSON.parse('{"entregarEm":"2030-01-31","itens":[{"produto":"Mouse","quantidade":"2"}]}');
const pedido = plainToInstance(PedidoDto, json);

console.log(pedido.entregarEm instanceof Date, pedido.entregarEm.getFullYear());
console.log(pedido.itens[0] instanceof ItemDto, typeof pedido.itens[0].quantidade);`,
          lineNotes: [
            { line: '6-7', note: 'Sem @Type, "2" continuaria string, mesmo com o tipo number declarado.' },
            { line: '11-12', note: 'Texto ISO convertido em Date durante a criação da instância.' },
            { line: '13-14', note: 'Cada item do array vira uma instância de ItemDto, com as próprias transformações e regras.' },
            { line: '20-21', note: 'Imprime "true 2030" e "true number".' },
          ],
        },
      },
      {
        title: 'controlar o que sai na resposta',
        description: '@Exclude tira um campo da serialização. É a base para nunca devolver senhas (Módulo 07).',
        sample: {
          filename: 'serializar.ts',
          language: 'ts',
          code: `import 'reflect-metadata';
import { Exclude, instanceToPlain } from 'class-transformer';

class UsuarioResposta {
  id: number;
  email: string;
  @Exclude()
  senhaHash: string;

  constructor(dados: UsuarioResposta) {
    Object.assign(this, dados);
  }
}

const usuario = new UsuarioResposta({ id: 1, email: 'ana@exemplo.com', senhaHash: '$2b$10$abc' });
console.log(instanceToPlain(usuario));`,
          lineNotes: [
            { line: '7-8', note: 'O campo existe na instância, mas nunca é incluído no objeto serializado.' },
            { line: '16', note: 'Imprime { id: 1, email: \'ana@exemplo.com\' }. No Nest, ClassSerializerInterceptor faz isso automaticamente com o que o controller retorna.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Do JSON a uma instância validável',
      steps: [
        { label: 'JSON.parse', detail: 'Um objeto comum, sem classe: instanceof CriarTarefaDto é false.' },
        { label: 'plainToInstance(CriarTarefaDto, objeto)', detail: 'Cria a instância e copia os valores.' },
        { label: '@Transform e @Type rodam', detail: 'O título é aparado; campos aninhados viram instâncias; números e datas são convertidos.' },
        { label: 'validate(instancia)', detail: 'Agora o class-validator encontra as regras da classe e valida os valores já ajustados.' },
        { label: 'No Nest', detail: 'O ValidationPipe faz exatamente esses dois passos antes de chamar o controller (próxima aula).' },
      ],
    },
  ],
  practice: {
    goal:
      'Comprovar por que a validação precisa de uma instância, e normalizar os textos do DTO com @Transform, aparando espaços antes da validação.',
    structure: `tarefas-api/src/
├── transformar.ts
└── tarefas/dto/
    └── criar-tarefa.dto.ts`,
    files: [
      {
        path: 'src/tarefas/dto/criar-tarefa.dto.ts',
        purpose: 'titulo e descricao são aparados antes da validação: "   Oi   " vira "Oi" e falha na regra de 3 caracteres.',
        sample: {
          language: 'ts',
          code: `import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

const aparar = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CriarTarefaDto {
  @Transform(aparar)
  @IsString()
  @Length(3, 80)
  titulo: string;

  @IsOptional()
  @Transform(aparar)
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
            { line: '4', note: 'Uma função reutilizável: só mexe em strings e devolve o resto como está, para a validação recusar depois.' },
            { line: '7', note: '@Transform roda antes da validação. "   " vira "" e falha em @Length(3, 80).' },
            { line: '13', note: 'O mesmo ajuste na descrição. Quando o ValidationPipe estiver ativo, os textos já chegam aparados ao service.' },
          ],
        },
      },
      {
        path: 'src/transformar.ts',
        purpose: 'O mesmo corpo validado de duas formas: como objeto literal e como instância.',
        sample: {
          language: 'ts',
          code: `import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CriarTarefaDto } from './tarefas/dto/criar-tarefa.dto.js';

const corpo: unknown = JSON.parse('{"titulo":"   Oi   ","prioridade":2}');

const literal = corpo as CriarTarefaDto;
console.log('1. objeto literal:', literal instanceof CriarTarefaDto ? 'instância' : 'objeto comum');
const errosLiteral = await validate(literal);
console.log('   erros:', errosLiteral.map((e) => Object.values(e.constraints ?? {})).flat());

const dto = plainToInstance(CriarTarefaDto, corpo);
console.log('2. plainToInstance:', dto instanceof CriarTarefaDto ? 'instância' : 'objeto comum');
console.log('   título depois do @Transform:', JSON.stringify(dto.titulo));
const errosDto = await validate(dto);
console.log('   erros:', errosDto.map((e) => Object.values(e.constraints ?? {})).flat());`,
          lineNotes: [
            { line: '1', note: 'O class-transformer usa reflect-metadata para os decorators.' },
            { line: '8', note: 'as CriarTarefaDto engana o compilador, mas não cria uma instância.' },
            { line: '10', note: 'O class-validator não encontra regras para um objeto sem classe e recusa.' },
            { line: '13', note: 'plainToInstance cria a instância e aplica o @Transform.' },
            { line: '16', note: 'Agora a validação roda de verdade, com o título já aparado.' },
          ],
        },
      },
    ],
    run: ['cd tarefas-api', 'npm run build', 'node dist/transformar.js'],
    verify:
      'Troque o título no JSON por "   Estudar transformações   " e rode de novo: o título sai aparado e a lista de erros fica vazia. Remova o @Transform do título e rode: os espaços voltam e a validação passa a aceitar "   Oi   ".',
    expected: `1. objeto literal: objeto comum
   erros: [ 'an unknown value was passed to the validate function' ]
2. plainToInstance: instância
   título depois do @Transform: "Oi"
   erros: [ 'titulo must be longer than or equal to 3 characters' ]`,
  },
  commonErrors: [
    {
      title: 'Número que chega como texto continua texto',
      symptom: 'Validação de @IsInt falha com "prioridade must be an integer number" para ?prioridade=3, ou comparações numéricas dão errado.',
      cause: 'Valores de query string e de rota são sempre texto, e o class-transformer não converte nada sem instrução.',
      fix: 'Use @Type(() => Number) no campo, ou a opção transform do ValidationPipe (aula de Transform).',
    },
    {
      title: 'Objeto aninhado sem @Type',
      symptom: 'As regras do DTO aninhado nunca rodam; o campo continua um objeto comum.',
      cause: 'Sem @Type(() => Classe), o class-transformer não sabe qual classe instanciar para o campo.',
      fix: 'Adicione @Type(() => ItemDto) e, para validar, @ValidateNested().',
    },
    {
      title: '@Transform que lança exceção',
      symptom: 'Erro 500 com valores inesperados, como value.trim is not a function.',
      cause: 'A função assume que o valor é string, mas o cliente pode enviar qualquer coisa.',
      fix: 'Transforme só o que reconhece e devolva o resto como está, para a validação recusar com 400.',
    },
    {
      title: 'Esquecer o import de reflect-metadata em scripts',
      symptom: 'Decorators como @Type não têm efeito em um script fora do Nest.',
      cause: 'O Nest carrega reflect-metadata automaticamente; um script isolado, não.',
      fix: "Adicione import 'reflect-metadata' no início do script.",
    },
  ],
  guidance: {
    before: ['Class Validator.', 'Módulo 01: JavaScript (objetos e protótipos).'],
    now: ['plainToInstance e instanceToPlain.', '@Transform para normalizar valores.', '@Type para tipos e objetos aninhados.', '@Exclude na saída.'],
    after: ['ValidationPipe: plainToInstance + validate automáticos.', 'Transform: conversão automática de parâmetros.'],
    officialDocs: [
      { label: 'NestJS · Validation (transformação)', url: 'https://docs.nestjs.com/application/validation' },
      { label: 'NestJS · Serialization', url: 'https://docs.nestjs.com/application/serialization' },
      { label: 'class-transformer (repositório oficial)', url: 'https://github.com/typestack/class-transformer' },
    ],
  },
}

export default lesson
