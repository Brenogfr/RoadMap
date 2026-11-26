import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'O ciclo de vida é a sequência completa de etapas pela qual uma requisição passa: conexão de rede, leitura e interpretação dos bytes, execução de uma cadeia de etapas no servidor (middlewares), geração da resposta e reaproveitamento ou encerramento da conexão.',
    purpose:
      'É o mapa que conecta tudo o que você estudou neste módulo, e o modelo mental para entender frameworks. No NestJS, a requisição passa por middlewares, guards, interceptors, pipes, controller e exception filters, nessa ordem.',
    problem:
      'Sem esse mapa, fica difícil saber onde colocar cada responsabilidade (autenticação, validação, log), por que uma requisição ficou sem resposta, ou por que aparece "Cannot set headers after they are sent".',
    whyExists:
      'Todo servidor HTTP precisa resolver os mesmos problemas transversais em todas as rotas: identificar a requisição, registrar, autenticar, ler o corpo, tratar erros. O padrão de pipeline com middlewares surgiu para escrever cada responsabilidade uma única vez.',
    whereUsed:
      'Express e Koa (middlewares), NestJS (middlewares, guards, pipes, interceptors, filters), proxies reversos, API gateways e ferramentas de observabilidade.',
  },
  technical: {
    internals: [
      'Antes do seu código: resolução DNS, conexão TCP e, em HTTPS, o handshake TLS. Com keep-alive, essas etapas acontecem só na primeira requisição da conexão.',
      'O Node.js lê os bytes do socket e os entrega ao parser HTTP interno (llhttp). Quando os headers terminam, o servidor emite o evento request com req e res. O corpo ainda não foi lido: ele chega como stream.',
      'Seu código roda como uma cadeia de etapas. Cada etapa pode encerrar a requisição respondendo, ou passar adiante. Etapas que fazem I/O liberam o event loop enquanto esperam.',
      'res.writeHead envia a linha de status e os headers; res.end envia o restante do corpo. Depois que os headers saem, não é possível mudar o status nem adicionar headers.',
      'O evento finish indica que a resposta foi entregue ao sistema operacional, o momento certo para registrar status e duração. close indica que o ciclo terminou (normalmente ou porque o cliente desconectou).',
      'Com keep-alive, a conexão TCP fica aberta esperando a próxima requisição até o keepAliveTimeout. requestTimeout e headersTimeout protegem o servidor de clientes lentos ou maliciosos.',
    ],
    concepts: [
      { term: 'Socket', description: 'A conexão TCP entre cliente e servidor. Pode transportar várias requisições em sequência.' },
      { term: 'Parser HTTP', description: 'Converte os bytes recebidos em método, URL, headers e corpo.' },
      { term: 'Middleware', description: 'Uma etapa do pipeline que recebe a requisição e decide: responder ou chamar a próxima.' },
      { term: 'Request ID', description: 'Identificador único da requisição, enviado em um header e incluído nos logs para correlacionar eventos.' },
      { term: 'finish / close', description: 'Eventos de fim da resposta. Use finish para log de acesso; close para limpar recursos.' },
      { term: 'Keep-alive', description: 'Reaproveitar a conexão para as próximas requisições, evitando refazer TCP e TLS.' },
    ],
    examples: [
      {
        title: 'os eventos de uma requisição',
        description: 'Cada console.log marca um momento do ciclo. Rode e faça uma requisição: a numeração mostra a ordem real.',
        sample: {
          filename: 'eventos.ts',
          language: 'ts',
          code: `import { createServer } from 'node:http'

const server = createServer((req, res) => {
  console.log('2. request: headers recebidos:', req.method, req.url)
  req.on('end', () => console.log('3. end: corpo lido por completo'))
  req.resume()

  res.on('finish', () => console.log('5. finish: resposta entregue ao sistema operacional'))
  res.on('close', () => console.log('6. close: ciclo da requisição encerrado'))

  setTimeout(() => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('ok')
    console.log('4. res.end() chamado')
  }, 100)
})

server.on('connection', (socket) => {
  console.log('1. connection: nova conexão TCP de', socket.remoteAddress)
  socket.on('close', () => console.log('7. close: conexão TCP encerrada'))
})

server.listen(3000)`,
          lineNotes: [
            { line: '3-4', note: 'O callback roda quando os headers chegam. Neste ponto o corpo pode ainda estar a caminho.' },
            { line: '5-6', note: 'req é um stream. resume() consome o corpo (mesmo vazio) para o evento end acontecer.' },
            { line: '8-9', note: 'Os eventos de fim são registrados antes da resposta, para não perder nenhum.' },
            { line: '11-15', note: 'Simula 100 ms de trabalho (uma consulta ao banco, por exemplo). Durante esse tempo, outras requisições podem ser atendidas.' },
            { line: '18-21', note: 'connection acontece antes de tudo, uma vez por conexão TCP, e não uma vez por requisição.' },
          ],
        },
      },
      {
        title: 'o pipeline de middlewares',
        description: 'Cada etapa recebe o contexto e uma função para chamar a próxima. O código depois do await roda na volta, como camadas de uma cebola.',
        sample: {
          filename: 'pipeline.ts',
          language: 'ts',
          code: `type Contexto = { caminho: string; usuario?: string; log: string[] }
type Middleware = (ctx: Contexto, proximo: () => Promise<void>) => Promise<void>

const medirTempo: Middleware = async (ctx, proximo) => {
  const inicio = performance.now()
  await proximo()
  ctx.log.push('tempo total: ' + (performance.now() - inicio).toFixed(2) + ' ms')
}

const autenticar: Middleware = async (ctx, proximo) => {
  ctx.usuario = 'ana'
  ctx.log.push('autenticado como ' + ctx.usuario)
  await proximo()
}

const rota: Middleware = async (ctx) => {
  ctx.log.push('rota ' + ctx.caminho + ' executada por ' + ctx.usuario)
}

function executar(middlewares: Middleware[], ctx: Contexto, i = 0): Promise<void> {
  const atual = middlewares[i]
  return atual ? atual(ctx, () => executar(middlewares, ctx, i + 1)) : Promise.resolve()
}

const ctx: Contexto = { caminho: '/produtos', log: [] }
await executar([medirTempo, autenticar, rota], ctx)
console.log(ctx.log)`,
          lineNotes: [
            { line: '2', note: 'Toda etapa tem a mesma assinatura: o contexto compartilhado e a função que chama a próxima.' },
            { line: '5-7', note: 'Código antes do await roda na ida; depois do await, na volta. É assim que se mede o tempo de tudo o que vem depois.' },
            { line: '11', note: 'Uma etapa enriquece o contexto para as seguintes, como o NestJS faz com request.user após a autenticação.' },
            { line: '16-18', note: 'A rota não chama proximo: ela é o fim da cadeia.' },
            { line: '20-23', note: 'O executor chama o middleware i passando uma função que chama o i + 1. Sem nenhum middleware restante, a cadeia termina.' },
            { line: '27', note: 'Imprime: autenticado como ana → rota executada → tempo total. O tempo é registrado por último porque é medido na volta.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Uma requisição, do Send à conexão encerrada',
      steps: [
        { label: 'Rede', detail: 'DNS, conexão TCP e, em HTTPS, handshake TLS. Reaproveitados com keep-alive.' },
        { label: 'Parsing', detail: 'O Node.js transforma bytes em método, URL e headers e emite request. O corpo segue como stream.' },
        { label: 'Middlewares de entrada', detail: 'Request ID, log, tratamento de erros, leitura do corpo, autenticação. No NestJS: middlewares, guards, pipes.' },
        { label: 'Handler da rota', detail: 'A regra de negócio. Faz I/O com await, liberando o event loop durante a espera.' },
        { label: 'Resposta', detail: 'writeHead envia status e headers; end envia o corpo. Depois disso, headers não mudam mais.' },
        { label: 'Volta pelo pipeline', detail: 'Etapas registram duração e status no evento finish. No NestJS: interceptors e exception filters.' },
        { label: 'Fim da conexão ou keep-alive', detail: 'A conexão espera a próxima requisição até o keepAliveTimeout e então é fechada.' },
      ],
    },
  ],
  practice: {
    goal:
      'Um servidor com um pipeline de middlewares escrito à mão: request ID, log de acesso com duração, tratamento de erros, leitura do corpo e rotas. É o mesmo desenho que os frameworks seguem.',
    structure: `pratica-ciclo/
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
  "name": "pratica-ciclo",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.ts"
  }
}`,
        },
      },
      {
        path: 'src/server.ts',
        purpose: 'Cada responsabilidade transversal em um middleware separado, e um executor que os encadeia.',
        sample: {
          language: 'ts',
          code: `import { randomUUID } from 'node:crypto'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { setTimeout as esperar } from 'node:timers/promises'

interface Contexto {
  req: IncomingMessage
  res: ServerResponse
  url: URL
  id: string
  corpo?: unknown
}
type Middleware = (ctx: Contexto, proximo: () => Promise<void>) => Promise<void>

function enviar(ctx: Contexto, status: number, corpo: unknown) {
  if (ctx.res.headersSent) return
  ctx.res.writeHead(status, { 'Content-Type': 'application/json' })
  ctx.res.end(JSON.stringify(corpo))
}

const requestId: Middleware = async (ctx, proximo) => {
  ctx.res.setHeader('X-Request-Id', ctx.id)
  await proximo()
}

const logDeAcesso: Middleware = async (ctx, proximo) => {
  const inicio = performance.now()
  ctx.res.on('finish', () => {
    const ms = (performance.now() - inicio).toFixed(1)
    console.log('[' + ctx.id.slice(0, 8) + '] ' + ctx.req.method + ' ' + ctx.url.pathname + ' → ' + ctx.res.statusCode + ' (' + ms + ' ms)')
  })
  await proximo()
}

const tratarErros: Middleware = async (ctx, proximo) => {
  try {
    await proximo()
  } catch (erro) {
    console.error('[' + ctx.id.slice(0, 8) + ']', erro)
    enviar(ctx, 500, { erro: 'Erro interno', requestId: ctx.id })
  }
}

const lerCorpo: Middleware = async (ctx, proximo) => {
  if (ctx.req.method === 'POST' || ctx.req.method === 'PUT' || ctx.req.method === 'PATCH') {
    const partes: Buffer[] = []
    for await (const parte of ctx.req) partes.push(parte as Buffer)
    try {
      ctx.corpo = JSON.parse(Buffer.concat(partes).toString('utf8') || 'null')
    } catch {
      return enviar(ctx, 400, { erro: 'JSON inválido' })
    }
  }
  await proximo()
}

const rotas: Middleware = async (ctx) => {
  if (ctx.req.method === 'GET' && ctx.url.pathname === '/lento') {
    const ms = Number(ctx.url.searchParams.get('ms') ?? 200)
    await esperar(ms)
    return enviar(ctx, 200, { esperou: ms })
  }
  if (ctx.req.method === 'POST' && ctx.url.pathname === '/eco') {
    return enviar(ctx, 200, { recebido: ctx.corpo })
  }
  if (ctx.url.pathname === '/falha') {
    throw new Error('Falha simulada')
  }
  enviar(ctx, 404, { erro: 'Rota não encontrada' })
}

const pipeline: Middleware[] = [requestId, logDeAcesso, tratarErros, lerCorpo, rotas]

function executar(ctx: Contexto, i = 0): Promise<void> {
  const atual = pipeline[i]
  return atual ? atual(ctx, () => executar(ctx, i + 1)) : Promise.resolve()
}

const server = createServer((req, res) => {
  const ctx: Contexto = { req, res, url: new URL(req.url ?? '/', 'http://localhost'), id: randomUUID() }
  executar(ctx).catch((erro) => {
    console.error('Erro fora do pipeline:', erro)
    if (!res.headersSent) res.writeHead(500).end()
  })
})

server.requestTimeout = 10_000
server.keepAliveTimeout = 5_000

server.listen(Number(process.env.PORT ?? 3000), () => console.log('Servidor em http://localhost:3000'))`,
          lineNotes: [
            { line: '5-11', note: 'O contexto viaja por todas as etapas. Cada uma pode ler e acrescentar informações.' },
            { line: '15', note: 'Proteção contra resposta dupla: se alguém já respondeu, não tenta de novo.' },
            { line: '20-23', note: 'O header é definido antes de qualquer resposta. Depois de writeHead, já seria tarde.' },
            { line: '25-32', note: 'O log é registrado no finish, quando o status final é conhecido, inclusive em erros.' },
            { line: '34-41', note: 'Fica antes das etapas que podem falhar. O requestId na resposta permite achar o erro exato no log.' },
            { line: '43-54', note: 'O corpo só é lido para métodos que o usam. JSON inválido encerra a cadeia aqui, com 400, sem chegar às rotas.' },
            { line: '56-69', note: 'As rotas não se preocupam com log, id, corpo ou erros inesperados: as etapas anteriores já cuidaram disso.' },
            { line: '71', note: 'A ordem importa: o log precisa envolver o tratamento de erros para registrar também os 500.' },
            { line: '73-76', note: 'O mesmo executor do exemplo da seção B.' },
            { line: '78-84', note: 'Um contexto novo por requisição, com id gerado por randomUUID. O catch final é uma rede de segurança.' },
            { line: '86-87', note: 'requestTimeout limita quanto tempo o cliente tem para enviar a requisição inteira; keepAliveTimeout, quanto tempo uma conexão ociosa fica aberta.' },
          ],
        },
      },
    ],
    run: ['cd pratica-ciclo', 'npm run dev'],
    httpTests: [
      {
        method: 'GET',
        url: 'http://localhost:3000/lento?ms=300',
        expected: '200 com {"esperou":300}. Na aba Headers, X-Request-Id. No terminal: [id] GET /lento → 200 (30x ms), com os mesmos 8 primeiros caracteres do header.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/eco',
        body: `{ "mensagem": "olá" }`,
        expected: '200 com {"recebido":{"mensagem":"olá"}}.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/eco',
        body: `{ "mensagem": `,
        expected: '400 com {"erro":"JSON inválido"}. O log registra o 400: a cadeia parou em lerCorpo.',
      },
      {
        method: 'GET',
        url: 'http://localhost:3000/falha',
        expected: '500 com o requestId no corpo. Procure esse id no terminal: lá estão o stack trace e a linha de log do 500.',
      },
      { method: 'GET', url: 'http://localhost:3000/nada', expected: '404 com {"erro":"Rota não encontrada"}.' },
    ],
    expected: `Uma linha de log por requisição, no formato:
[3f2a9c1b] GET /lento → 200 (301.8 ms)

Para ver os eventos do exemplo da seção B, rode node eventos.ts (com este servidor parado, pois os dois usam a porta 3000).
Pelo Thunder Client, o evento 7 (conexão TCP encerrada) só aparece alguns segundos depois: a conexão fica aberta pelo keep-alive.`,
  },
  commonErrors: [
    {
      title: 'Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client',
      symptom: 'O erro aparece no terminal, às vezes derrubando o processo, e o cliente recebe a primeira resposta.',
      cause: 'Duas respostas para a mesma requisição: faltou um return depois de responder, ou um middleware respondeu e mesmo assim chamou o próximo.',
      fix: 'Sempre use return junto com a resposta. Em pontos genéricos (tratadores de erro), verifique res.headersSent antes de responder.',
    },
    {
      title: 'Requisição que nunca responde',
      symptom: 'O Thunder Client fica carregando até o timeout.',
      cause: 'Algum middleware não respondeu nem chamou proximo(), ou um await ficou pendurado em uma Promise que nunca termina.',
      fix: 'Toda etapa deve responder ou chamar a próxima. Uma rota final de 404 e timeouts nas chamadas externas evitam requisições penduradas.',
    },
    {
      title: 'Middlewares na ordem errada',
      symptom: 'Erros 500 não aparecem no log; rotas rodam sem autenticação; o corpo chega undefined.',
      cause: 'O log foi colocado depois do tratador de erros, a autenticação depois da rota, ou a leitura do corpo depois de quem precisa dele.',
      fix: 'Pense na cebola: etapas que observam tudo (id, log) ficam por fora; tratamento de erros logo depois; corpo e autenticação antes das rotas.',
    },
    {
      title: 'Logs sem forma de correlacionar',
      symptom: 'Com várias requisições simultâneas, é impossível saber quais linhas de log pertencem ao mesmo erro.',
      cause: 'As linhas não carregam nenhum identificador da requisição.',
      fix: 'Gere um request ID na entrada, devolva no header X-Request-Id e inclua-o em todo log e em toda resposta de erro.',
    },
  ],
  guidance: {
    before: ['Todo o Módulo 01, em especial Event Loop, Tratamento de erros e Status Codes.'],
    now: ['Etapas de rede e parsing.', 'Pipeline de middlewares.', 'Eventos finish e close.', 'Keep-alive e timeouts.'],
    after: [
      'Exercício do módulo: servidor de notas sem framework.',
      'Módulo 02: Fluxo de uma requisição no NestJS (middlewares, guards, pipes, interceptors, filters).',
    ],
    officialDocs: [
      { label: 'MDN · Uma sessão HTTP típica', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Session' },
      { label: 'Node.js API · http (eventos e timeouts do servidor)', url: 'https://nodejs.org/api/http.html' },
      { label: 'Node.js API · net (sockets TCP)', url: 'https://nodejs.org/api/net.html' },
      { label: 'Node.js API · crypto (randomUUID)', url: 'https://nodejs.org/api/crypto.html' },
      { label: 'Node.js API · perf_hooks (performance.now)', url: 'https://nodejs.org/api/perf_hooks.html' },
    ],
  },
}

export default lesson
