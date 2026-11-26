import type { Topic } from '../../types/roadmap'

export const errorHandling: Topic = {
  id: 'm01-error-handling',
  title: 'Tratamento de erros',
  summary: 'Erros operacionais x bugs, classes de erro, cause, tratamento centralizado e o que nunca expor ao cliente.',
  lesson: {
    intro: {
      whatIs:
        'Tratar erros é decidir, para cada falha possível, quem é responsável por ela e o que deve acontecer: responder ao cliente com uma mensagem útil, tentar de novo, registrar no log ou encerrar o processo.',
      purpose:
        'Uma API confiável falha de forma previsível: o cliente recebe um status code e uma mensagem coerentes, a equipe recebe um log com contexto suficiente para investigar, e uma falha em uma requisição não derruba as outras.',
      problem:
        'Sem uma estratégia, os erros são engolidos em catch vazios (a falha some), vazam stack traces para o cliente (risco de segurança), viram 500 genéricos para tudo (o cliente não sabe o que corrigir) ou derrubam o processo inteiro.',
      whyExists:
        'Falhas são parte normal de um sistema distribuído: dados inválidos, recursos inexistentes, banco fora do ar, timeouts. O mecanismo de exceções (throw/try/catch) existe para separar o caminho feliz do caminho de erro.',
      whereUsed:
        'Em toda camada de uma API: validação na entrada, regras de negócio nos services, falhas de infraestrutura nos repositórios, e um tratador central que transforma erros em respostas HTTP. No NestJS, esse tratador central são os exception filters.',
    },
    technical: {
      internals: [
        'throw interrompe a função na hora. O erro sobe pela call stack, função por função, até encontrar um catch. Se ninguém tratar, o Node.js encerra o processo.',
        'Em código assíncrono, a falha viaja como rejeição de Promise. Ela só é capturada por try/catch se houver await, ou por um .catch() na cadeia.',
        'Erros operacionais são previstos (entrada inválida, recurso inexistente, serviço fora do ar) e devem virar respostas adequadas. Erros de programação são bugs (undefined is not a function) e devem ser corrigidos, não tratados.',
        'Subclasses de Error carregam informação extra (status code, campos inválidos) e permitem decidir o tratamento com instanceof.',
        'A opção { cause } (Node.js 16.9+) encadeia o erro original ao novo. Você adiciona contexto sem perder a causa raiz.',
        'Depois de um uncaughtException o processo está em estado desconhecido. A prática recomendada é registrar o erro e encerrar, deixando o gerenciador de processos reiniciar a aplicação.',
      ],
      concepts: [
        { term: 'Error', description: 'Objeto com name, message e stack. Sempre lance instâncias de Error, nunca strings.' },
        { term: 'Erro operacional', description: 'Falha prevista do ambiente ou da entrada. Vira uma resposta 4xx ou 5xx coerente.' },
        { term: 'Erro de programação', description: 'Bug no código. Deve ser registrado e corrigido, não "tratado" e escondido.' },
        { term: 'Classe de erro', description: 'class NaoEncontradoError extends Error: um tipo para cada situação que exige tratamento diferente.' },
        { term: 'cause', description: 'new Error("contexto", { cause: erroOriginal }) preserva a causa raiz.' },
        { term: 'Tratador central', description: 'Um único ponto que converte qualquer erro em resposta HTTP, em vez de repetir try/catch em cada rota.' },
      ],
      examples: [
        {
          title: 'classes de erro e cause',
          description: 'Cada classe representa uma situação diferente, e instanceof decide o tratamento.',
          sample: {
            filename: 'classes.ts',
            language: 'ts',
            code: `class NaoEncontradoError extends Error {
  constructor(recurso: string, id: number) {
    super(recurso + ' ' + id + ' não encontrado')
    this.name = 'NaoEncontradoError'
  }
}

class ValidacaoError extends Error {
  readonly campos: string[]

  constructor(campos: string[]) {
    super('Dados inválidos: ' + campos.join(', '))
    this.name = 'ValidacaoError'
    this.campos = campos
  }
}

function lerConfig(texto: string) {
  try {
    return JSON.parse(texto)
  } catch (erro) {
    throw new Error('Arquivo de configuração inválido', { cause: erro })
  }
}

const tarefas = [
  () => { throw new NaoEncontradoError('Produto', 7) },
  () => { throw new ValidacaoError(['nome', 'preco']) },
  () => lerConfig('{ porta: 3000 }'),
]

for (const tarefa of tarefas) {
  try {
    tarefa()
  } catch (erro) {
    if (erro instanceof NaoEncontradoError) console.log('404 →', erro.message)
    else if (erro instanceof ValidacaoError) console.log('400 →', erro.campos)
    else if (erro instanceof Error) console.log('500 →', erro.message, '| causa:', (erro.cause as Error).message)
  }
}`,
            lineNotes: [
              { line: '3', note: 'super(mensagem) inicializa message e captura o stack trace.' },
              { line: '4', note: 'Definir name faz o tipo do erro aparecer nos logs, em vez de um genérico "Error".' },
              { line: '9', note: 'Campos extras carregam o que o tratador vai precisar: aqui, quais campos estão inválidos.' },
              { line: '22', note: 'O SyntaxError do JSON.parse fica guardado em cause, e a mensagem nova diz o que estava acontecendo.' },
              { line: '36-38', note: 'Do mais específico para o mais genérico. Um bloco de decisão como este é a base do tratador central.' },
            ],
          },
        },
        {
          title: 'engolir, lançar string, relançar',
          description: 'Dois antipadrões comuns e a forma correta: tratar só o que você sabe resolver.',
          sample: {
            filename: 'antipadroes.ts',
            language: 'ts',
            code: `let tentativas = 0
async function gravar(dados: object): Promise<void> {
  tentativas++
  if (tentativas === 1) throw new Error('timeout ao gravar')
  console.log('gravado na tentativa', tentativas, dados)
}

// Ruim: engolir o erro. A falha desaparece e ninguém fica sabendo.
async function salvarEngolindo(dados: object) {
  try {
    await gravar(dados)
  } catch {
    // vazio
  }
}

// Ruim: lançar string. Não há stack trace nem instanceof.
function validarComString(preco: number) {
  if (preco < 0) throw 'preço negativo'
}

// Bom: tratar apenas o que se sabe resolver e relançar o resto.
async function salvar(dados: object) {
  try {
    await gravar(dados)
  } catch (erro) {
    if (erro instanceof Error && erro.message.startsWith('timeout')) {
      return await gravar(dados)
    }
    throw erro
  }
}

await salvarEngolindo({ id: 1 })
await salvar({ id: 2 })
try {
  validarComString(-1)
} catch (erro) {
  console.log(typeof erro, erro instanceof Error)
}`,
            lineNotes: [
              { line: '1-6', note: 'Um gravador falso que falha na primeira chamada com timeout.' },
              { line: '12-14', note: 'O catch vazio faz a primeira gravação falhar em silêncio. Nada no log, nenhum erro para quem chamou.' },
              { line: '19', note: 'Uma string lançada não tem stack, então você não sabe de onde ela veio.' },
              { line: '27-29', note: 'Timeout é uma falha transitória: tentar de novo faz sentido. return await mantém a nova tentativa dentro do try.' },
              { line: '30', note: 'Qualquer outro erro sobe para quem chamou. Quem não sabe resolver, não esconde.' },
              { line: '34', note: 'A tentativa 1 falha e some. A tentativa 2 vem da chamada seguinte.' },
              { line: '39', note: 'Imprime "string false".' },
            ],
          },
        },
      ],
    },
    flows: [
      {
        title: 'Caminho de um erro até a resposta',
        steps: [
          { label: 'Uma regra é violada', detail: 'O service lança NaoEncontradoError, ou o repositório falha ao acessar o banco.' },
          { label: 'O erro sobe pela pilha', detail: 'As funções intermediárias não tratam o que não sabem resolver: a falha passa direto por elas.' },
          { label: 'Rejeição chega ao tratador central', detail: 'Um único ponto recebe qualquer erro da requisição.' },
          { label: 'Classificação', detail: 'Erros conhecidos (HttpError e subclasses) definem o status. Qualquer outro é inesperado.' },
          { label: 'Registro', detail: 'Erros inesperados vão para o log com stack e cause, para investigação.' },
          { label: 'Resposta ao cliente', detail: '4xx com mensagem útil, ou 500 com mensagem genérica, sem detalhes internos.' },
        ],
      },
    ],
    practice: {
      goal:
        'Uma API de produtos com classes de erro, validação e um tratador central: rotas e regras de negócio apenas lançam erros, e um único ponto decide a resposta.',
      structure: `pratica-erros/
├── package.json
└── src/
    ├── erros.ts
    ├── produtos.ts
    └── server.ts`,
      files: [
        {
          path: 'package.json',
          purpose: 'Configuração com watch.',
          sample: {
            language: 'json',
            code: `{
  "name": "pratica-erros",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.ts"
  }
}`,
          },
        },
        {
          path: 'src/erros.ts',
          purpose: 'A hierarquia de erros HTTP. O status code faz parte do erro, e não de cada rota.',
          sample: {
            language: 'ts',
            code: `export class HttpError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, mensagem: string, options?: ErrorOptions) {
    super(mensagem, options)
    this.name = 'HttpError'
    this.statusCode = statusCode
  }
}

export class NaoEncontradoError extends HttpError {
  constructor(mensagem: string) {
    super(404, mensagem)
    this.name = 'NaoEncontradoError'
  }
}

export class ValidacaoError extends HttpError {
  readonly detalhes: string[]

  constructor(detalhes: string[]) {
    super(400, 'Dados inválidos')
    this.name = 'ValidacaoError'
    this.detalhes = detalhes
  }
}`,
            lineNotes: [
              { line: '2', note: 'readonly: o status não muda depois de criado.' },
              { line: '4', note: 'ErrorOptions é o tipo nativo de { cause }. Repassá-lo ao super preserva a causa original.' },
              { line: '11-16', note: 'Subclasses fixam o status. Quem lança só descreve o problema.' },
              { line: '19', note: 'A lista de problemas de validação vai na resposta, para o cliente saber o que corrigir.' },
            ],
          },
        },
        {
          path: 'src/produtos.ts',
          purpose: 'Regras de negócio. Não conhecem HTTP além das classes de erro: não enviam respostas.',
          sample: {
            language: 'ts',
            code: `import { NaoEncontradoError, ValidacaoError } from './erros.ts'

interface Produto {
  id: number
  nome: string
  preco: number
}

const produtos: Produto[] = [{ id: 1, nome: 'Teclado', preco: 150 }]

export function buscarProduto(id: number): Produto {
  const produto = produtos.find((p) => p.id === id)
  if (!produto) throw new NaoEncontradoError('Produto ' + id + ' não encontrado')
  return produto
}

export function criarProduto(dados: unknown): Produto {
  const { nome, preco } = (dados ?? {}) as Record<string, unknown>
  const problemas: string[] = []
  if (typeof nome !== 'string' || nome.trim().length < 3) problemas.push('nome deve ter ao menos 3 caracteres')
  if (typeof preco !== 'number' || preco <= 0) problemas.push('preco deve ser um número positivo')

  if (problemas.length > 0 || typeof nome !== 'string' || typeof preco !== 'number') {
    throw new ValidacaoError(problemas)
  }

  const produto = { id: produtos.length + 1, nome: nome.trim(), preco }
  produtos.push(produto)
  return produto
}`,
            lineNotes: [
              { line: '13', note: 'Lança em vez de devolver null: quem chama não precisa lembrar de verificar.' },
              { line: '19-21', note: 'Junta todos os problemas antes de lançar. O cliente corrige tudo de uma vez, em vez de um campo por tentativa.' },
              { line: '23', note: 'Os typeof repetidos fazem o TypeScript estreitar nome e preco para os tipos certos, sem precisar de as.' },
            ],
          },
        },
        {
          path: 'src/server.ts',
          purpose: 'Roteamento sem nenhum try/catch espalhado, e um tratador central para todos os erros.',
          sample: {
            language: 'ts',
            code: `import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { HttpError, ValidacaoError } from './erros.ts'
import { buscarProduto, criarProduto } from './produtos.ts'

const PORT = Number(process.env.PORT ?? 3000)

async function lerJson(req: IncomingMessage): Promise<unknown> {
  const partes: Buffer[] = []
  for await (const parte of req) partes.push(parte as Buffer)
  try {
    return JSON.parse(Buffer.concat(partes).toString('utf8'))
  } catch (erro) {
    throw new HttpError(400, 'Corpo da requisição não é um JSON válido', { cause: erro })
  }
}

function enviar(res: ServerResponse, status: number, corpo: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(corpo))
}

async function rotear(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const idNaRota = url.pathname.match(/^\\/produtos\\/(\\d+)$/)

  if (req.method === 'GET' && idNaRota) {
    return enviar(res, 200, buscarProduto(Number(idNaRota[1])))
  }
  if (req.method === 'POST' && url.pathname === '/produtos') {
    return enviar(res, 201, criarProduto(await lerJson(req)))
  }
  if (url.pathname === '/quebrar') {
    throw new TypeError('Falha inesperada simulada')
  }
  throw new HttpError(404, 'Rota não encontrada')
}

function tratarErro(erro: unknown, res: ServerResponse) {
  if (erro instanceof ValidacaoError) {
    return enviar(res, erro.statusCode, { erro: erro.message, detalhes: erro.detalhes })
  }
  if (erro instanceof HttpError) {
    return enviar(res, erro.statusCode, { erro: erro.message })
  }
  console.error('Erro inesperado:', erro)
  enviar(res, 500, { erro: 'Erro interno do servidor' })
}

const server = createServer((req, res) => {
  rotear(req, res).catch((erro) => tratarErro(erro, res))
})

process.on('unhandledRejection', (motivo) => {
  console.error('Rejeição não tratada:', motivo)
  process.exit(1)
})

server.listen(PORT, () => console.log('Servidor em http://localhost:' + PORT))`,
            lineNotes: [
              { line: '7-9', note: 'O corpo chega em pedaços (stream). for await lê todos, e Buffer.concat junta sem corromper caracteres acentuados.' },
              { line: '12-14', note: 'JSON inválido é culpa do cliente: vira 400, e o SyntaxError original fica em cause.' },
              { line: '22-36', note: 'As rotas apenas fazem o trabalho ou lançam erros. Nenhuma decide como um erro vira resposta.' },
              { line: '32-34', note: 'Uma rota para simular um bug e ver o caminho do erro inesperado.' },
              { line: '39-41', note: 'ValidacaoError vem antes de HttpError porque é uma subclasse: a verificação mais específica primeiro.' },
              { line: '45-46', note: 'Erros inesperados: detalhes no log, mensagem genérica para o cliente.' },
              { line: '50', note: 'Toda rejeição de rotear chega ao tratador. É a versão manual do que o NestJS faz com exception filters.' },
              { line: '53-56', note: 'Rede de segurança para rejeições que escaparam: registra e encerra, em vez de seguir em estado desconhecido.' },
            ],
          },
        },
      ],
      run: ['cd pratica-erros', 'npm run dev'],
      httpTests: [
        { method: 'GET', url: 'http://localhost:3000/produtos/1', expected: '200 OK com o produto Teclado.' },
        { method: 'GET', url: 'http://localhost:3000/produtos/99', expected: '404 com {"erro":"Produto 99 não encontrado"}.' },
        {
          method: 'POST',
          url: 'http://localhost:3000/produtos',
          body: `{ "nome": "Mouse", "preco": 80 }`,
          expected: '201 Created com {"id":2,"nome":"Mouse","preco":80}.',
        },
        {
          method: 'POST',
          url: 'http://localhost:3000/produtos',
          body: `{ "nome": "Mo", "preco": -5 }`,
          expected: '400 com {"erro":"Dados inválidos","detalhes":["nome deve ter ao menos 3 caracteres","preco deve ser um número positivo"]}.',
        },
        {
          method: 'POST',
          url: 'http://localhost:3000/produtos',
          body: `{ "nome": "Mouse", `,
          expected: '400 com {"erro":"Corpo da requisição não é um JSON válido"}. O Thunder Client pode avisar que o JSON é inválido; envie assim mesmo.',
        },
        {
          method: 'GET',
          url: 'http://localhost:3000/quebrar',
          expected: '500 com {"erro":"Erro interno do servidor"}. No terminal aparece "Erro inesperado: TypeError: Falha inesperada simulada" com o stack trace.',
        },
      ],
      expected: `Todas as respostas seguem o mesmo formato JSON, com o status code correto.
O stack trace aparece só no terminal, nunca na resposta.
O servidor continua de pé depois de todos os erros.`,
    },
    commonErrors: [
      {
        title: 'catch vazio ou só com console.log',
        symptom: 'A operação "funciona", mas os dados não aparecem. Nenhum erro chega ao cliente.',
        cause: 'O erro foi capturado e descartado. Quem chamou acha que deu certo.',
        fix: 'Só capture o que você sabe resolver (tentar de novo, valor padrão aceitável). Caso contrário, relance ou deixe subir até o tratador central.',
      },
      {
        title: 'Stack trace ou mensagem do banco na resposta',
        symptom: 'O cliente recebe caminhos de arquivos, nomes de tabelas ou a mensagem original do driver.',
        cause: 'O tratador devolve erro.message ou erro.stack de erros inesperados.',
        fix: 'Erros conhecidos têm mensagens pensadas para o cliente. Erros inesperados recebem uma mensagem genérica, e os detalhes vão só para o log.',
      },
      {
        title: 'Lançar strings ou objetos literais',
        symptom: 'Logs sem stack trace; erro instanceof Error é false; o tratador central não reconhece o erro.',
        cause: "throw 'mensagem' ou throw { status: 400 }.",
        fix: 'Sempre lance instâncias de Error ou de subclasses dele.',
      },
      {
        title: 'Continuar rodando após uncaughtException',
        symptom: 'Depois de um erro grave, a aplicação passa a se comportar de forma estranha: conexões presas, memória crescendo.',
        cause: 'Um handler de uncaughtException que só registra e deixa o processo seguir em estado desconhecido.',
        fix: 'Registre o erro e encerre com process.exit(1). Em produção, o Docker ou o gerenciador de processos reinicia a aplicação.',
      },
    ],
    guidance: {
      before: ['Call Stack: como um throw sobe pela pilha.', 'Async/Await: rejeições e try/catch.'],
      now: ['Erros operacionais x bugs.', 'Classes de erro e cause.', 'Tratamento centralizado.', 'O que registrar e o que responder.'],
      after: [
        'Status Codes: qual código para cada tipo de erro.',
        'Módulo 03: validação com DTOs e respostas inválidas.',
        'Módulo 06: traduzir erros do Prisma para HTTP.',
      ],
      officialDocs: [
        { label: 'Node.js API · Errors', url: 'https://nodejs.org/api/errors.html' },
        { label: 'Node.js API · process (eventos uncaughtException e unhandledRejection)', url: 'https://nodejs.org/api/process.html' },
        { label: 'MDN · Error', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error' },
        { label: 'MDN · Error: cause', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause' },
        { label: 'MDN · try...catch', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch' },
      ],
    },
  },
}
