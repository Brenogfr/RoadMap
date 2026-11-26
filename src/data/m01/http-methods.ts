import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'O método HTTP é o verbo da requisição: diz o que o cliente quer fazer com o recurso indicado na URL. GET lê, POST cria (ou processa), PUT substitui, PATCH altera parcialmente e DELETE remove.',
    purpose:
      'Separar a intenção (o método) do alvo (a URL). Assim, /tarefas/1 é sempre a mesma tarefa, e o método define se ela será lida, alterada ou removida. Clientes, proxies e caches usam o método para decidir o que podem fazer com segurança.',
    problem:
      'APIs que ignoram a semântica dos métodos criam bugs difíceis: um GET que apaga dados é executado por um robô de busca ou por um prefetch do navegador; um POST repetido por um retry cria pedidos duplicados; um PUT usado como PATCH apaga campos que o cliente não enviou.',
    whyExists:
      'A especificação do HTTP define propriedades para cada método (seguro, idempotente, cacheável) justamente para que componentes intermediários possam agir sem conhecer a aplicação: repetir uma requisição, guardá-la em cache ou fazer um prefetch.',
    whereUsed:
      'No desenho de toda API REST. No NestJS, cada método vira um decorator: @Get(), @Post(), @Put(), @Patch() e @Delete().',
  },
  technical: {
    internals: [
      'Seguro (safe): o método não altera o estado do servidor. GET, HEAD e OPTIONS são seguros. Podem ser repetidos, pré-carregados e guardados em cache sem efeito colateral.',
      'Idempotente: repetir a mesma requisição N vezes deixa o servidor no mesmo estado que uma única vez. GET, PUT e DELETE são idempotentes; POST e PATCH, em geral, não são.',
      'Idempotência fala do estado do servidor, não da resposta: o primeiro DELETE responde 204 e o segundo 404, mas o estado final (tarefa removida) é o mesmo.',
      'PUT envia a representação completa e substitui o recurso; campos omitidos deixam de existir. PATCH envia só as alterações.',
      'POST é o método genérico de "processe isto": criar um item em uma coleção, disparar uma ação, enviar um formulário. O servidor escolhe o id e responde 201 com o header Location.',
      'Uma rota que existe, mas não aceita o método, responde 405 Method Not Allowed com o header Allow listando os métodos aceitos.',
    ],
    concepts: [
      { term: 'GET', description: 'Lê um recurso ou uma coleção. Seguro e idempotente. Não deve ter corpo.' },
      { term: 'POST', description: 'Cria um recurso subordinado ou executa uma ação. Não é idempotente: repetir pode duplicar.' },
      { term: 'PUT', description: 'Substitui o recurso inteiro na URL indicada. Idempotente.' },
      { term: 'PATCH', description: 'Altera parcialmente um recurso. Não é garantidamente idempotente (ex.: "incrementar estoque").' },
      { term: 'DELETE', description: 'Remove o recurso. Idempotente.' },
      { term: 'HEAD e OPTIONS', description: 'HEAD é um GET sem corpo, só os headers. OPTIONS pergunta o que é permitido; o navegador o usa no preflight de CORS.' },
    ],
    examples: [
      {
        title: 'idempotência na prática',
        description: 'O que acontece quando um cliente repete a mesma requisição, por exemplo após um timeout.',
        sample: {
          filename: 'idempotencia.ts',
          language: 'ts',
          code: `const tarefas = new Map<number, { titulo: string; feita: boolean }>()
let proximoId = 1

function post(dados: { titulo: string }) {
  tarefas.set(proximoId++, { titulo: dados.titulo, feita: false })
}
function put(id: number, dados: { titulo: string; feita: boolean }) {
  tarefas.set(id, { ...dados })
}
function patch(id: number, dados: { feita?: boolean }) {
  const atual = tarefas.get(id)
  if (atual) tarefas.set(id, { ...atual, ...dados })
}
function del(id: number) {
  tarefas.delete(id)
}

post({ titulo: 'Estudar' })
post({ titulo: 'Estudar' })
post({ titulo: 'Estudar' })
console.log('após 3 POST iguais:', tarefas.size, 'tarefas')

put(1, { titulo: 'Estudar HTTP', feita: false })
put(1, { titulo: 'Estudar HTTP', feita: false })
console.log('após 2 PUT iguais:', tarefas.get(1))

patch(1, { feita: true })
patch(1, { feita: true })
console.log('após 2 PATCH iguais:', tarefas.get(1))

del(2)
del(2)
console.log('após 2 DELETE iguais:', [...tarefas.keys()])`,
          lineNotes: [
            { line: '18-21', note: 'Três POST idênticos criam três tarefas. Um retry automático de POST pode duplicar pedidos, pagamentos e cadastros.' },
            { line: '23-25', note: 'PUT define o estado completo. Repetir não muda nada: o resultado é o mesmo da primeira vez.' },
            { line: '27-29', note: 'Este PATCH ("marque como feita") também é idempotente. Um PATCH como "some 1 ao estoque" não seria: por isso a especificação não garante idempotência para PATCH.' },
            { line: '31-33', note: 'O segundo DELETE não encontra nada, mas o estado final é o mesmo: a tarefa 2 não existe.' },
          ],
        },
      },
      {
        title: 'PUT x PATCH',
        description: 'A mesma alteração, marcar uma tarefa como feita, com cada método.',
        sample: {
          filename: 'put-patch.http',
          language: 'http',
          code: `PUT /tarefas/1 HTTP/1.1
Content-Type: application/json

{"titulo":"Ler sobre HTTP","feita":true}

PATCH /tarefas/1 HTTP/1.1
Content-Type: application/json

{"feita":true}`,
          lineNotes: [
            { line: '1-4', note: 'PUT carrega o recurso inteiro. Se o cliente esquecer titulo, a tarefa ficaria sem título (ou o servidor deve recusar com 400).' },
            { line: '6-9', note: 'PATCH carrega só o que muda. O servidor mescla com o estado atual.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Como o servidor despacha pelo método',
      steps: [
        { label: 'Identificar o recurso', detail: 'A URL indica uma coleção (/tarefas) ou um item (/tarefas/1).' },
        { label: 'Verificar se o recurso existe', detail: 'Para um item inexistente, 404, qualquer que seja o método.' },
        { label: 'Escolher a ação pelo método', detail: 'GET lê, PUT substitui, PATCH mescla, DELETE remove. Na coleção: GET lista e POST cria.' },
        { label: 'Validar o corpo conforme o método', detail: 'PUT exige o recurso completo; PATCH aceita campos parciais; GET e DELETE não usam corpo.' },
        { label: 'Responder', detail: '200 com o recurso, 201 com Location, 204 sem corpo.' },
        { label: 'Método não suportado', detail: '405 com o header Allow listando os métodos aceitos naquela rota.' },
      ],
    },
  ],
  practice: {
    goal: 'Um CRUD completo de tarefas em memória, implementando a semântica de cada método à mão, inclusive 405 com o header Allow.',
    structure: `pratica-metodos/
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
  "name": "pratica-metodos",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.ts"
  }
}`,
        },
      },
      {
        path: 'src/server.ts',
        purpose: 'Uma rota de coleção e uma rota de item, cada uma com os métodos que fazem sentido para ela.',
        sample: {
          language: 'ts',
          code: `import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'

interface Tarefa {
  id: number
  titulo: string
  feita: boolean
}

const tarefas = new Map<number, Tarefa>([[1, { id: 1, titulo: 'Ler sobre HTTP', feita: false }]])
let proximoId = 2

async function lerJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const partes: Buffer[] = []
  for await (const parte of req) partes.push(parte as Buffer)
  const texto = Buffer.concat(partes).toString('utf8')
  return texto ? JSON.parse(texto) : {}
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
  const segmentos = new URL(req.url ?? '/', 'http://localhost').pathname.split('/').filter(Boolean)
  if (segmentos[0] !== 'tarefas' || segmentos.length > 2) {
    return enviar(res, 404, { erro: 'Rota não encontrada' })
  }

  if (segmentos.length === 1) {
    if (req.method === 'GET') return enviar(res, 200, [...tarefas.values()])
    if (req.method === 'POST') {
      const dados = await lerJson(req)
      if (typeof dados.titulo !== 'string') return enviar(res, 400, { erro: 'titulo é obrigatório' })
      const tarefa: Tarefa = { id: proximoId++, titulo: dados.titulo, feita: false }
      tarefas.set(tarefa.id, tarefa)
      return enviar(res, 201, tarefa, { Location: '/tarefas/' + tarefa.id })
    }
    return enviar(res, 405, { erro: 'Método não permitido' }, { Allow: 'GET, POST' })
  }

  const id = Number(segmentos[1])
  const atual = tarefas.get(id)
  if (!atual) return enviar(res, 404, { erro: 'Tarefa não encontrada' })

  switch (req.method) {
    case 'GET':
      return enviar(res, 200, atual)
    case 'PUT': {
      const dados = await lerJson(req)
      if (typeof dados.titulo !== 'string' || typeof dados.feita !== 'boolean') {
        return enviar(res, 400, { erro: 'PUT exige o recurso completo: titulo e feita' })
      }
      const substituida: Tarefa = { id, titulo: dados.titulo, feita: dados.feita }
      tarefas.set(id, substituida)
      return enviar(res, 200, substituida)
    }
    case 'PATCH': {
      const dados = await lerJson(req)
      const atualizada: Tarefa = {
        ...atual,
        ...(typeof dados.titulo === 'string' ? { titulo: dados.titulo } : {}),
        ...(typeof dados.feita === 'boolean' ? { feita: dados.feita } : {}),
      }
      tarefas.set(id, atualizada)
      return enviar(res, 200, atualizada)
    }
    case 'DELETE':
      tarefas.delete(id)
      return enviar(res, 204)
    default:
      return enviar(res, 405, { erro: 'Método não permitido' }, { Allow: 'GET, PUT, PATCH, DELETE' })
  }
}

const server = createServer((req, res) => {
  rotear(req, res).catch((erro) => {
    if (erro instanceof SyntaxError) return enviar(res, 400, { erro: 'JSON inválido' })
    console.error(erro)
    enviar(res, 500, { erro: 'Erro interno' })
  })
})

server.listen(Number(process.env.PORT ?? 3000), () => console.log('Servidor em http://localhost:3000'))`,
          lineNotes: [
            { line: '9', note: 'Um Map indexado por id: buscar, substituir e remover por id são operações diretas.' },
            { line: '16', note: 'Corpo vazio vira {}. Um JSON malformado faz JSON.parse lançar SyntaxError, tratado no fim do arquivo.' },
            { line: '20-23', note: 'Respostas sem corpo (204) não levam Content-Type nem conteúdo.' },
            { line: '29', note: '"/tarefas/1" vira ["tarefas", "1"]. Um segmento é a coleção; dois são um item.' },
            { line: '34-44', note: 'Na coleção, só GET (listar) e POST (criar) fazem sentido. Qualquer outro método recebe 405 e o header Allow.' },
            { line: '41', note: 'O servidor escolhe o id e informa onde o novo recurso está, no header Location.' },
            { line: '48', note: 'A existência é verificada antes do método: um item inexistente é 404 para GET, PUT, PATCH ou DELETE.' },
            { line: '53-61', note: 'PUT recusa um recurso incompleto, em vez de apagar os campos que faltam.' },
            { line: '62-71', note: 'PATCH aplica só os campos enviados e válidos sobre o estado atual.' },
            { line: '72-74', note: 'DELETE responde 204 No Content: deu certo e não há nada para devolver.' },
            { line: '82-84', note: 'SyntaxError do JSON.parse é culpa do cliente (400). Qualquer outro erro é nosso (500).' },
          ],
        },
      },
    ],
    run: ['cd pratica-metodos', 'npm run dev'],
    httpTests: [
      { method: 'GET', url: 'http://localhost:3000/tarefas', expected: '200 com um array contendo a tarefa 1.' },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Praticar métodos HTTP" }`,
        expected: '201 Created com a tarefa 2. Na aba Headers: Location: /tarefas/2. Envie de novo: surge a tarefa 3 (POST não é idempotente).',
      },
      {
        method: 'PUT',
        url: 'http://localhost:3000/tarefas/1',
        body: `{ "titulo": "Ler a RFC 9110", "feita": true }`,
        expected: '200 com a tarefa substituída. Enviar de novo devolve o mesmo resultado.',
      },
      {
        method: 'PUT',
        url: 'http://localhost:3000/tarefas/1',
        body: `{ "feita": false }`,
        expected: '400: PUT exige o recurso completo.',
      },
      {
        method: 'PATCH',
        url: 'http://localhost:3000/tarefas/1',
        body: `{ "feita": false }`,
        expected: '200: só o campo feita muda, o título é mantido.',
      },
      { method: 'DELETE', url: 'http://localhost:3000/tarefas/2', expected: '204 sem corpo. Envie de novo: 404, mas o estado do servidor é o mesmo.' },
      {
        method: 'DELETE',
        url: 'http://localhost:3000/tarefas',
        expected: '405 Method Not Allowed. Na aba Headers: Allow: GET, POST.',
      },
    ],
    expected: `Cada método produz o efeito esperado no estado do servidor.
Repetir PUT, PATCH (deste tipo) e DELETE não muda o resultado final; repetir POST cria um item novo a cada vez.`,
  },
  commonErrors: [
    {
      title: 'GET que altera dados',
      symptom: 'Registros somem ou mudam "sozinhos"; logs mostram acessos de robôs ou de prefetch do navegador.',
      cause: 'Rotas como GET /tarefas/1/apagar. Por ser seguro, GET é repetido, pré-carregado e guardado em cache livremente.',
      fix: 'Qualquer alteração de estado usa POST, PUT, PATCH ou DELETE.',
    },
    {
      title: 'Verbos na URL e POST para tudo',
      symptom: 'Rotas como POST /criarTarefa, POST /atualizarTarefa, POST /apagarTarefa.',
      cause: 'A ação foi colocada na URL em vez de no método.',
      fix: 'URLs nomeiam recursos (substantivos); o método diz a ação: POST /tarefas, PATCH /tarefas/1, DELETE /tarefas/1.',
    },
    {
      title: 'PUT tratado como PATCH, ou o contrário',
      symptom: 'Atualizar um campo apaga os outros, ou um PUT incompleto é aceito e deixa o recurso inconsistente.',
      cause: 'O servidor não respeita a diferença entre substituir e mesclar.',
      fix: 'PUT exige o recurso completo (ou responde 400). PATCH mescla apenas os campos enviados.',
    },
    {
      title: 'Pedidos duplicados após um retry de POST',
      symptom: 'O cliente repete a requisição após um timeout e o pedido é criado duas vezes.',
      cause: 'POST não é idempotente, e o primeiro pode ter funcionado mesmo sem a resposta chegar.',
      fix: 'Para operações críticas, aceite um header Idempotency-Key e guarde as chaves já processadas, devolvendo o resultado original em vez de repetir.',
    },
  ],
  guidance: {
    before: ['HTTP e HTTPS: o formato das mensagens.'],
    now: ['Semântica de cada método.', 'Seguro x idempotente.', 'PUT x PATCH.', '405 e o header Allow.'],
    after: ['Status Codes.', 'Módulo 04: desenho de APIs REST e CRUD com NestJS.'],
    officialDocs: [
      { label: 'MDN · Métodos de requisição HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods' },
      { label: 'MDN · Idempotente (glossário)', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Idempotent' },
      { label: 'MDN · Método seguro (glossário)', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Safe/HTTP' },
      { label: 'MDN · CORS (preflight com OPTIONS)', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS' },
    ],
    complementary: [{ label: 'RFC 9110 · HTTP Semantics (seção 9, Methods)', url: 'https://www.rfc-editor.org/rfc/rfc9110' }],
  },
}

export default lesson
