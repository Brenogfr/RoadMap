import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'private e readonly são modificadores do TypeScript. private impede o acesso a um membro de fora da classe; readonly impede que uma propriedade receba outro valor depois de inicializada. Juntos, em private readonly tarefasService, formam a assinatura padrão de toda dependência injetada no Nest.',
    purpose:
      'Deixar explícito, e verificado pelo compilador, o que é detalhe interno da classe e o que nunca deve ser trocado. A dependência injetada é usada só pela própria classe (private) e não pode ser substituída no meio da execução (readonly).',
    problem:
      'Sem modificadores, qualquer código pode ler e alterar as propriedades de um service: trocar a dependência por outra, zerar o array de dados ou depender de um detalhe interno que deveria poder mudar. Bugs assim aparecem longe de onde foram causados.',
    whyExists:
      'Encapsulamento é um princípio básico de orientação a objetos: expor um contrato pequeno (os métodos públicos) e esconder a implementação. O TypeScript traz isso ao JavaScript com checagem em tempo de compilação.',
    whereUsed:
      'Em praticamente toda classe Nest: dependências no construtor (private readonly), estado interno de services (private), configurações fixas (readonly) e, mais adiante, propriedades de DTOs e entidades.',
  },
  technical: {
    internals: [
      'private, protected, public e readonly são verificados só pelo compilador. No JavaScript gerado eles desaparecem: em tempo de execução, uma propriedade private é uma propriedade comum, visível em console.log e acessível por quem ignorar os tipos.',
      'Para privacidade real em tempo de execução, o JavaScript tem os campos #privados (#codigo). Eles não aparecem em Object.keys nem em JSON.stringify, e acessá-los de fora é erro de sintaxe. No Nest, o costume é usar private, que basta para a disciplina de código.',
      'readonly impede reatribuir a propriedade, não alterar o conteúdo. Um readonly itens: string[] não pode receber outro array, mas aceita itens.push(). Para impedir mutação do conteúdo, use tipos como readonly string[] (ReadonlyArray).',
      'Em dependências injetadas, readonly protege contra um erro sutil: this.tarefasService = outraCoisa dentro de um método trocaria a dependência para todas as requisições seguintes, porque o controller é singleton.',
      'protected permite acesso na própria classe e nas subclasses. public é o padrão e raramente é escrito, exceto em parameter properties (public readonly nome).',
    ],
    concepts: [
      { term: 'private', description: 'Acessível só dentro da classe. Erro TS2341 ao acessar de fora.' },
      { term: 'readonly', description: 'Atribuído uma vez (na declaração ou no construtor). Erro TS2540 ao reatribuir.' },
      { term: 'protected', description: 'Acessível na classe e em subclasses.' },
      { term: '#campo', description: 'Privacidade do próprio JavaScript, garantida também em tempo de execução.' },
      { term: 'readonly T[]', description: 'Tipo de array sem métodos que alteram o conteúdo (push, splice).' },
      { term: 'Encapsulamento', description: 'Expor um contrato pequeno e esconder a implementação.' },
    ],
    examples: [
      {
        title: 'o que cada modificador garante',
        description: 'As linhas marcadas com ERRO não compilam. As demais mostram o que acontece em tempo de execução.',
        sample: {
          filename: 'src/demonstrar-modificadores.ts',
          language: 'ts',
          code: `class Cofre {
  private saldo = 100;
  #codigo = 'abc';
  readonly itens: string[] = [];

  constructor(private readonly dono: string) {}

  tamanhoDoCodigo(): number {
    return this.#codigo.length;
  }
}

const cofre = new Cofre('ana');
// cofre.saldo = 0;      ERRO TS2341: Property 'saldo' is private
// cofre.itens = [];     ERRO TS2540: Cannot assign to 'itens' because it is a read-only property

cofre.itens.push('relógio');
console.log(cofre);
console.log(Object.keys(cofre));
console.log(JSON.stringify(cofre));`,
          lineNotes: [
            { line: '2', note: 'private: o compilador recusa cofre.saldo fora da classe.' },
            { line: '3', note: '#codigo: privado também em tempo de execução. Só métodos da classe o enxergam.' },
            { line: '4', note: 'readonly no array: a propriedade não pode apontar para outro array.' },
            { line: '6', note: 'Parameter property com dois modificadores, como nas dependências do Nest.' },
            { line: '17', note: 'Compila e funciona: readonly não congela o conteúdo do array.' },
            { line: '18-20', note: 'saldo e dono aparecem: private é só do compilador. #codigo não aparece em nenhum dos três.' },
          ],
        },
      },
      {
        title: 'um service que entrega o próprio array',
        description: 'Mesmo com private, devolver a referência interna permite que quem chama altere o estado do service.',
        sample: {
          filename: 'vazamento.ts',
          language: 'ts',
          code: `class TarefasService {
  private tarefas = [{ id: 1, titulo: 'Estudar', concluida: false }];

  listar() {
    return this.tarefas;
  }

  listarSeguro(): readonly { id: number; titulo: string; concluida: boolean }[] {
    return this.tarefas.map((t) => ({ ...t }));
  }
}

const service = new TarefasService();
service.listar().length = 0;
console.log('depois do vazamento:', service.listar().length);`,
          lineNotes: [
            { line: '2', note: 'private protege a propriedade, não o objeto para o qual ela aponta.' },
            { line: '5', note: 'Devolve a referência ao array interno. Quem recebe pode esvaziá-lo, reordená-lo ou alterar tarefas.' },
            { line: '8-9', note: 'readonly no tipo impede push e length = 0 em tempo de compilação; as cópias impedem que alterações nos objetos voltem para o service.' },
            { line: '14-15', note: 'Imprime 0: um código qualquer apagou os dados do service.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Onde cada proteção atua',
      steps: [
        { label: 'Você escreve private readonly', detail: 'O editor e o tsc passam a recusar acessos de fora e reatribuições.' },
        { label: 'O tsc compila', detail: 'private, protected e readonly são apagados. Fica uma propriedade comum.' },
        { label: 'Em tempo de execução', detail: 'Só #campos continuam privados. O resto é acessível para quem ignorar os tipos (any, JavaScript puro).' },
        { label: 'Na prática', detail: 'Os modificadores protegem contra erros da equipe, não contra código malicioso. Segurança de verdade é outro assunto (Módulo 07).' },
      ],
    },
  ],
  practice: {
    goal: 'Comprovar o que private, readonly e #campos garantem, e corrigir o TarefasService para não entregar seu array interno.',
    structure: `tarefas-api/src/
├── demonstrar-modificadores.ts
└── tarefas/
    └── tarefas.service.ts`,
    files: [
      {
        path: 'src/demonstrar-modificadores.ts',
        purpose: 'O exemplo da seção B. Descomente as linhas com ERRO, uma de cada vez, e rode npm run build para ver o compilador recusar.',
        sample: {
          language: 'ts',
          code: `class Cofre {
  private saldo = 100;
  #codigo = 'abc';
  readonly itens: string[] = [];

  constructor(private readonly dono: string) {}

  tamanhoDoCodigo(): number {
    return this.#codigo.length;
  }
}

const cofre = new Cofre('ana');
// cofre.saldo = 0;      ERRO TS2341: Property 'saldo' is private
// cofre.itens = [];     ERRO TS2540: Cannot assign to 'itens' because it is a read-only property

cofre.itens.push('relógio');
console.log(cofre);
console.log(Object.keys(cofre));
console.log(JSON.stringify(cofre));`,
        },
      },
      {
        path: 'src/tarefas/tarefas.service.ts',
        purpose: 'Só listar muda: o tipo de retorno passa a ser readonly e o método devolve cópias. O resto é igual ao da aula de Services.',
        sample: {
          language: 'ts',
          code: `import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

export interface Tarefa {
  id: number;
  titulo: string;
  concluida: boolean;
}

const LIMITE_PENDENTES = 5;

@Injectable()
export class TarefasService {
  private tarefas: Tarefa[] = [];
  private proximoId = 1;

  listar(concluida?: boolean): readonly Tarefa[] {
    const filtradas = concluida === undefined ? this.tarefas : this.tarefas.filter((t) => t.concluida === concluida);
    return filtradas.map((t) => ({ ...t }));
  }

  buscarPorId(id: number): Tarefa {
    const tarefa = this.tarefas.find((t) => t.id === id);
    if (!tarefa) throw new NotFoundException('Tarefa ' + id + ' não encontrada');
    return tarefa;
  }

  criar(titulo: string): Tarefa {
    const normalizado = titulo.trim();
    const repetido = this.tarefas.some((t) => t.titulo.toLowerCase() === normalizado.toLowerCase());
    if (repetido) throw new ConflictException('Já existe uma tarefa com o título "' + normalizado + '"');

    const pendentes = this.tarefas.filter((t) => !t.concluida).length;
    if (pendentes >= LIMITE_PENDENTES) {
      throw new ConflictException('Limite de ' + LIMITE_PENDENTES + ' tarefas pendentes atingido. Conclua alguma antes.');
    }

    const tarefa: Tarefa = { id: this.proximoId++, titulo: normalizado, concluida: false };
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
}`,
          lineNotes: [
            { line: '13-14', note: 'Estado interno: private. Não é readonly porque remover reatribui o array.' },
            { line: '16', note: 'readonly Tarefa[] no retorno: quem chama não consegue usar push, splice ou length = 0.' },
            { line: '18', note: 'Cópias dos objetos: alterar uma tarefa recebida não altera a tarefa guardada no service.' },
          ],
        },
      },
    ],
    run: [
      'cd tarefas-api',
      '# Atualize também o retorno de listar no controller para readonly Tarefa[]',
      'npm run build',
      'node dist/demonstrar-modificadores.js',
      'npm run start:dev',
    ],
    httpTests: [
      {
        method: 'GET',
        url: 'http://localhost:3000/tarefas',
        expected: '200 com a lista, como antes. A mudança não altera a API: só protege o estado interno.',
      },
    ],
    expected: `node dist/demonstrar-modificadores.js imprime:
Cofre { dono: 'ana', saldo: 100, itens: [ 'relógio' ] }
[ 'dono', 'saldo', 'itens' ]
{"dono":"ana","saldo":100,"itens":["relógio"]}

#codigo não aparece em nenhuma das três saídas; saldo e dono aparecem.`,
  },
  commonErrors: [
    {
      title: "error TS2341: Property 'x' is private and only accessible within class",
      symptom: 'O build falha ao acessar uma propriedade de outra classe.',
      cause: 'O código depende de um detalhe interno de outra classe.',
      fix: 'Use (ou crie) um método público que exponha o necessário. Contornar com (obj as any).x esconde o acoplamento, não o resolve.',
    },
    {
      title: "error TS2540: Cannot assign to 'x' because it is a read-only property",
      symptom: 'O build falha ao reatribuir uma dependência ou configuração.',
      cause: 'Uma propriedade readonly está sendo trocada depois do construtor.',
      fix: 'Se o valor precisa mudar, ele não deveria ser readonly; se não precisa, remova a atribuição. Dependências injetadas nunca são reatribuídas.',
    },
    {
      title: 'Achar que readonly congela o conteúdo',
      symptom: 'Um array readonly é esvaziado ou alterado por outra parte do código.',
      cause: 'readonly protege a referência, não o objeto ou array referenciado.',
      fix: 'Use readonly T[] ou Readonly<T> nos tipos e devolva cópias ao expor estado interno.',
    },
    {
      title: 'Confiar em private para esconder dados sensíveis',
      symptom: 'Uma senha ou token aparece em logs ou em respostas JSON.',
      cause: 'private some na compilação: console.log e JSON.stringify mostram a propriedade normalmente.',
      fix: 'Não guarde dados sensíveis em objetos que serão logados ou serializados. Monte respostas com só os campos necessários (Módulos 03 e 07).',
    },
  ],
  guidance: {
    before: ['Constructors: parameter properties.', 'Módulo 01: JavaScript (valor x referência).'],
    now: ['private, protected, public e readonly.', 'Proteção em compilação x em execução (#campos).', 'readonly na referência x no conteúdo.'],
    after: ['Providers: outras formas de registrar e injetar dependências.', 'Módulo 09: encapsulamento em módulos e camadas.'],
    officialDocs: [
      { label: 'TypeScript Handbook · Classes (modificadores e readonly)', url: 'https://www.typescriptlang.org/docs/handbook/2/classes.html' },
      { label: 'MDN · Elementos privados (#)', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements' },
    ],
  },
}

export default lesson
