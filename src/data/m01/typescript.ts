import type { Topic } from '../../types/roadmap'

export const typescript: Topic = {
  id: 'm01-typescript',
  title: 'TypeScript',
  summary: 'Tipos estáticos sobre o JavaScript: o que o compilador garante e o que ele não garante.',
  lesson: {
    intro: {
      whatIs:
        'TypeScript é JavaScript com um sistema de tipos verificado antes da execução. Você descreve o formato dos dados (interfaces, tipos, uniões) e o compilador avisa quando o código não respeita esse formato.',
      purpose:
        'Encontrar erros enquanto você escreve, e não em produção; documentar o código pelos próprios tipos; e permitir refatorações seguras. O NestJS é escrito em TypeScript e depende dele para a injeção de dependência e os decorators.',
      problem:
        'Em JavaScript puro, chamar pedido.clinete (com erro de digitação) ou passar uma string onde se esperava um número só falha quando aquela linha roda, talvez em produção. Em uma API com dezenas de arquivos, ninguém lembra o formato de cada objeto.',
      whyExists:
        'Criado pela Microsoft para tornar viável manter bases grandes de JavaScript. Ele não substitui o JavaScript: compila para JavaScript, então roda em qualquer lugar onde o JS roda.',
      whereUsed:
        'NestJS, Prisma, Angular e a maioria das bibliotecas modernas de Node.js. Em back-end, é praticamente o padrão para projetos novos.',
    },
    technical: {
      internals: [
        'O compilador (tsc) analisa o código, verifica os tipos e então apaga todas as anotações. O resultado é JavaScript comum: em tempo de execução não existe nenhum tipo (type erasure).',
        'Por isso, TypeScript não valida dados que chegam de fora (corpo de requisição, JSON, banco). JSON.parse devolve any; se você declarar que é um Produto, o compilador acredita.',
        'A tipagem é estrutural: um objeto é compatível com um tipo se tiver as propriedades exigidas, independentemente do nome da classe ou interface.',
        'O compilador infere tipos sempre que pode: const total = 10 já é number. Anote parâmetros e retornos públicos; deixe a inferência cuidar das variáveis locais.',
        'O Node.js 22.18+ e 23.6+ executa arquivos .ts diretamente, removendo os tipos sem verificá-los (type stripping). A verificação continua sendo papel do tsc ou do editor. Esse modo só aceita sintaxe que pode ser apagada: enum, namespace e parameter properties exigem compilação com tsc.',
      ],
      concepts: [
        {
          term: 'type e interface',
          description: 'Descrevem o formato de objetos. interface pode ser estendida e mesclada; type também representa uniões e outros tipos compostos.',
        },
        {
          term: 'União e literais',
          description: "type Status = 'pendente' | 'pago' aceita apenas esses valores. Substitui enums na maioria dos casos.",
        },
        {
          term: 'Narrowing',
          description: 'Verificações como typeof, if (x) ou in fazem o compilador estreitar o tipo dentro do bloco.',
        },
        {
          term: 'unknown x any',
          description: 'any desliga a verificação. unknown obriga a verificar o tipo antes de usar: é o certo para dados externos.',
        },
        {
          term: 'Genéricos',
          description: 'Tipos com parâmetros, como Array<T> ou Paginado<T>: uma função ou tipo reutilizável para vários formatos.',
        },
        {
          term: 'Utility types',
          description: 'Partial, Pick, Omit, Readonly e Record derivam tipos novos de tipos existentes, sem repetição.',
        },
      ],
      examples: [
        {
          title: 'dados externos com unknown',
          description:
            'O padrão que você vai repetir em toda API: o que vem de fora é unknown até ser validado. Os tipos sozinhos não protegem nada em runtime.',
          sample: {
            filename: 'validar.ts',
            language: 'ts',
            code: `interface NovoProduto {
  nome: string
  preco: number
}

function validarProduto(dados: unknown): NovoProduto {
  if (typeof dados !== 'object' || dados === null) {
    throw new Error('O corpo deve ser um objeto')
  }
  const { nome, preco } = dados as Record<string, unknown>
  if (typeof nome !== 'string' || nome.length < 3) {
    throw new Error('nome deve ter ao menos 3 caracteres')
  }
  if (typeof preco !== 'number' || preco <= 0) {
    throw new Error('preco deve ser um número positivo')
  }
  return { nome, preco }
}

const entrada: unknown = JSON.parse('{"nome":"Mouse","preco":80}')
const produto = validarProduto(entrada)
console.log(produto.nome.toUpperCase(), produto.preco)`,
            lineNotes: [
              { line: '1-4', note: 'O formato que o resto do código espera. Só existe em tempo de compilação.' },
              { line: '6', note: 'Recebe unknown: o compilador não deixa acessar nenhuma propriedade antes de verificar.' },
              { line: '7-9', note: 'typeof null é "object" em JavaScript, por isso a checagem extra de null.' },
              { line: '10', note: 'Record<string, unknown> diz: um objeto com chaves quaisquer e valores ainda desconhecidos.' },
              { line: '11-16', note: 'Cada typeof estreita o tipo. Depois do if, o compilador sabe que nome é string e preco é number.' },
              { line: '17', note: 'O retorno agora é um NovoProduto verificado de verdade, não apenas declarado.' },
              { line: '20-22', note: 'Sem a validação, um JSON com preco: "abc" passaria e quebraria em outro ponto. No Módulo 03 os DTOs fazem isso de forma declarativa.' },
            ],
          },
        },
        {
          title: 'genéricos e utility types',
          description: 'Derivar os tipos de criação e atualização a partir de um tipo base, a mesma ideia dos DTOs no NestJS.',
          sample: {
            filename: 'tipos-derivados.ts',
            language: 'ts',
            code: `interface Produto {
  id: number
  nome: string
  preco: number
  criadoEm: Date
}

type CriarProduto = Omit<Produto, 'id' | 'criadoEm'>
type AtualizarProduto = Partial<CriarProduto>

interface Paginado<T> {
  itens: T[]
  total: number
  pagina: number
}

function paginar<T>(lista: T[], pagina: number, limite: number): Paginado<T> {
  const inicio = (pagina - 1) * limite
  return { itens: lista.slice(inicio, inicio + limite), total: lista.length, pagina }
}

const novo: CriarProduto = { nome: 'Teclado', preco: 150 }
const alteracao: AtualizarProduto = { preco: 140 }
const resultado = paginar([novo], 1, 10)
console.log(resultado.itens[0].nome, alteracao)`,
            lineNotes: [
              { line: '8', note: 'Omit remove id e criadoEm: quem cria um produto não escolhe o id nem a data.' },
              { line: '9', note: 'Partial torna todos os campos opcionais: uma atualização pode mudar só o preço.' },
              { line: '11-15', note: 'T é um parâmetro de tipo. Paginado<Produto> e Paginado<Usuario> reaproveitam a mesma estrutura.' },
              { line: '17-20', note: 'O T da função é inferido pelo argumento. resultado é Paginado<CriarProduto> sem anotação explícita.' },
              { line: '22-23', note: 'Tentar incluir id em novo, ou preco: "140" em alteracao, gera erro de compilação.' },
            ],
          },
        },
      ],
    },
    flows: [
      {
        title: 'Do arquivo .ts à execução',
        steps: [
          { label: 'Você escreve código .ts', detail: 'Com anotações de tipo, interfaces e genéricos.' },
          { label: 'O editor e o tsc verificam os tipos', detail: 'Erros aparecem antes de qualquer execução. É aqui que o TypeScript ajuda.' },
          { label: 'Os tipos são apagados', detail: 'Pelo tsc (gerando .js) ou pelo próprio Node.js (type stripping).' },
          { label: 'O V8 executa JavaScript puro', detail: 'Sem nenhuma informação de tipo.' },
          { label: 'Dados externos chegam', detail: 'Requisições e arquivos não passam pelo compilador: precisam de validação em runtime.' },
        ],
        caption: 'TypeScript protege o código que você escreveu, não os dados que chegam em tempo de execução.',
      },
    ],
    practice: {
      goal: 'Tipar o processamento de pedidos, executá-lo direto com o Node.js e verificar os tipos com o tsc.',
      structure: `pratica-typescript/
├── package.json
├── tsconfig.json
└── src/
    ├── tipos.ts
    └── pedidos.ts`,
      files: [
        {
          path: 'package.json',
          purpose: 'Scripts para executar (start) e verificar tipos (check). O TypeScript é dependência só de desenvolvimento.',
          sample: {
            language: 'json',
            code: `{
  "name": "pratica-typescript",
  "type": "module",
  "scripts": {
    "start": "node src/pedidos.ts",
    "check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.9.0"
  }
}`,
          },
        },
        {
          path: 'tsconfig.json',
          purpose:
            'strict liga todas as verificações importantes. erasableSyntaxOnly garante que o código continua executável pelo Node.js sem compilação.',
          sample: {
            language: 'json',
            code: `{
  "compilerOptions": {
    "target": "es2022",
    "module": "nodenext",
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true
  },
  "include": ["src"]
}`,
          },
        },
        {
          path: 'src/tipos.ts',
          purpose: 'Os tipos do domínio em um arquivo separado.',
          sample: {
            language: 'ts',
            code: `export type StatusPedido = 'pendente' | 'pago' | 'cancelado'

export interface Item {
  produto: string
  preco: number
  qtd: number
}

export interface Pedido {
  id: number
  cliente: string
  status: StatusPedido
  itens: Item[]
  cupom?: string
}`,
          },
        },
        {
          path: 'src/pedidos.ts',
          purpose: 'Uso dos tipos: união de literais, campo opcional, switch e uma função genérica.',
          sample: {
            language: 'ts',
            code: `import type { Pedido, StatusPedido } from './tipos.ts'

const pedidos: Pedido[] = [
  { id: 1, cliente: 'Ana', status: 'pago', itens: [{ produto: 'Teclado', preco: 150, qtd: 1 }] },
  { id: 2, cliente: 'Bruno', status: 'pendente', itens: [{ produto: 'Monitor', preco: 900, qtd: 1 }], cupom: 'DEZ' },
]

function total(pedido: Pedido): number {
  const bruto = pedido.itens.reduce((soma, i) => soma + i.preco * i.qtd, 0)
  return pedido.cupom === 'DEZ' ? bruto * 0.9 : bruto
}

function rotulo(status: StatusPedido): string {
  switch (status) {
    case 'pendente':
      return 'Aguardando pagamento'
    case 'pago':
      return 'Pagamento confirmado'
    case 'cancelado':
      return 'Cancelado'
  }
}

function buscarPorId<T extends { id: number }>(lista: T[], id: number): T | undefined {
  return lista.find((item) => item.id === id)
}

const pedido = buscarPorId(pedidos, 2)
if (pedido) {
  console.log(pedido.cliente, total(pedido), rotulo(pedido.status))
} else {
  console.log('Pedido não encontrado')
}`,
            lineNotes: [
              { line: '1', note: 'import type deixa claro que só tipos são importados; a linha some por completo na execução.' },
              { line: '3', note: 'Pedido[] faz o compilador conferir cada objeto do array.' },
              { line: '8-11', note: 'cupom é opcional (cupom?: string), então pode ser undefined. A comparação com "DEZ" trata os dois casos.' },
              { line: '13-22', note: 'O switch cobre todos os valores da união. Se alguém adicionar "estornado" ao tipo, o compilador acusa que a função pode não retornar string.' },
              { line: '24-26', note: 'T extends { id: number } aceita qualquer tipo com id numérico. O retorno T | undefined lembra que find pode não achar nada.' },
              { line: '29', note: 'Sem esse if, acessar pedido.cliente gera erro: o objeto pode ser undefined.' },
            ],
          },
        },
      ],
      run: ['cd pratica-typescript', 'npm install', 'npm start', 'npm run check'],
      verify:
        'Depois de rodar com sucesso, provoque um erro: troque rotulo(pedido.status) por rotulo("entregue") e rode npm run check. O tsc deve recusar o valor. Rode npm start de novo: o Node.js executa assim mesmo, porque ele só apaga os tipos. Essa diferença é o ponto central da aula.',
      expected: `npm start  →  Bruno 810 Aguardando pagamento
npm run check  →  nenhuma saída (sem erros de tipo)
Com "entregue":
  npm run check  →  error TS2345: Argument of type '"entregue"' is not assignable to parameter of type 'StatusPedido'.
  npm start  →  Bruno 810 undefined (o Node.js executa e o erro só aparece como um valor errado)

Dependendo da versão do Node.js, pode aparecer um aviso ExperimentalWarning sobre type stripping. Ele é informativo.`,
    },
    commonErrors: [
      {
        title: 'Confiar no tipo para dados externos',
        symptom: 'A API aceita um preço "abc" e quebra mais adiante com NaN ou erro no banco.',
        cause: 'Escrever const body = req.body as Produto apenas convence o compilador. Nenhuma verificação acontece em runtime.',
        fix: 'Trate dados externos como unknown e valide antes de usar. No NestJS, isso é feito com DTOs e ValidationPipe (Módulo 03).',
      },
      {
        title: 'Usar any para "fazer o erro sumir"',
        symptom: 'O código compila, mas falha em produção com propriedades undefined.',
        cause: 'any desliga a verificação para aquele valor e para tudo o que deriva dele.',
        fix: 'Use unknown e faça narrowing, ou descreva o tipo correto. Ative strict no tsconfig.',
      },
      {
        title: "'pedido' is possibly 'undefined' (TS18048)",
        symptom: 'Erro ao acessar o resultado de find, de um Map.get ou de um campo opcional.',
        cause: 'O compilador está certo: o valor pode não existir.',
        fix: 'Trate o caso com if, retorno antecipado ou um erro 404. Evite o operador ! (non-null assertion), que só esconde o problema.',
      },
      {
        title: 'ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX ao rodar com node',
        symptom: 'O Node.js recusa o arquivo .ts ao encontrar um enum ou um constructor(private x: X).',
        cause: 'A execução nativa só apaga tipos; enum e parameter properties geram código e precisam de compilação.',
        fix: "Use uniões de literais ou objetos 'as const' no lugar de enum. Em projetos NestJS isso não acontece, porque o código é compilado pelo tsc.",
      },
    ],
    guidance: {
      before: ['JavaScript aprofundado: objetos, funções, closures e módulos.'],
      now: [
        'Tipos primitivos, interfaces, uniões e literais.',
        'Narrowing e unknown.',
        'Genéricos e utility types (Partial, Omit, Pick).',
        'tsconfig com strict.',
      ],
      after: ['Node.js: executar TypeScript no servidor.', 'Módulo 02: classes, modificadores e decorators no NestJS.'],
      officialDocs: [
        { label: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
        { label: 'Handbook · Everyday Types', url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html' },
        { label: 'Handbook · Narrowing', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html' },
        { label: 'Handbook · Object Types', url: 'https://www.typescriptlang.org/docs/handbook/2/objects.html' },
        { label: 'Handbook · More on Functions', url: 'https://www.typescriptlang.org/docs/handbook/2/functions.html' },
        { label: 'tsconfig · strict', url: 'https://www.typescriptlang.org/tsconfig/#strict' },
        { label: 'Node.js · Executando TypeScript nativamente', url: 'https://nodejs.org/en/learn/typescript/run-natively' },
        { label: 'Node.js API · Módulo TypeScript', url: 'https://nodejs.org/api/typescript.html' },
      ],
    },
  },
}
