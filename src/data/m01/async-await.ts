import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'async e await são uma sintaxe sobre Promises. Uma função async sempre devolve uma Promise; dentro dela, await espera uma Promise terminar e entrega o valor (ou lança o erro), permitindo escrever código assíncrono de cima para baixo.',
    purpose:
      'Deixar o fluxo legível: etapas dependentes aparecem uma abaixo da outra, e erros são tratados com o try/catch de sempre. É a forma padrão de escrever services, controllers e repositórios no NestJS.',
    problem:
      'Cadeias longas de then ficam difíceis de ler quando há condições, laços e valores reaproveitados entre etapas. Cada etapa precisa repassar o que a próxima vai usar.',
    whyExists:
      'Padronizado no ES2017. Não adiciona nenhuma capacidade nova: tudo o que async/await faz pode ser escrito com then. Ele existe para legibilidade e para reaproveitar try/catch, if e for no código assíncrono.',
    whereUsed:
      'Em praticamente todo código de back-end moderno: rotas, services, acesso ao banco com Prisma, chamadas a APIs externas, scripts e testes.',
  },
  technical: {
    internals: [
      'Uma função async sempre devolve uma Promise. return valor cumpre essa Promise; um throw a rejeita.',
      'await pausa apenas a função atual, nunca a thread. A função é suspensa e o restante dela é agendado como continuação (microtask) para quando a Promise terminar. Enquanto isso, o event loop atende outros callbacks.',
      'Se a Promise aguardada rejeita, o await lança o erro naquele ponto, como um throw síncrono, e ele pode ser capturado por try/catch.',
      'Cada await em sequência espera o anterior. Operações independentes devem ser iniciadas juntas e aguardadas com Promise.all.',
      'Em módulos ES, await pode ser usado no nível superior do arquivo (top-level await).',
    ],
    concepts: [
      { term: 'async function', description: 'Função que sempre devolve Promise e permite usar await no corpo.' },
      { term: 'await', description: 'Espera a Promise e devolve o valor. Rejeição vira exceção no ponto do await.' },
      { term: 'try/catch/finally', description: 'O tratamento de erros síncrono passa a funcionar para código assíncrono.' },
      { term: 'Sequencial x paralelo', description: 'await em série soma os tempos; Promise.all com await espera o mais lento.' },
      { term: 'return await', description: 'Dentro de try, retornar sem await faz a rejeição escapar do catch daquela função.' },
      { term: 'Top-level await', description: 'await direto no corpo de um módulo ES, sem função async em volta.' },
    ],
    examples: [
      {
        title: 'a mesma lógica de Promises, reescrita',
        description: 'Etapas dependentes em sequência, com um único try/catch para todas.',
        sample: {
          filename: 'resumo.ts',
          language: 'ts',
          code: `interface Usuario {
  id: number
  nome: string
}

const esperar = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

async function buscarUsuario(id: number): Promise<Usuario> {
  await esperar(100)
  if (id !== 1) throw new Error('Usuário ' + id + ' não encontrado')
  return { id, nome: 'Ana' }
}

async function buscarPedidos(usuarioId: number): Promise<number[]> {
  await esperar(150)
  return usuarioId === 1 ? [310, 90] : []
}

async function resumo(id: number): Promise<string> {
  try {
    const usuario = await buscarUsuario(id)
    const pedidos = await buscarPedidos(usuario.id)
    const total = pedidos.reduce((soma, valor) => soma + valor, 0)
    return usuario.nome + ' gastou ' + total
  } catch (erro) {
    return 'Falha: ' + (erro as Error).message
  }
}

console.log(await resumo(1))
console.log(await resumo(2))`,
          lineNotes: [
            { line: '8', note: 'async faz a função devolver Promise<Usuario>, mesmo retornando um objeto comum.' },
            { line: '10', note: 'O throw rejeita a Promise da função. Para quem chama com await, vira uma exceção.' },
            { line: '21-22', note: 'A segunda etapa depende da primeira (precisa do usuario.id), então a sequência é necessária.' },
            { line: '24', note: 'Variáveis das etapas anteriores continuam no escopo: nada de repassar valores de then em then.' },
            { line: '25-27', note: 'O catch captura a rejeição de qualquer await dentro do try.' },
            { line: '30-31', note: 'Top-level await: permitido no corpo de módulos ES.' },
          ],
        },
      },
      {
        title: 'três armadilhas em um arquivo',
        description: 'await dentro de um laço, Promise.all e o forEach que não espera ninguém.',
        sample: {
          filename: 'armadilhas.ts',
          language: 'ts',
          code: `const esperar = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

async function buscarPreco(produtoId: number): Promise<number> {
  await esperar(100)
  return produtoId * 10
}

const ids = [1, 2, 3, 4, 5]

console.time('sequencial')
const sequencial: number[] = []
for (const id of ids) {
  sequencial.push(await buscarPreco(id))
}
console.timeEnd('sequencial')

console.time('paralelo')
const paralelo = await Promise.all(ids.map((id) => buscarPreco(id)))
console.timeEnd('paralelo')

const comForEach: number[] = []
ids.forEach(async (id) => {
  comForEach.push(await buscarPreco(id))
})
console.log('forEach terminou com', comForEach.length, 'itens')
console.log(sequencial, paralelo)`,
          lineNotes: [
            { line: '12-14', note: 'Cada volta espera a anterior: 5 × 100 ms. Correto apenas quando uma iteração depende da outra.' },
            { line: '18', note: 'map cria as cinco Promises de uma vez; Promise.all espera todas: cerca de 100 ms.' },
            { line: '22-24', note: 'forEach chama o callback async e ignora a Promise que ele devolve. Nada espera essas buscas.' },
            { line: '25', note: 'Imprime 0 itens: o forEach "terminou", mas as buscas ainda estão em andamento.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'O que acontece em um await',
      steps: [
        { label: 'A função async executa normalmente', detail: 'Código síncrono roda até encontrar o primeiro await.' },
        { label: 'await recebe uma Promise pendente', detail: 'A função é suspensa e devolve o controle para quem a chamou.' },
        { label: 'O event loop segue livre', detail: 'Outros callbacks, timers e requisições continuam sendo atendidos.' },
        { label: 'A Promise termina', detail: 'A continuação da função é agendada como microtask.' },
        { label: 'A função retoma de onde parou', detail: 'Com o valor da Promise, ou com o erro lançado no ponto do await.' },
        { label: 'return ou throw', detail: 'Cumpre ou rejeita a Promise que a função async devolveu.' },
      ],
    },
  ],
  practice: {
    goal:
      'Uma rota GET /usuarios/:id/resumo que lê dados de um arquivo JSON com async/await, busca pedidos e endereço em paralelo e responde com o status code correto em sucesso, não encontrado e erro.',
    structure: `pratica-async-await/
├── package.json
├── data/
│   └── db.json
└── src/
    ├── repositorio.ts
    └── server.ts`,
    files: [
      {
        path: 'package.json',
        purpose: 'Configuração com watch para reiniciar ao salvar.',
        sample: {
          language: 'json',
          code: `{
  "name": "pratica-async-await",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.ts"
  }
}`,
        },
      },
      {
        path: 'data/db.json',
        purpose: 'Um "banco de dados" em arquivo, para simular I/O real.',
        sample: {
          language: 'json',
          code: `{
  "usuarios": [
    { "id": 1, "nome": "Ana" },
    { "id": 2, "nome": "Bruno" }
  ],
  "pedidos": [
    { "id": 10, "usuarioId": 1, "total": 310 },
    { "id": 11, "usuarioId": 1, "total": 90 },
    { "id": 12, "usuarioId": 2, "total": 900 }
  ],
  "enderecos": [
    { "usuarioId": 1, "cidade": "Recife" },
    { "usuarioId": 2, "cidade": "Curitiba" }
  ]
}`,
        },
      },
      {
        path: 'src/repositorio.ts',
        purpose: 'Funções async de acesso aos dados. Quem usa não sabe (nem precisa saber) que os dados vêm de um arquivo.',
        sample: {
          language: 'ts',
          code: `import { readFile } from 'node:fs/promises'

interface Usuario {
  id: number
  nome: string
}
interface Pedido {
  id: number
  usuarioId: number
  total: number
}
interface Endereco {
  usuarioId: number
  cidade: string
}
interface Banco {
  usuarios: Usuario[]
  pedidos: Pedido[]
  enderecos: Endereco[]
}

async function lerBanco(): Promise<Banco> {
  const texto = await readFile(new URL('../data/db.json', import.meta.url), 'utf8')
  return JSON.parse(texto) as Banco
}

export async function buscarUsuario(id: number): Promise<Usuario | undefined> {
  const banco = await lerBanco()
  return banco.usuarios.find((u) => u.id === id)
}

export async function listarPedidos(usuarioId: number): Promise<Pedido[]> {
  const banco = await lerBanco()
  return banco.pedidos.filter((p) => p.usuarioId === usuarioId)
}

export async function buscarEndereco(usuarioId: number): Promise<Endereco | undefined> {
  const banco = await lerBanco()
  return banco.enderecos.find((e) => e.usuarioId === usuarioId)
}`,
          lineNotes: [
            { line: '23', note: 'import.meta.url aponta para este arquivo. O caminho funciona independentemente da pasta de onde o node foi executado.' },
            { line: '24', note: 'O as Banco é aceitável aqui porque o arquivo é nosso. Para dados de usuários, valide (aula de TypeScript).' },
            { line: '27-30', note: 'Devolve undefined quando não encontra: decidir que isso vira um 404 é papel de quem chama, não do repositório.' },
          ],
        },
      },
      {
        path: 'src/server.ts',
        purpose: 'A rota: dependência sequencial onde é necessária, paralelismo onde é possível, try/catch em volta de tudo.',
        sample: {
          language: 'ts',
          code: `import { createServer, type ServerResponse } from 'node:http'
import { buscarEndereco, buscarUsuario, listarPedidos } from './repositorio.ts'

const PORT = Number(process.env.PORT ?? 3000)

function enviar(res: ServerResponse, status: number, corpo: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(corpo))
}

async function resumoDoUsuario(id: number) {
  const usuario = await buscarUsuario(id)
  if (!usuario) return undefined

  const [pedidos, endereco] = await Promise.all([listarPedidos(id), buscarEndereco(id)])

  return {
    nome: usuario.nome,
    cidade: endereco?.cidade ?? null,
    quantidadePedidos: pedidos.length,
    totalGasto: pedidos.reduce((soma, p) => soma + p.total, 0),
  }
}

const server = createServer(async (req, res) => {
  try {
    const rota = req.url?.match(/^\\/usuarios\\/(\\d+)\\/resumo$/)
    if (req.method !== 'GET' || !rota) {
      return enviar(res, 404, { erro: 'Rota não encontrada' })
    }

    const resumo = await resumoDoUsuario(Number(rota[1]))
    if (!resumo) {
      return enviar(res, 404, { erro: 'Usuário não encontrado' })
    }
    enviar(res, 200, resumo)
  } catch (erro) {
    console.error(erro)
    enviar(res, 500, { erro: 'Erro interno' })
  }
})

server.listen(PORT, () => console.log('Servidor em http://localhost:' + PORT))`,
          lineNotes: [
            { line: '12-13', note: 'Sem usuário não há resumo: a primeira busca precisa terminar antes das outras.' },
            { line: '15', note: 'Pedidos e endereço só dependem do id, então rodam juntos. A desestruturação recebe os resultados na ordem do array.' },
            { line: '19', note: '?. e ?? tratam um usuário sem endereço cadastrado, devolvendo null em vez de quebrar.' },
            { line: '27', note: 'Uma expressão regular extrai o id da URL. Frameworks fazem isso com parâmetros de rota (:id).' },
            { line: '25-41', note: 'O try/catch envolve todo o callback. Sem ele, qualquer erro em um await vira uma rejeição não tratada e derruba o processo.' },
            { line: '38-39', note: 'O erro completo vai para o log; o cliente recebe uma mensagem genérica, sem detalhes internos.' },
          ],
        },
      },
    ],
    run: ['cd pratica-async-await', 'npm run dev'],
    httpTests: [
      {
        method: 'GET',
        url: 'http://localhost:3000/usuarios/1/resumo',
        expected: '200 OK com {"nome":"Ana","cidade":"Recife","quantidadePedidos":2,"totalGasto":400}.',
      },
      { method: 'GET', url: 'http://localhost:3000/usuarios/99/resumo', expected: '404 Not Found com {"erro":"Usuário não encontrado"}.' },
      { method: 'GET', url: 'http://localhost:3000/usuarios/abc/resumo', expected: '404 Not Found com {"erro":"Rota não encontrada"}.' },
      {
        method: 'GET',
        url: 'http://localhost:3000/usuarios/1/resumo',
        expected:
          'Apague uma vírgula do db.json e envie de novo: 500 com {"erro":"Erro interno"}, o SyntaxError aparece no terminal e o servidor continua de pé. Restaure o arquivo depois.',
      },
    ],
    expected: `As três primeiras requisições respondem conforme descrito.
Com o JSON quebrado, o servidor não cai: a falha é registrada e vira um 500.`,
  },
  commonErrors: [
    {
      title: 'Esquecer o await',
      symptom: 'Aparece Promise { <pending> } no log, ou um if (usuario) é sempre verdadeiro mesmo sem usuário.',
      cause: 'Sem await, a variável guarda a Promise, não o valor. Uma Promise é um objeto, e objetos são truthy.',
      fix: 'Use await em toda chamada async cujo resultado você usa. Com TypeScript, ative a regra @typescript-eslint/no-floating-promises no ESLint.',
    },
    {
      title: 'async dentro de forEach',
      symptom: 'O código depois do forEach roda antes das operações terminarem; listas saem vazias ou incompletas.',
      cause: 'forEach não espera as Promises devolvidas pelo callback.',
      fix: 'Use for...of com await quando a ordem importa, ou await Promise.all(lista.map(...)) para paralelo.',
    },
    {
      title: 'return sem await dentro de try',
      symptom: 'Uma falha não cai no catch da função, embora a chamada esteja dentro do try.',
      cause: 'try { return buscar() } devolve a Promise sem esperar. Quando ela rejeita, a função já saiu do try.',
      fix: 'Dentro de try, escreva return await buscar().',
    },
    {
      title: 'Callback async do servidor sem try/catch',
      symptom: 'Um erro em uma única requisição derruba o processo inteiro.',
      cause: 'O node:http não trata a Promise devolvida pelo callback. Uma rejeição ali é uma rejeição não tratada.',
      fix: 'Envolva o corpo do callback em try/catch e responda 500. Frameworks como o NestJS fazem isso por você com filtros de exceção.',
    },
  ],
  guidance: {
    before: ['Promises: estados, encadeamento e Promise.all.', 'Event Loop: microtasks.'],
    now: ['Funções async e await.', 'try/catch com código assíncrono.', 'Sequencial x paralelo.', 'return await e forEach.'],
    after: ['Tratamento de erros: classes de erro e tratamento central.', 'Módulo 02: services async no NestJS.'],
    officialDocs: [
      { label: 'MDN · async function', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function' },
      { label: 'MDN · await', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await' },
      { label: 'MDN · Promise.all', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all' },
      { label: 'Node.js API · fs/promises', url: 'https://nodejs.org/api/fs.html' },
    ],
  },
}

export default lesson
