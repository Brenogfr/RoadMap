import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'HTTP é o protocolo de aplicação da web: um cliente envia uma requisição (método, caminho, headers e corpo opcional) e o servidor devolve uma resposta (status, headers e corpo). HTTPS é o mesmo HTTP transportado dentro de uma conexão TLS, que é criptografada e autenticada.',
    purpose:
      'É a linguagem comum entre navegadores, aplicativos, ferramentas como o Thunder Client e a sua API. Entender o formato das mensagens é entender o que um framework faz por baixo de @Get(), @Body() e @Headers().',
    problem:
      'Sem um protocolo padrão, cada cliente e cada servidor precisariam combinar um formato próprio. Sem HTTPS, qualquer ponto da rede (Wi-Fi público, provedor, proxy) poderia ler e alterar senhas, tokens e dados em trânsito.',
    whyExists:
      'O HTTP foi criado no início dos anos 1990 para transferir documentos e virou a base de quase toda comunicação entre sistemas. O TLS (sucessor do SSL) surgiu porque o HTTP original trafega em texto puro.',
    whereUsed:
      'Em toda API REST, nas chamadas entre microsserviços, em webhooks, em integrações com serviços de pagamento e e-mail, e em qualquer site.',
  },
  technical: {
    internals: [
      'No HTTP/1.1, a mensagem é texto: uma linha inicial, headers no formato Nome: valor (um por linha), uma linha em branco e o corpo. Cada linha termina com \\r\\n.',
      'O HTTP roda sobre TCP, que entrega bytes em ordem e sem perdas. Uma conexão TCP pode ser reaproveitada para várias requisições (keep-alive).',
      'O HTTP é stateless: cada requisição carrega tudo o que o servidor precisa saber. Identidade e sessão viajam em headers (Authorization, Cookie), não "ficam" na conexão.',
      'O HTTP/2 mantém a mesma semântica (métodos, status, headers), mas usa um formato binário e envia várias requisições ao mesmo tempo na mesma conexão.',
      'No HTTPS, antes de qualquer byte HTTP, cliente e servidor fazem o handshake TLS: o servidor apresenta um certificado, o cliente verifica se ele é válido para aquele domínio, e os dois combinam chaves para criptografar o resto da conexão.',
      'O TLS garante três coisas: confidencialidade (ninguém lê), integridade (ninguém altera sem ser detectado) e autenticidade (você está falando com o servidor dono do domínio).',
    ],
    concepts: [
      { term: 'Requisição', description: 'Linha inicial (método, caminho, versão), headers e corpo opcional.' },
      { term: 'Resposta', description: 'Linha de status (versão, código, frase), headers e corpo opcional.' },
      { term: 'Headers', description: 'Metadados: Content-Type, Content-Length, Authorization, Accept. Os nomes não diferenciam maiúsculas de minúsculas.' },
      { term: 'Stateless', description: 'O servidor não guarda contexto entre requisições. Cada uma é independente.' },
      { term: 'TLS', description: 'Camada de segurança sob o HTTP. Portas padrão: 80 para HTTP e 443 para HTTPS.' },
      { term: 'Certificado', description: 'Documento assinado por uma autoridade certificadora que vincula uma chave pública a um domínio.' },
    ],
    examples: [
      {
        title: 'uma requisição e uma resposta reais',
        description: 'O que o Thunder Client envia ao criar um produto, e o que o servidor devolve. É exatamente este texto que trafega no HTTP/1.1.',
        sample: {
          filename: 'mensagens.http',
          language: 'http',
          code: `POST /produtos HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Content-Length: 27
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

{"nome":"Mouse","preco":80}

HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 34
Location: /produtos/2

{"id":2,"nome":"Mouse","preco":80}`,
          lineNotes: [
            { line: '1', note: 'Linha inicial da requisição: método, caminho (com a query string, se houver) e versão do protocolo.' },
            { line: '2', note: 'Host é obrigatório no HTTP/1.1: um mesmo IP pode hospedar vários domínios.' },
            { line: '3', note: 'Content-Type diz como interpretar o corpo. Sem ele, o servidor não sabe que é JSON.' },
            { line: '4', note: 'Content-Length informa o tamanho do corpo em bytes, para o servidor saber onde a mensagem termina.' },
            { line: '5', note: 'Credenciais viajam em headers a cada requisição, porque o HTTP não guarda estado.' },
            { line: '6-7', note: 'A linha em branco separa headers do corpo.' },
            { line: '9', note: 'Linha de status da resposta: versão, código e frase. O código é o que os programas leem.' },
            { line: '12', note: 'Location aponta para o recurso recém-criado, a convenção para respostas 201.' },
          ],
        },
      },
      {
        title: 'HTTP à mão, direto no TCP',
        description:
          'Com o módulo node:net, escrevemos a requisição como texto puro em um socket TCP. Rode com o servidor da seção D ligado.',
        sample: {
          filename: 'cliente-tcp.ts',
          language: 'ts',
          code: `import { connect } from 'node:net'

const socket = connect(3000, 'localhost', () => {
  socket.write(
    'GET /eco?nome=ana HTTP/1.1\\r\\n' +
      'Host: localhost:3000\\r\\n' +
      'Accept: application/json\\r\\n' +
      'Connection: close\\r\\n' +
      '\\r\\n',
  )
})

socket.on('data', (dados) => process.stdout.write(dados.toString()))
socket.on('end', () => console.log('\\n[conexão encerrada pelo servidor]'))`,
          lineNotes: [
            { line: '3', note: 'Abre uma conexão TCP pura, sem nada de HTTP. Equivale ao que o navegador faz antes de enviar a requisição.' },
            { line: '5-9', note: 'A requisição é só texto: linha inicial, headers e a linha vazia final (\\r\\n\\r\\n) que encerra os headers.' },
            { line: '8', note: 'Connection: close pede ao servidor que feche a conexão depois de responder, desativando o keep-alive.' },
            { line: '13', note: 'A resposta chega como bytes. Imprimi-los mostra a linha de status, os headers e o corpo exatamente como vieram.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Uma requisição HTTPS, do zero',
      steps: [
        { label: 'Resolução DNS', detail: 'O cliente descobre o IP do domínio (localhost já é 127.0.0.1).' },
        { label: 'Handshake TCP', detail: 'SYN, SYN-ACK, ACK: a conexão é aberta na porta 443.' },
        { label: 'Handshake TLS', detail: 'O cliente anuncia o que suporta; o servidor responde com o certificado; o cliente o valida e os dois derivam as chaves de sessão.' },
        { label: 'Requisição HTTP criptografada', detail: 'Método, caminho, headers e corpo viajam cifrados. Um observador vê o IP de destino, mas não o conteúdo.' },
        { label: 'Resposta HTTP criptografada', detail: 'O servidor processa e responde pelo mesmo canal.' },
        { label: 'Reaproveitamento ou encerramento', detail: 'Com keep-alive, a mesma conexão (e o mesmo TLS) serve às próximas requisições.' },
      ],
      caption: 'Em HTTP simples, o passo 3 não existe e tudo trafega como texto legível.',
    },
  ],
  practice: {
    goal:
      'Um servidor "eco" que devolve tudo o que recebeu (método, caminho, query, headers e corpo), servido em HTTP e, opcionalmente, em HTTPS com um certificado autoassinado.',
    structure: `pratica-http/
├── package.json
├── certs/              (gerada no passo opcional de HTTPS)
│   ├── chave.pem
│   └── certificado.pem
└── src/
    ├── handler.ts
    ├── http.ts
    └── https.ts`,
    files: [
      {
        path: 'package.json',
        purpose: 'Um script para cada servidor.',
        sample: {
          language: 'json',
          code: `{
  "name": "pratica-http",
  "type": "module",
  "scripts": {
    "http": "node --watch src/http.ts",
    "https": "node --watch src/https.ts"
  }
}`,
        },
      },
      {
        path: 'src/handler.ts',
        purpose: 'O tratador de requisições, compartilhado pelos dois servidores. Ele não sabe se a conexão é segura: só lê a requisição.',
        sample: {
          language: 'ts',
          code: `import type { IncomingMessage, ServerResponse } from 'node:http'

export async function eco(req: IncomingMessage, res: ServerResponse) {
  const partes: Buffer[] = []
  for await (const parte of req) partes.push(parte as Buffer)
  const corpo = Buffer.concat(partes).toString('utf8')

  const url = new URL(req.url ?? '/', 'http://' + (req.headers.host ?? 'localhost'))

  const resposta = {
    metodo: req.method,
    caminho: url.pathname,
    query: Object.fromEntries(url.searchParams),
    versaoHttp: req.httpVersion,
    headers: req.headers,
    corpo: corpo || null,
    seguro: 'encrypted' in req.socket,
  }

  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Servidor': 'pratica-http',
  })
  res.end(JSON.stringify(resposta, null, 2))
}`,
          lineNotes: [
            { line: '4-6', note: 'O corpo é lido como texto puro, sem interpretar. Assim você vê exatamente o que o cliente mandou.' },
            { line: '8', note: 'req.url traz só o caminho e a query. URL precisa de uma base para montar o endereço completo.' },
            { line: '13', note: 'searchParams vira um objeto: ?nome=ana&idade=30 → { nome: "ana", idade: "30" }. Valores de query são sempre strings.' },
            { line: '15', note: 'O Node.js entrega os nomes dos headers em minúsculas, então content-type e Content-Type são o mesmo header.' },
            { line: '17', note: 'Em conexões TLS, o socket tem a propriedade encrypted. É assim que o código sabe se a requisição veio por HTTPS.' },
            { line: '20-23', note: 'Um header personalizado na resposta. Veja-o na aba Headers do Thunder Client.' },
          ],
        },
      },
      {
        path: 'src/http.ts',
        purpose: 'Servidor HTTP na porta 3000.',
        sample: {
          language: 'ts',
          code: `import { createServer } from 'node:http'
import { eco } from './handler.ts'

const PORT = Number(process.env.PORT ?? 3000)

createServer(eco).listen(PORT, () => console.log('HTTP em http://localhost:' + PORT))`,
        },
      },
      {
        path: 'src/https.ts',
        purpose: 'O mesmo tratador, agora atrás de TLS. A única diferença é a chave privada e o certificado.',
        sample: {
          language: 'ts',
          code: `import { readFileSync } from 'node:fs'
import { createServer } from 'node:https'
import { eco } from './handler.ts'

const PORT = Number(process.env.PORT ?? 3443)

const opcoes = {
  key: readFileSync('certs/chave.pem'),
  cert: readFileSync('certs/certificado.pem'),
}

createServer(opcoes, eco).listen(PORT, () => console.log('HTTPS em https://localhost:' + PORT))`,
          lineNotes: [
            { line: '7-10', note: 'Leitura síncrona é aceitável aqui: acontece uma vez, na inicialização, antes de qualquer requisição.' },
            { line: '8', note: 'A chave privada nunca sai do servidor e nunca vai para o Git.' },
            { line: '9', note: 'O certificado, com a chave pública, é enviado ao cliente durante o handshake TLS.' },
          ],
        },
      },
    ],
    run: [
      'cd pratica-http',
      'npm run http',
      '# Opcional, HTTPS (no Windows, use o Git Bash, que inclui o openssl):',
      'mkdir certs',
      'openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/chave.pem -out certs/certificado.pem -days 30 -subj "/CN=localhost"',
      '# No Git Bash, escreva -subj "//CN=localhost" (com duas barras)',
      'npm run https',
    ],
    httpTests: [
      {
        method: 'GET',
        url: 'http://localhost:3000/eco?nome=ana&idade=30',
        headers: { 'X-Meu-Header': 'teste' },
        expected:
          '200 OK. query mostra { "nome": "ana", "idade": "30" } (strings), headers inclui "x-meu-header": "teste" em minúsculas, seguro é false. Na aba Headers da resposta, procure X-Servidor.',
      },
      {
        method: 'POST',
        url: 'http://localhost:3000/eco',
        body: `{ "nome": "Mouse", "preco": 80 }`,
        expected: 'corpo traz o JSON como texto e headers mostra content-type: application/json e content-length.',
      },
      {
        method: 'GET',
        url: 'https://localhost:3443/eco',
        expected:
          'Na primeira tentativa, o Thunder Client recusa o certificado autoassinado. Desative a verificação de SSL nas configurações dele (só para desenvolvimento) e envie de novo: seguro passa a ser true.',
      },
    ],
    expected: `HTTP: respostas com "seguro": false.
HTTPS: as mesmas respostas, com "seguro": true.
Com o servidor HTTP ligado, node cliente-tcp.ts (exemplo da seção B) imprime a resposta crua: HTTP/1.1 200 OK, os headers e o corpo.
Repare em Transfer-Encoding: chunked. Como o servidor não informou Content-Length, o corpo é enviado em blocos, cada um precedido pelo seu tamanho em hexadecimal.`,
  },
  commonErrors: [
    {
      title: 'self-signed certificate (DEPTH_ZERO_SELF_SIGNED_CERT)',
      symptom: 'O cliente recusa a conexão HTTPS com o servidor local.',
      cause: 'O certificado foi assinado por você mesmo, não por uma autoridade em que o sistema confia. O cliente está fazendo o trabalho dele.',
      fix: 'Em desenvolvimento, desative a verificação apenas na ferramenta de teste. Em produção, use um certificado de uma autoridade (como Let’s Encrypt), normalmente configurado no proxy reverso ou no load balancer.',
    },
    {
      title: 'Misturar http:// e https:// na porta errada',
      symptom: 'Erros como "wrong version number", "socket hang up" ou "Empty reply from server".',
      cause: 'O cliente fala TLS com um servidor HTTP, ou texto puro com um servidor HTTPS. Os dois lados não se entendem.',
      fix: 'Confira o esquema da URL e a porta: 3000 (http) e 3443 (https) nesta prática.',
    },
    {
      title: 'Corpo enviado sem Content-Type',
      symptom: 'O servidor recebe o corpo vazio ou como texto. No NestJS, @Body() chega como {}.',
      cause: 'Sem Content-Type: application/json, o servidor não sabe que deve interpretar o corpo como JSON.',
      fix: 'Envie o header correto. No Thunder Client, usar a aba Body → JSON já adiciona o header.',
    },
    {
      title: 'Confiar em HTTP sem TLS "porque é rede interna"',
      symptom: 'Tokens e senhas podem ser capturados por qualquer um no caminho, inclusive dentro da empresa ou da nuvem.',
      cause: 'HTTP trafega em texto puro, e a rede interna não é uma garantia de segurança.',
      fix: 'Use HTTPS em toda comunicação que leve credenciais ou dados pessoais, inclusive entre serviços.',
    },
  ],
  guidance: {
    before: ['Node.js: servidor com node:http.', 'Noções de rede: IP, porta e cliente/servidor.'],
    now: ['Formato de requisição e resposta.', 'Headers essenciais.', 'Stateless.', 'TLS: o que protege e como funciona o handshake.'],
    after: ['Métodos HTTP: a semântica de cada verbo.', 'Status Codes.', 'Módulo 07: autenticação com tokens em headers.'],
    officialDocs: [
      { label: 'MDN · Visão geral do HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview' },
      { label: 'MDN · Mensagens HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages' },
      { label: 'MDN · Uma sessão HTTP típica', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Session' },
      { label: 'MDN · HTTPS (glossário)', url: 'https://developer.mozilla.org/en-US/docs/Glossary/HTTPS' },
      { label: 'MDN · TLS (glossário)', url: 'https://developer.mozilla.org/en-US/docs/Glossary/TLS' },
      { label: 'Node.js API · http', url: 'https://nodejs.org/api/http.html' },
      { label: 'Node.js API · https', url: 'https://nodejs.org/api/https.html' },
    ],
    complementary: [
      { label: 'RFC 9110 · HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110' },
      { label: 'RFC 8446 · TLS 1.3', url: 'https://www.rfc-editor.org/rfc/rfc8446' },
    ],
  },
}

export default lesson
