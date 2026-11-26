import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'JavaScript é a linguagem que o Node.js executa. "Aprofundado" aqui significa ir além da sintaxe: entender como valores são guardados na memória, como funções capturam variáveis, como o this é decidido e como organizar código em módulos.',
    purpose:
      'Todo código de back-end que você vai escrever com Node.js e NestJS é JavaScript por baixo, mesmo quando escrito em TypeScript. Dominar a linguagem é o que permite ler qualquer framework sem tratá-lo como mágica.',
    problem:
      'A maior parte dos bugs "misteriosos" em APIs Node vem de detalhes da linguagem: um objeto alterado em um lugar que muda em outro, um this que vira undefined dentro de um callback, um map que devolve undefined. Entender o modelo da linguagem elimina essa classe de bugs.',
    whyExists:
      'JavaScript foi criada para o navegador, com funções como cidadãs de primeira classe e objetos dinâmicos. O Node.js levou essa mesma linguagem para o servidor, então as mesmas regras valem nos dois lugares.',
    whereUsed:
      'Em todo o ecossistema Node.js: APIs REST, NestJS, scripts de automação, CLIs, workers de filas, funções serverless e ferramentas de build.',
  },
  technical: {
    internals: [
      'O motor (V8, no Node.js) compila o JavaScript para código de máquina durante a execução (compilação JIT) e reotimiza trechos que rodam muitas vezes.',
      'Tipos primitivos (string, number, boolean, null, undefined, bigint, symbol) são copiados por valor. Objetos, arrays e funções ficam na memória heap e as variáveis guardam apenas uma referência a eles.',
      'Cada função cria um escopo. Uma função interna continua enxergando as variáveis do escopo onde foi definida, mesmo depois que a função externa terminou: isso é uma closure.',
      'O valor de this não depende de onde a função foi escrita, e sim de como ela foi chamada. Arrow functions não têm this próprio: usam o do escopo ao redor.',
      'Arquivos que usam import/export são módulos ES e rodam automaticamente em modo estrito (strict mode), o que transforma alguns erros silenciosos em exceções.',
    ],
    concepts: [
      {
        term: 'Valor x referência',
        description:
          'Atribuir um objeto a outra variável não o copia: as duas apontam para o mesmo objeto. Alterar por uma altera para a outra.',
      },
      {
        term: 'Escopo léxico e closure',
        description:
          'O escopo é definido pela posição do código. Uma função "fecha" sobre as variáveis visíveis onde foi criada e as mantém vivas.',
      },
      {
        term: 'this',
        description:
          'Definido no momento da chamada: obj.metodo() usa obj como this. Uma função solta, em modo estrito, recebe this como undefined.',
      },
      {
        term: 'Funções de primeira classe',
        description:
          'Funções são valores: podem ser guardadas em variáveis, passadas como argumento (callbacks) e retornadas por outras funções.',
      },
      {
        term: 'Imutabilidade',
        description:
          'Criar novos objetos e arrays em vez de alterar os existentes (spread, map, filter) torna o fluxo de dados previsível.',
      },
      {
        term: 'Módulos ES',
        description:
          'Cada arquivo tem escopo próprio. export expõe valores; import os consome. Nada vaza para o escopo global.',
      },
    ],
    examples: [
      {
        title: 'valor x referência',
        description: 'O bug clássico de alterar um objeto achando que era uma cópia, e as três formas de copiar.',
        sample: {
          filename: 'referencia.js',
          language: 'js',
          code: `const original = { nome: 'Teclado', tags: ['periférico'] }

const copia = original          // copia a REFERÊNCIA, não o objeto
copia.nome = 'Mouse'
console.log(original.nome)      // 'Mouse': é o mesmo objeto

const rasa = { ...original }    // cópia rasa: só o primeiro nível
rasa.tags.push('usb')
console.log(original.tags)      // ['periférico', 'usb']: o array é compartilhado

const profunda = structuredClone(original)
profunda.tags.push('sem fio')
console.log(original.tags)      // ['periférico', 'usb']: intacto`,
          lineNotes: [
            { line: '1', note: 'O objeto é criado no heap; original guarda o endereço dele.' },
            { line: '3-5', note: 'copia recebe o mesmo endereço. Mudar copia.nome muda o único objeto que existe.' },
            { line: '7', note: 'O spread cria um objeto novo, mas copia os valores do primeiro nível. tags é uma referência, então continua apontando para o mesmo array.' },
            { line: '8-9', note: 'Por isso o push em rasa.tags aparece em original.tags.' },
            { line: '11-13', note: 'structuredClone (nativo no Node.js 17+) copia todos os níveis. Agora as alterações não vazam.' },
          ],
        },
      },
      {
        title: 'closure e this',
        description: 'Uma closure guardando estado privado, e o this se perdendo quando um método é passado adiante.',
        sample: {
          filename: 'closure-this.js',
          language: 'js',
          code: `function criarContador() {
  let total = 0                 // só as funções abaixo enxergam total
  return {
    incrementar() { total += 1; return total },
    valor: () => total,
  }
}

const visitas = criarContador()
visitas.incrementar()
visitas.incrementar()
console.log(visitas.valor())    // 2
console.log(visitas.total)      // undefined: não há acesso direto

const servico = {
  nome: 'pedidos',
  log() { return 'serviço: ' + this.nome },
}
const solto = servico.log
console.log(servico.log())      // 'serviço: pedidos'
console.log(solto())            // TypeError: this é undefined`,
          lineNotes: [
            { line: '2', note: 'total é uma variável local de criarContador. Normalmente sumiria quando a função terminasse.' },
            { line: '3-6', note: 'As funções retornadas referenciam total. Enquanto elas existirem, total continua vivo: isso é a closure.' },
            { line: '9-12', note: 'Cada chamada altera o mesmo total. É assim que se cria estado privado sem classes.' },
            { line: '13', note: 'total não é uma propriedade do objeto, então não pode ser lido nem alterado de fora.' },
            { line: '19', note: 'solto recebe só a função, sem o objeto. A ligação com servico se perdeu.' },
            { line: '20', note: 'Chamado como servico.log(), this é servico.' },
            { line: '21', note: 'Chamado sozinho, em modo estrito (padrão em módulos ES), this é undefined e ler this.nome lança TypeError. Acontece ao passar métodos como callback.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Como uma closure mantém estado',
      steps: [
        { label: 'criarContador() é chamada', detail: 'O motor cria um novo escopo para essa execução, com total = 0.' },
        { label: 'As funções internas são criadas', detail: 'incrementar e valor guardam uma referência ao escopo onde nasceram.' },
        { label: 'criarContador() retorna', detail: 'A execução termina, mas o escopo não é descartado: ainda há funções apontando para ele.' },
        { label: 'visitas.incrementar() é chamada', detail: 'A função lê e altera total no escopo guardado.' },
        { label: 'Coleta de lixo', detail: 'Quando nada mais referencia visitas, o escopo e o total são liberados da memória.' },
      ],
      caption: 'Cada chamada de criarContador() cria um escopo novo: dois contadores nunca compartilham o mesmo total.',
    },
  ],
  practice: {
    goal: 'Processar uma lista de pedidos com funções puras, closures e métodos de array, sem alterar os dados originais.',
    structure: `pratica-javascript/
├── package.json
└── src/
    ├── dados.js
    └── pedidos.js`,
    files: [
      {
        path: 'package.json',
        purpose: '"type": "module" faz o Node.js tratar os arquivos .js como módulos ES, permitindo import/export.',
        sample: {
          language: 'json',
          code: `{
  "name": "pratica-javascript",
  "type": "module"
}`,
        },
      },
      {
        path: 'src/dados.js',
        purpose: 'Os dados de entrada, exportados como módulo.',
        sample: {
          language: 'js',
          code: `export const pedidos = [
  {
    id: 1,
    cliente: 'Ana',
    status: 'pago',
    itens: [
      { produto: 'Teclado', preco: 150, qtd: 1 },
      { produto: 'Mouse', preco: 80, qtd: 2 },
    ],
  },
  { id: 2, cliente: 'Bruno', status: 'pendente', itens: [{ produto: 'Monitor', preco: 900, qtd: 1 }] },
  { id: 3, cliente: 'Ana', status: 'pago', itens: [{ produto: 'Cabo HDMI', preco: 30, qtd: 3 }] },
]`,
        },
      },
      {
        path: 'src/pedidos.js',
        purpose: 'O processamento: cada bloco usa um conceito da aula.',
        sample: {
          language: 'js',
          code: `import { pedidos } from './dados.js'

// Função pura: mesma entrada, mesma saída, sem efeitos colaterais
const totalDoPedido = (pedido) =>
  pedido.itens.reduce((soma, item) => soma + item.preco * item.qtd, 0)

// Closure: a função retornada lembra de "taxa"
function criarCalculadoraDeFrete(taxa) {
  return (valor) => (valor >= 300 ? 0 : taxa)
}
const frete = criarCalculadoraDeFrete(25)

// filter + map: novos arrays, o original não muda
const resumo = pedidos
  .filter((p) => p.status === 'pago')
  .map((p) => {
    const total = totalDoPedido(p)
    return { id: p.id, cliente: p.cliente, total, frete: frete(total) }
  })

// reduce: agrupar o total por cliente
const porCliente = resumo.reduce((acc, { cliente, total }) => {
  acc[cliente] = (acc[cliente] ?? 0) + total
  return acc
}, {})

// Spread: uma cópia com alteração, sem mutar o pedido original
const atualizado = { ...pedidos[1], status: 'pago' }

console.log(resumo)
console.log(porCliente)
console.log(pedidos[1].status, '->', atualizado.status)`,
          lineNotes: [
            { line: '1', note: 'Import de um módulo local. Em módulos ES a extensão .js é obrigatória.' },
            { line: '4-5', note: 'reduce percorre os itens acumulando preço × quantidade, começando em 0.' },
            { line: '8-11', note: 'criarCalculadoraDeFrete devolve uma função que guarda taxa. frete agora é uma função configurada.' },
            { line: '14-19', note: 'filter mantém só os pagos; map transforma cada pedido em um objeto de resumo novo, sem alterar o pedido original.' },
            { line: '22-25', note: 'O acumulador começa como {}. ?? 0 trata o primeiro valor de cada cliente.' },
            { line: '28', note: 'Spread cria um pedido novo com status alterado. pedidos[1] continua "pendente".' },
          ],
        },
      },
    ],
    run: ['cd pratica-javascript', 'node src/pedidos.js'],
    verify: 'Confira no terminal que o pedido pendente não aparece no resumo e que pedidos[1] continua "pendente" depois da cópia.',
    expected: `[
  { id: 1, cliente: 'Ana', total: 310, frete: 0 },
  { id: 3, cliente: 'Ana', total: 90, frete: 25 }
]
{ Ana: 400 }
pendente -> pago`,
  },
  commonErrors: [
    {
      title: 'Mutação acidental de um objeto compartilhado',
      symptom: 'Um dado muda "sozinho" em outra parte do código, ou um teste passa isolado e falha junto com outros.',
      cause: 'Atribuição e spread copiam referências. Alterar o objeto recebido por parâmetro altera o original de quem chamou.',
      fix: 'Não altere parâmetros. Crie objetos novos com spread (cópia rasa) ou structuredClone (cópia profunda) quando houver objetos aninhados.',
    },
    {
      title: 'this undefined ao passar um método como callback',
      symptom: 'TypeError: Cannot read properties of undefined (reading \'nome\').',
      cause: 'Passar servico.log como argumento entrega só a função, sem o objeto. Na chamada, this vira undefined.',
      fix: 'Passe uma arrow function: () => servico.log(). Ou fixe o this com servico.log.bind(servico).',
    },
    {
      title: 'map que devolve undefined',
      symptom: 'O array resultante sai como [undefined, undefined, ...].',
      cause: 'Arrow function com chaves { } precisa de return explícito. p => { id: p.id } é interpretado como um bloco, não como objeto.',
      fix: 'Use return dentro das chaves, ou envolva o objeto em parênteses: p => ({ id: p.id }).',
    },
    {
      title: 'Comparar objetos com ===',
      symptom: '{ id: 1 } === { id: 1 } é false; includes e indexOf não encontram um objeto "igual".',
      cause: '=== compara referências para objetos, não o conteúdo.',
      fix: 'Compare por um campo identificador: lista.some(p => p.id === alvo.id).',
    },
  ],
  guidance: {
    before: ['Lógica de programação: variáveis, condicionais, laços e funções.', 'Noções básicas de terminal.'],
    now: [
      'Valor x referência e cópias rasas/profundas.',
      'Escopo, closures e this.',
      'map, filter, reduce, find, some.',
      'Desestruturação, spread e módulos ES.',
    ],
    after: ['TypeScript: os mesmos conceitos com tipos.', 'Node.js: a linguagem fora do navegador.'],
    officialDocs: [
      { label: 'MDN · Guia de JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
      { label: 'MDN · Closures', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures' },
      { label: 'MDN · this', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this' },
      { label: 'MDN · Trabalhando com objetos', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects' },
      { label: 'MDN · Módulos JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules' },
      { label: 'MDN · Desestruturação', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring' },
      { label: 'MDN · Spread syntax', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax' },
    ],
    complementary: [
      { label: 'Especificação ECMAScript (TC39)', url: 'https://tc39.es/ecma262/' },
    ],
  },
}

export default lesson
