import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'O status code é o número de três dígitos na primeira linha da resposta. O primeiro dígito indica a classe (sucesso, erro do cliente, erro do servidor) e o número completo indica a situação exata.',
    purpose:
      'Permitir que programas reajam sem ler o corpo: o front-end decide se mostra o resultado ou a mensagem de erro, um cliente decide se vale tentar de novo, e o monitoramento separa falhas do cliente de falhas da API.',
    problem:
      'APIs que respondem 200 para tudo, com {"erro": ...} no corpo, enganam os clientes e o monitoramento. APIs que respondem 500 para dados inválidos geram alertas falsos e não dizem ao cliente que o problema está do lado dele.',
    whyExists:
      'Definidos na especificação do HTTP para que qualquer cliente entenda o resultado de qualquer servidor. Um 404 significa a mesma coisa em todas as APIs do mundo.',
    whereUsed:
      'Em toda resposta HTTP. No NestJS, cada exceção (NotFoundException, BadRequestException, ConflictException...) corresponde a um status code.',
  },
  technical: {
    internals: [
      '2xx: a requisição foi entendida e processada. 3xx: o cliente precisa fazer algo a mais (seguir um redirecionamento, usar o cache). 4xx: o problema está na requisição, e repeti-la igual vai falhar de novo. 5xx: o servidor falhou com uma requisição que poderia ser válida.',
      'A diferença entre 4xx e 5xx define responsabilidade: em 4xx o cliente deve corrigir algo; em 5xx a equipe da API deve investigar. Alertas de monitoramento normalmente olham para 5xx.',
      '401 Unauthorized significa "não sei quem você é" (faltou autenticação ou ela é inválida). 403 Forbidden significa "sei quem você é, mas você não pode fazer isto".',
      '204 No Content não tem corpo. 201 Created deve vir com o header Location apontando o novo recurso.',
      'A ordem das verificações define o status: rota → método → autenticação → permissão → formato → validação → regra de negócio. Uma requisição sem token recebe 401 antes de qualquer validação do corpo.',
      'Clientes podem tentar de novo automaticamente após 503 ou 429, de preferência respeitando o header Retry-After. Repetir uma requisição que recebeu 400 não adianta.',
    ],
    concepts: [
      { term: '200 / 201 / 204', description: 'OK com corpo; criado (com Location); sucesso sem corpo.' },
      { term: '400 Bad Request', description: 'Requisição malformada ou dados inválidos. O NestJS usa 400 para falhas de validação.' },
      { term: '401 x 403', description: '401: não autenticado. 403: autenticado, mas sem permissão.' },
      { term: '404 / 405', description: 'Recurso inexistente; método não aceito na rota (com o header Allow).' },
      { term: '409 Conflict', description: 'Conflito com o estado atual: nome duplicado, versão desatualizada.' },
      { term: '500 / 503', description: 'Falha inesperada do servidor; serviço temporariamente indisponível.' },
    ],
    examples: [
      {
        title: 'as cinco classes',
        description: 'O mapa de referência, com os códigos que você vai usar no dia a dia de uma API.',
        sample: {
          filename: 'classes.txt',
          language: 'text',
          code: `1xx  Informativo       101 Switching Protocols
2xx  Sucesso           200 OK · 201 Created · 204 No Content
3xx  Redirecionamento  301 Moved Permanently · 304 Not Modified
4xx  Erro do cliente   400 · 401 · 403 · 404 · 405 · 409 · 415 · 422 · 429
5xx  Erro do servidor  500 · 502 · 503 · 504`,
          lineNotes: [
            { line: '1', note: 'Raro em APIs REST. O 101 aparece ao abrir uma conexão WebSocket.' },
            { line: '2', note: 'GET bem-sucedido → 200. POST que cria → 201. DELETE (ou PUT sem corpo de resposta) → 204.' },
            { line: '3', note: '304 Not Modified diz ao cliente para usar a cópia que já tem em cache.' },
            { line: '4', note: '415: Content-Type não suportado. 422: corpo bem formado mas semanticamente inválido (algumas APIs usam no lugar de 400). 429: muitas requisições (rate limit).' },
            { line: '5', note: '502 e 504 costumam vir de um proxy que não conseguiu falar com a sua API. 503: a API está de pé, mas temporariamente sem condições de atender.' },
          ],
        },
      },
      {
        title: '401 ou 403?',
        description: 'A decisão que mais gera confusão, em uma função pequena.',
        sample: {
          filename: 'acesso.ts',
          language: 'ts',
          code: `type Papel = 'admin' | 'cliente'
const tokens: Record<string, Papel> = { 'token-admin': 'admin', 'token-cliente': 'cliente' }

function statusDeAcesso(authorization: string | undefined, papelExigido: Papel): number {
  const token = authorization?.replace('Bearer ', '')
  if (!token || !(token in tokens)) return 401
  if (tokens[token] !== papelExigido) return 403
  return 200
}

console.log(statusDeAcesso(undefined, 'admin'))
console.log(statusDeAcesso('Bearer token-falso', 'admin'))
console.log(statusDeAcesso('Bearer token-cliente', 'admin'))
console.log(statusDeAcesso('Bearer token-admin', 'admin'))`,
          lineNotes: [
            { line: '6', note: 'Sem token, ou com um token desconhecido: não sabemos quem é. 401.' },
            { line: '7', note: 'Sabemos quem é, mas o papel não basta. 403. Autenticar de novo não resolveria.' },
            { line: '11-14', note: 'Imprime 401, 401, 403 e 200.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'A ordem das verificações em um POST /produtos',
      steps: [
        { label: 'A rota existe?', detail: 'Não → 404 Not Found.' },
        { label: 'O método é aceito nesta rota?', detail: 'Não → 405 Method Not Allowed, com o header Allow.' },
        { label: 'Há credenciais válidas?', detail: 'Não → 401 Unauthorized.' },
        { label: 'O usuário tem permissão?', detail: 'Não → 403 Forbidden.' },
        { label: 'O formato do corpo é suportado e válido?', detail: 'Content-Type errado → 415. JSON malformado ou campos inválidos → 400.' },
        { label: 'A regra de negócio permite?', detail: 'Nome já cadastrado → 409 Conflict.' },
        { label: 'Sucesso', detail: '201 Created com o recurso no corpo e o header Location.' },
      ],
      caption: 'Qualquer exceção não prevista em qualquer etapa → 500 Internal Server Error, com detalhes apenas no log.',
    },
  ],
  practice: {
    goal: 'Uma API de produtos que responde com o status code correto em cada situação, incluindo autenticação simulada para diferenciar 401 de 403.',
    structure: `pratica-status/
├── package.json
└── src/
    └── server.ts`,
    files: [
      {
        path: 'package.json',
        purpose: 'Configuração com watch.',
        sample: {
          language: 'json',
          code: `{
  "name": "pratica-status",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.ts"
  }
}`,
        },
      },
      {
        path: 'src/server.ts',
        purpose: 'Cada verificação lança um HttpError com o status certo; um único ponto transforma o erro em resposta.',
        sample: {
          language: 'ts',
          code: `import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'

class HttpError extends Error {
  readonly status: number
  readonly headers: Record<string, string>

  constructor(status: number, mensagem: string, headers: Record<string, string> = {}) {
    super(mensagem)
    this.status = status
    this.headers = headers
  }
}

interface Produto {
  id: number
  nome: string
  preco: number
}

const produtos: Produto[] = [{ id: 1, nome: 'Teclado', preco: 150 }]
const tokens: Record<string, 'admin' | 'cliente'> = { 'token-admin': 'admin', 'token-cliente': 'cliente' }

function exigirAdmin(req: IncomingMessage) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new HttpError(401, 'Envie o header Authorization: Bearer <token>')
  const papel = tokens[token]
  if (!papel) throw new HttpError(401, 'Token inválido')
  if (papel !== 'admin') throw new HttpError(403, 'Apenas administradores podem alterar produtos')
}

async function lerProduto(req: IncomingMessage) {
  if (!req.headers['content-type']?.startsWith('application/json')) {
    throw new HttpError(415, 'Envie o corpo como application/json')
  }
  const partes: Buffer[] = []
  for await (const parte of req) partes.push(parte as Buffer)
  let dados: Record<string, unknown>
  try {
    dados = JSON.parse(Buffer.concat(partes).toString('utf8'))
  } catch {
    throw new HttpError(400, 'JSON malformado')
  }
  if (typeof dados.nome !== 'string' || typeof dados.preco !== 'number' || dados.preco <= 0) {
    throw new HttpError(400, 'Informe nome (texto) e preco (número positivo)')
  }
  return { nome: dados.nome, preco: dados.preco }
}

function enviar(res: ServerResponse, status: number, corpo?: unknown, headers: Record<string, string> = {}) {
  if (corpo === undefined) {
    res.writeHead(status, headers).end()
    return
  }
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers })
  res.end(JSON.stringify(corpo))
}

async function rotear(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const id = Number(url.pathname.match(/^\\/produtos\\/(\\d+)$/)?.[1])

  if (url.pathname === '/produtos') {
    if (req.method === 'GET') return enviar(res, 200, produtos)
    if (req.method === 'POST') {
      exigirAdmin(req)
      const dados = await lerProduto(req)
      if (produtos.some((p) => p.nome.toLowerCase() === dados.nome.toLowerCase())) {
        throw new HttpError(409, 'Já existe um produto chamado ' + dados.nome)
      }
      const produto = { id: Math.max(0, ...produtos.map((p) => p.id)) + 1, ...dados }
      produtos.push(produto)
      return enviar(res, 201, produto, { Location: '/produtos/' + produto.id })
    }
    throw new HttpError(405, 'Método não permitido', { Allow: 'GET, POST' })
  }

  if (id) {
    const indice = produtos.findIndex((p) => p.id === id)
    if (indice === -1) throw new HttpError(404, 'Produto ' + id + ' não encontrado')
    if (req.method === 'GET') return enviar(res, 200, produtos[indice])
    if (req.method === 'DELETE') {
      exigirAdmin(req)
      produtos.splice(indice, 1)
      return enviar(res, 204)
    }
    throw new HttpError(405, 'Método não permitido', { Allow: 'GET, DELETE' })
  }

  if (url.pathname === '/falha') throw new Error('Falha simulada no banco de dados')
  throw new HttpError(404, 'Rota não encontrada')
}

const server = createServer((req, res) => {
  rotear(req, res).catch((erro) => {
    if (erro instanceof HttpError) {
      return enviar(res, erro.status, { status: erro.status, erro: erro.message }, erro.headers)
    }
    console.error(erro)
    enviar(res, 500, { status: 500, erro: 'Erro interno do servidor' })
  })
})

server.listen(Number(process.env.PORT ?? 3000), () => console.log('Servidor em http://localhost:3000'))`,
          lineNotes: [
            { line: '3-12', note: 'O erro carrega o status e, quando preciso, headers (como Allow no 405).' },
            { line: '21', note: 'Tokens fixos simulam autenticação. No Módulo 07 isso vira JWT de verdade.' },
            { line: '23-29', note: 'Sem token ou token desconhecido → 401. Token válido de cliente → 403.' },
            { line: '32-34', note: 'Content-Type verificado antes de ler o corpo: 415 se não for JSON.' },
            { line: '38-42', note: 'Só o erro do JSON.parse vira 400 aqui. Qualquer outro erro continua sendo inesperado.' },
            { line: '43-45', note: 'Dados bem formados, mas inválidos: também 400, como faz o ValidationPipe do NestJS.' },
            { line: '65-66', note: 'Autenticação antes de ler e validar o corpo: quem não pode criar nem chega à validação.' },
            { line: '67-69', note: 'Os dados são válidos, mas conflitam com o estado atual: 409.' },
            { line: '72', note: '201 com Location, a resposta padrão de criação.' },
            { line: '78-79', note: '404 vem antes da verificação de método e de permissão: o recurso precisa existir primeiro.' },
            { line: '89', note: 'Uma falha simulada de infraestrutura, para observar o 500.' },
            { line: '95-97', note: 'Erros conhecidos: o status vem do próprio erro. O formato do corpo é o mesmo em todas as respostas de erro.' },
            { line: '98-99', note: 'Erros inesperados: log completo no servidor, mensagem genérica para o cliente.' },
          ],
        },
      },
    ],
    run: ['cd pratica-status', 'npm run dev'],
    httpTests: [
      { method: 'GET', url: 'http://localhost:3000/produtos', expected: '200 OK com a lista.' },
      {
        method: 'POST',
        url: 'http://localhost:3000/produtos',
        body: `{ "nome": "Mouse", "preco": 80 }`,
        expected: '401: sem o header Authorization.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/produtos',
        headers: { Authorization: 'Bearer token-cliente' },
        body: `{ "nome": "Mouse", "preco": 80 }`,
        expected: '403: autenticado como cliente, sem permissão.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/produtos',
        headers: { Authorization: 'Bearer token-admin' },
        body: `{ "nome": "Mouse", "preco": 80 }`,
        expected: '201 Created com Location: /produtos/2. Envie de novo: 409 Conflict.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/produtos',
        headers: { Authorization: 'Bearer token-admin' },
        body: `{ "nome": "Monitor", "preco": -1 }`,
        expected: '400: preço inválido.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/produtos',
        headers: { Authorization: 'Bearer token-admin', 'Content-Type': 'text/plain' },
        expected: '415: na aba Body, escolha Text em vez de JSON e escreva qualquer texto.',
      },
      { method: 'GET', url: 'http://localhost:3000/produtos/99', expected: '404 Not Found.' },
      { method: 'PUT', url: 'http://localhost:3000/produtos/1', expected: '405 com o header Allow: GET, DELETE.' },
      { method: 'DELETE', url: 'http://localhost:3000/produtos/2', headers: { Authorization: 'Bearer token-admin' }, expected: '204 sem corpo.' },
      { method: 'GET', url: 'http://localhost:3000/falha', expected: '500 com mensagem genérica; o erro real aparece no terminal.' },
    ],
    expected: `Todas as respostas de erro seguem o formato {"status": N, "erro": "..."}.
Você consegue prever o status de cada teste antes de enviar. Esse é o objetivo da prática.`,
  },
  commonErrors: [
    {
      title: '200 com erro no corpo',
      symptom: 'O front-end mostra "sucesso" para uma operação que falhou; o monitoramento não registra nenhuma falha.',
      cause: 'A API responde 200 e coloca {"sucesso": false} ou {"erro": "..."} no corpo.',
      fix: 'Use o status code da situação real (4xx ou 5xx) e mantenha um formato de erro consistente no corpo.',
    },
    {
      title: '500 para dados inválidos',
      symptom: 'Alertas de erro do servidor disparam por causa de clientes que enviam dados errados.',
      cause: 'A validação não existe e o código quebra mais adiante, ou todo erro é convertido em 500.',
      fix: 'Valide a entrada e responda 400. Reserve 500 para falhas que a equipe da API precisa investigar.',
    },
    {
      title: 'Confundir 401 com 403',
      symptom: 'O front-end manda o usuário fazer login de novo, quando o problema é falta de permissão (ou o contrário).',
      cause: 'Usar o mesmo código para "não autenticado" e para "sem permissão".',
      fix: '401 quando faltam credenciais válidas; 403 quando a identidade é conhecida mas não tem permissão.',
    },
    {
      title: 'Corpo em resposta 204',
      symptom: 'O cliente ignora o corpo, ou ferramentas acusam erro de protocolo.',
      cause: 'A especificação diz que 204 não tem conteúdo.',
      fix: 'Se precisar devolver dados, use 200 com corpo. Use 204 só quando não houver nada a devolver.',
    },
  ],
  guidance: {
    before: ['Métodos HTTP.', 'Tratamento de erros: classes de erro e tratador central.'],
    now: ['As cinco classes.', 'Os códigos do dia a dia.', '401 x 403, 400 x 422, 404 x 405.', 'A ordem das verificações.'],
    after: ['Ciclo de vida de uma requisição.', 'Módulo 02: exceções HTTP do NestJS.', 'Módulo 07: 401 e 403 com JWT e Guards.'],
    officialDocs: [
      { label: 'MDN · Status de resposta HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status' },
      { label: 'Node.js API · http.STATUS_CODES', url: 'https://nodejs.org/api/http.html' },
    ],
    complementary: [{ label: 'RFC 9110 · HTTP Semantics (seção 15, Status Codes)', url: 'https://www.rfc-editor.org/rfc/rfc9110' }],
  },
}

export default lesson
