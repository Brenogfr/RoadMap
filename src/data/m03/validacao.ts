import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'Validar dados é decidir, para cada informação recebida, se ela pode entrar no sistema. Isso acontece em camadas: o formato (tipos, tamanhos, datas válidas) é conferido pelo DTO; regras que dependem do estado atual (título único, limite de pendentes) são conferidas pelo service.',
    purpose:
      'Colocar cada regra no lugar onde ela tem as informações necessárias. O DTO conhece só a requisição; o service conhece a requisição e o estado salvo. Saber separar as duas é o que impede regras de escaparem em atualizações parciais.',
    problem:
      'Regras colocadas na camada errada falham de formas sutis. Uma regra "prioridade 5 exige prazo" escrita só no DTO funciona na criação, mas um PATCH que envia apenas a prioridade passa, porque o DTO de atualização não sabe que a tarefa salva não tem prazo.',
    whyExists:
      'Dados de entrada são a principal fonte de bugs e de falhas de segurança. Validar em camadas, cada uma com uma responsabilidade clara, é como sistemas grandes mantêm dados consistentes.',
    whereUsed:
      'Em todo cadastro e atualização: listas (etiquetas, itens de pedido), datas (prazos, agendamentos), regras entre campos e regras de negócio. No Módulo 05, o banco de dados acrescenta uma terceira camada: constraints de integridade.',
  },
  technical: {
    internals: [
      'Arrays: @IsArray() confere o tipo, @ArrayMaxSize() o tamanho, e regras com { each: true } valem para cada item. Para arrays de objetos, @ValidateNested({ each: true }) com @Type(() => ItemDto).',
      'Validadores próprios: registerDecorator registra uma regra com nome, mensagem e uma função validate. A regra aparece nos erros como qualquer outra (constraints.dataFutura).',
      '@ValidateIf(condicao) só aplica as regras da propriedade quando a condição é verdadeira. É a ferramenta para regras entre campos que dependem só da requisição.',
      'O DTO de atualização (PartialType) valida só o corpo recebido. Qualquer regra que combine o que veio com o que já está salvo precisa ser conferida no service, que tem acesso ao estado.',
      'Validadores do class-validator não participam da injeção de dependência por padrão. @DataFutura usa Date.now() diretamente; para regras que dependem de serviços (como consultar o banco), use o service.',
    ],
    concepts: [
      { term: 'Validação de formato', description: 'O dado tem o tipo, o tamanho e o formato certos? Responsabilidade do DTO.' },
      { term: 'Regra de negócio', description: 'A operação é permitida no estado atual? Responsabilidade do service.' },
      { term: '{ each: true }', description: 'Aplica a regra a cada item de um array.' },
      { term: 'registerDecorator', description: 'Cria um decorator de validação próprio, como @DataFutura().' },
      { term: '@ValidateIf', description: 'Valida a propriedade só quando uma condição é verdadeira.' },
      { term: '400 x 409', description: 'Formato inválido é 400; conflito com o estado atual é 409.' },
    ],
    examples: [
      {
        title: 'onde cada regra mora',
        description: 'As regras do tarefas-api, classificadas pela informação de que precisam.',
        sample: {
          filename: 'regras.txt',
          language: 'text',
          code: `Regra                                        Precisa de              Onde     Erro
titulo tem de 3 a 80 caracteres              só a requisição         DTO      400
etiquetas: no máximo 5, cada uma até 20      só a requisição         DTO      400
prazo é uma data ISO no futuro               só a requisição         DTO      400
prioridade 5 exige prazo (na criação)        só a requisição         DTO      400
prioridade 5 exige prazo (na atualização)    requisição + estado     service  409
titulo não pode repetir                      requisição + estado     service  409
no máximo N tarefas pendentes                requisição + estado     service  409
tarefa concluída não pode ser concluída      estado                  service  409`,
          lineNotes: [
            { line: '2-5', note: 'Dá para decidir só olhando o corpo: o DTO resolve e responde 400.' },
            { line: '6', note: 'A mesma regra, mas em um PATCH: o prazo pode já estar salvo. Só o service sabe.' },
            { line: '7-9', note: 'Dependem de outras tarefas ou do estado da própria tarefa: service, 409 Conflict.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'PATCH /tarefas/1 com { "prioridade": 5 } em uma tarefa sem prazo',
      steps: [
        { label: 'O ValidationPipe valida o AtualizarTarefaDto', detail: 'prioridade 5 é válida. O @ValidateIf do prazo pede prazo, mas…' },
        { label: '…o Update DTO herdou um @IsOptional implícito', detail: 'Como prazo não veio, as regras dele são puladas. A validação passa.' },
        { label: 'O service busca a tarefa', detail: 'E calcula o resultado final: prioridade 5, prazo null.' },
        { label: 'A regra de negócio é aplicada', detail: 'Prioridade 5 sem prazo não é permitida: ConflictException.' },
        { label: 'Resposta', detail: '409: "A tarefa 1 não tem prazo. Envie o prazo junto com a prioridade 5."' },
      ],
      caption: 'Sem a verificação no service, essa requisição era aceita: o teste da prática mostrou isso antes da correção.',
    },
  ],
  practice: {
    goal:
      'Adicionar etiquetas e prazo às tarefas, com um validador próprio para datas futuras, uma regra entre campos no DTO e a mesma regra conferida no service para atualizações.',
    structure: `tarefas-api/src/
├── comum/
│   └── data-futura.validator.ts
└── tarefas/
    ├── dto/criar-tarefa.dto.ts
    └── tarefas.service.ts`,
    files: [
      {
        path: 'src/comum/data-futura.validator.ts',
        purpose: 'Um decorator de validação próprio, reutilizável em qualquer DTO.',
        sample: {
          language: 'ts',
          code: `import { registerDecorator, type ValidationOptions } from 'class-validator';

export function DataFutura(opcoes?: ValidationOptions) {
  return (objeto: object, propriedade: string) => {
    registerDecorator({
      name: 'dataFutura',
      target: objeto.constructor,
      propertyName: propriedade,
      options: { message: propriedade + ' deve ser uma data no futuro', ...opcoes },
      validator: {
        validate(valor: unknown) {
          return typeof valor === 'string' && new Date(valor).getTime() > Date.now();
        },
      },
    });
  };
}`,
          lineNotes: [
            { line: '3-4', note: 'Uma fábrica de decorator de propriedade, como as do class-validator. Aceita opções, como uma mensagem própria.' },
            { line: '6-8', note: 'O nome da regra (que aparece em constraints) e onde ela se aplica.' },
            { line: '9', note: 'Mensagem padrão em português; quem usa o decorator pode substituí-la.' },
            { line: '11-13', note: 'true = válido. Datas inválidas viram NaN, e NaN > Date.now() é false: também são recusadas.' },
          ],
        },
      },
      {
        path: 'src/tarefas/dto/criar-tarefa.dto.ts',
        purpose: 'Etiquetas (lista de textos) e prazo (data futura, obrigatório para prioridade 5).',
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

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Length(1, 20, { each: true })
  etiquetas?: string[];

  @ValidateIf((dto: CriarTarefaDto) => dto.prioridade === 5 || dto.prazo !== undefined)
  @IsDefined({ message: 'prazo é obrigatório para tarefas de prioridade 5' })
  @IsDateString()
  @DataFutura()
  prazo?: string;
}`,
          lineNotes: [
            { line: '37-42', note: 'Lista opcional de até 5 textos, cada um com 1 a 20 caracteres. each aplica as regras item a item.' },
            { line: '44', note: 'As regras do prazo só valem se a prioridade for 5 ou se o prazo tiver sido enviado.' },
            { line: '45', note: 'Prioridade 5 sem prazo: IsDefined falha, com a mensagem própria.' },
            { line: '46-47', note: 'Se vier, precisa ser uma data ISO e estar no futuro.' },
          ],
        },
      },
      {
        path: 'src/tarefas/tarefas.service.ts',
        purpose: 'O service guarda os campos novos e confere a regra do prazo na atualização, combinando o que veio com o que está salvo.',
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
  etiquetas: string[];
  prazo: string | null;
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
      etiquetas: dados.etiquetas ?? [],
      prazo: dados.prazo ?? null,
      concluida: false,
      criadaEm: this.relogio.agora().toISOString(),
    };
    this.tarefas.push(tarefa);
    return tarefa;
  }

  atualizar(id: number, dados: AtualizarTarefaDto): Tarefa {
    const tarefa = this.buscarPorId(id);
    const prioridadeFinal = dados.prioridade ?? tarefa.prioridade;
    const prazoFinal = dados.prazo ?? tarefa.prazo;
    if (prioridadeFinal === 5 && !prazoFinal) {
      throw new ConflictException('A tarefa ' + id + ' não tem prazo. Envie o prazo junto com a prioridade 5.');
    }
    if (dados.titulo !== undefined) {
      this.garantirTituloUnico(dados.titulo, id);
      tarefa.titulo = dados.titulo;
    }
    if (dados.descricao !== undefined) tarefa.descricao = dados.descricao;
    if (dados.prioridade !== undefined) tarefa.prioridade = dados.prioridade;
    if (dados.etiquetas !== undefined) tarefa.etiquetas = dados.etiquetas;
    if (dados.prazo !== undefined) tarefa.prazo = dados.prazo;
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
            { line: '11-12', note: 'Campos novos na entidade.' },
            { line: '54-55', note: 'Valores padrão: lista vazia e sem prazo.' },
            { line: '65-69', note: 'O resultado final da atualização: o que veio, ou o que já estava salvo. Se for prioridade 5 sem prazo, 409.' },
            { line: '76-77', note: 'Os campos novos seguem a regra de só aplicar o que foi enviado.' },
          ],
        },
      },
    ],
    run: ['cd tarefas-api', 'npm run start:dev'],
    httpTests: [
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Com etiquetas", "etiquetas": ["estudo", "nest"] }`,
        expected: '201 com "etiquetas": ["estudo","nest"] e "prazo": null.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Etiqueta ruim", "etiquetas": ["ok", 42, ""] }`,
        expected: '400 com "each value in etiquetas must be longer than or equal to 1 and shorter than or equal to 20 characters" e "each value in etiquetas must be a string".',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Urgente sem prazo", "prioridade": 5 }`,
        expected: '400 com "prazo é obrigatório para tarefas de prioridade 5" (e as outras regras do prazo).',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Prazo passado", "prazo": "2020-01-01" }`,
        expected: '400 com "prazo deve ser uma data no futuro".',
      },
      {
        method: 'PATCH',
        url: 'http://localhost:3000/tarefas/1',
        body: `{ "prioridade": 5 }`,
        expected: '409 com "A tarefa 1 não tem prazo. Envie o prazo junto com a prioridade 5." Envie com "prazo": "2030-01-01": 200.',
      },
    ],
    expected: `Regras de formato respondem 400 no DTO; regras que dependem do estado respondem 409 no service.
A regra do prazo vale tanto na criação quanto na atualização.`,
  },
  commonErrors: [
    {
      title: 'Regra entre campos que escapa no PATCH',
      symptom: 'Uma combinação proibida é recusada no POST, mas aceita em uma atualização parcial.',
      cause: 'A regra está só no DTO, que não conhece o estado salvo. O Update DTO ainda pula campos ausentes.',
      fix: 'Confira no service o estado resultante (o que veio combinado com o que está salvo).',
    },
    {
      title: '@IsString() em um array',
      symptom: '"etiquetas must be a string" para uma lista de textos válida.',
      cause: 'Sem { each: true }, a regra é aplicada ao array inteiro.',
      fix: 'Use @IsArray() no campo e { each: true } nas regras dos itens.',
    },
    {
      title: 'Validador próprio que lança exceção',
      symptom: 'Erro 500 quando o valor tem um tipo inesperado.',
      cause: 'A função validate assumiu um tipo (por exemplo, chamou valor.getTime() em um texto).',
      fix: 'Confira o tipo antes e devolva false para valores que não reconhece.',
    },
    {
      title: 'Consultar o banco dentro de um validador do DTO',
      symptom: 'Validadores difíceis de testar, com dependências escondidas.',
      cause: 'Regras como "e-mail já cadastrado" dependem do estado e foram colocadas no DTO.',
      fix: 'Deixe essas regras no service, que recebe as dependências por injeção e responde 409.',
    },
  ],
  guidance: {
    before: ['Create DTO e Update DTO.', 'Módulo 02: Services (regras de negócio).', 'Módulo 01: Status Codes (400 x 409).'],
    now: ['Formato x regra de negócio.', 'Arrays e { each: true }.', 'Validadores próprios.', '@ValidateIf e regras entre campos.'],
    after: ['Tratamento de respostas inválidas.', 'Módulo 05: constraints no banco de dados.'],
    officialDocs: [
      { label: 'NestJS · Validation', url: 'https://docs.nestjs.com/application/validation' },
      { label: 'class-validator (decorators e validadores próprios)', url: 'https://github.com/typestack/class-validator' },
    ],
  },
}

export default lesson
