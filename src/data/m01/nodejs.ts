import type { Topic } from '../../types/roadmap'

export const nodejs: Topic = {
  id: 'm01-nodejs',
  title: 'Node.js',
  summary: 'O runtime que executa JavaScript no servidor: V8, libuv, I/O não bloqueante e APIs nativas.',
  lesson: {
    intro: {
      whatIs:
        'Node.js é um runtime: um programa que executa JavaScript fora do navegador. Ele junta o motor V8 (que executa o código), a biblioteca libuv (que cuida de I/O assíncrono) e APIs para arquivos, rede, processos e criptografia.',
      purpose:
        'Permite escrever servidores, APIs, CLIs e workers em JavaScript/TypeScript, com acesso ao sistema operacional, algo que o navegador proíbe por segurança.',
      problem:
        'Servidores tradicionais muitas vezes dedicavam uma thread por conexão. Cada thread parada esperando o banco ou o disco consome memória, e milhares de conexões simultâneas ficam caras. O Node.js atende muitas conexões com uma única thread de JavaScript, sem esperar parado pelo I/O.',
      whyExists:
        'Criado em 2009 por Ryan Dahl para tornar fácil escrever servidores de rede eficientes usando I/O orientado a eventos. A escolha do JavaScript veio porque a linguagem já era acostumada a callbacks e eventos no navegador.',
      whereUsed:
        'APIs REST e GraphQL, NestJS e Express, gateways, servidores em tempo real (WebSockets), ferramentas de build (Vite, TypeScript), CLIs e funções serverless.',
    },
    technical: {
      internals: [
        'O V8 compila e executa o JavaScript em uma única thread principal. Só existe uma pilha de chamadas (call stack) executando o seu código por vez.',
        'Operações de I/O (rede, disco, DNS) são entregues à libuv. Rede usa os mecanismos assíncronos do sistema operacional; disco, DNS e criptografia usam um pool de threads interno (4 threads por padrão).',
        'Quando o I/O termina, a libuv coloca o callback em uma fila. O event loop pega esses callbacks e os executa na thread principal quando a pilha está vazia.',
        'O processo continua vivo enquanto houver trabalho pendente: um servidor ouvindo uma porta, um timer ativo ou uma leitura em andamento. Sem nada pendente, o processo termina sozinho.',
        'Módulos nativos são importados com o prefixo node: (node:http, node:fs/promises), o que deixa claro que não vêm do npm.',
      ],
      concepts: [
        { term: 'Runtime', description: 'O ambiente que executa o código e fornece as APIs. O navegador é um runtime; o Node.js é outro.' },
        { term: 'V8', description: 'Motor JavaScript do Google, o mesmo do Chrome. Compila JS para código de máquina.' },
        { term: 'libuv', description: 'Biblioteca em C que implementa o event loop e o I/O assíncrono multiplataforma.' },
        {
          term: 'I/O não bloqueante',
          description: 'Pedir uma leitura e continuar executando outras coisas; o resultado chega depois, por callback ou Promise.',
        },
        { term: 'process', description: 'Objeto global com informações do processo: process.env, process.argv, process.pid, process.exit().' },
        { term: 'npm', description: 'Gerenciador de pacotes. package.json descreve o projeto, suas dependências e scripts.' },
      ],
      examples: [
        {
          title: 'bloqueante x não bloqueante',
          description: 'A ordem das mensagens mostra a diferença: a versão síncrona trava tudo até terminar, a assíncrona não.',
          sample: {
            filename: 'leitura.ts',
            language: 'ts',
            code: `import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

console.log('1. início')

const sincrono = readFileSync('package.json', 'utf8')
console.log('2. leitura síncrona terminou:', sincrono.length, 'caracteres')

readFile('package.json', 'utf8').then((conteudo) => {
  console.log('4. leitura assíncrona terminou:', conteudo.length, 'caracteres')
})

console.log('3. fim do script, a leitura assíncrona ainda está em andamento')`,
            lineNotes: [
              { line: '1-2', note: 'A mesma operação em duas APIs: fs (síncrona) e fs/promises (assíncrona).' },
              { line: '6', note: 'readFileSync para a thread principal até o disco responder. Num servidor, nenhuma outra requisição seria atendida nesse tempo.' },
              { line: '9', note: 'readFile entrega o trabalho à libuv e devolve uma Promise imediatamente.' },
              { line: '10', note: 'Este callback só roda quando a leitura termina e a pilha está vazia.' },
              { line: '13', note: 'Executa antes do passo 4. É a prova de que o código não esperou a leitura assíncrona.' },
            ],
          },
        },
        {
          title: 'o objeto process',
          description: 'Configuração vinda do ambiente, e não escrita no código: a base de qualquer aplicação que roda em mais de um lugar.',
          sample: {
            filename: 'ambiente.ts',
            language: 'ts',
            code: `import os from 'node:os'

const porta = Number(process.env.PORT ?? 3000)
const ambiente = process.env.NODE_ENV ?? 'development'

console.log({
  node: process.version,
  pid: process.pid,
  plataforma: process.platform,
  cpus: os.cpus().length,
  porta,
  ambiente,
  argumentos: process.argv.slice(2),
})`,
            lineNotes: [
              { line: '3', note: 'Variáveis de ambiente são sempre strings ou undefined. Converta e defina um valor padrão.' },
              { line: '4', note: '?? só usa o padrão quando o valor é null ou undefined (diferente de ||, que também troca string vazia).' },
              { line: '7-10', note: 'Informações do processo e da máquina, úteis em logs e health checks.' },
              { line: '13', note: 'process.argv contém o caminho do node e do script; os argumentos do usuário começam no índice 2.' },
            ],
          },
        },
      ],
    },
    flows: [
      {
        title: 'O que acontece ao rodar node src/server.ts',
        steps: [
          { label: 'O processo inicia', detail: 'O Node.js inicializa o V8, a libuv e remove os tipos do arquivo .ts.' },
          { label: 'O módulo é executado de cima a baixo', detail: 'Imports são resolvidos e o código de nível superior roda uma vez.' },
          { label: 'createServer registra o callback', detail: 'A função ainda não roda: ela será chamada a cada requisição.' },
          { label: 'listen abre a porta', detail: 'A libuv pede ao sistema operacional para aceitar conexões. Isso é um "handle" ativo.' },
          { label: 'O script chega ao fim, mas o processo continua', detail: 'Há um handle ativo, então o event loop fica esperando eventos.' },
          { label: 'Uma requisição chega', detail: 'O sistema avisa a libuv, que enfileira o evento. O event loop chama o seu callback com req e res.' },
        ],
      },
    ],
    practice: {
      goal: 'Criar um servidor HTTP mínimo com o módulo nativo node:http, configurado por variável de ambiente e lendo arquivos de forma assíncrona.',
      structure: `pratica-node/
├── package.json
└── src/
    └── server.ts`,
      files: [
        {
          path: 'package.json',
          purpose: 'O script dev usa --watch para reiniciar o servidor a cada alteração. @types/node dá ao editor os tipos das APIs do Node.js.',
          sample: {
            language: 'json',
            code: `{
  "name": "pratica-node",
  "type": "module",
  "scripts": {
    "start": "node src/server.ts",
    "dev": "node --watch src/server.ts"
  },
  "devDependencies": {
    "@types/node": "^24.0.0"
  }
}`,
          },
        },
        {
          path: 'src/server.ts',
          purpose: 'Duas rotas e uma resposta 404 para todo o resto, sem nenhum framework.',
          sample: {
            language: 'ts',
            code: `import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'

const PORT = Number(process.env.PORT ?? 3000)
const iniciadoEm = Date.now()

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    const uptimeSegundos = Math.round((Date.now() - iniciadoEm) / 1000)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', uptimeSegundos }))
    return
  }

  if (req.method === 'GET' && req.url === '/info') {
    const pkg = JSON.parse(await readFile('package.json', 'utf8'))
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ nome: pkg.name, node: process.version, pid: process.pid }))
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ erro: 'Rota não encontrada' }))
})

server.listen(PORT, () => {
  console.log('Servidor ouvindo em http://localhost:' + PORT)
})`,
            lineNotes: [
              { line: '4', note: 'A porta vem do ambiente, com 3000 como padrão. Em produção, quem decide a porta é a infraestrutura.' },
              { line: '7', note: 'O callback roda uma vez por requisição. req descreve o que chegou; res é como você responde.' },
              { line: '8', note: 'Roteamento manual: comparar método e caminho. É isso que frameworks automatizam.' },
              { line: '10-11', note: 'writeHead define status e headers; end envia o corpo e encerra a resposta.' },
              { line: '12', note: 'Sem o return, o código continuaria e tentaria responder de novo.' },
              { line: '16', note: 'await libera a thread enquanto o disco trabalha: outras requisições continuam sendo atendidas.' },
              { line: '22-23', note: 'Qualquer combinação não tratada recebe 404. Toda requisição precisa de uma resposta.' },
              { line: '26-28', note: 'listen abre a porta. O callback avisa quando o servidor está pronto.' },
            ],
          },
        },
      ],
      run: [
        'cd pratica-node',
        'npm install',
        'npm run dev',
        '# Outra porta no PowerShell: $env:PORT=4000; npm run dev',
      ],
      httpTests: [
        { method: 'GET', url: 'http://localhost:3000/health', expected: '200 OK com {"status":"ok","uptimeSegundos":N}. Repita após alguns segundos: N aumenta.' },
        { method: 'GET', url: 'http://localhost:3000/info', expected: '200 OK com o nome do projeto, a versão do Node.js e o PID do processo.' },
        { method: 'GET', url: 'http://localhost:3000/produtos', expected: '404 Not Found com {"erro":"Rota não encontrada"}.' },
      ],
      expected: `No terminal: Servidor ouvindo em http://localhost:3000
Ao salvar o arquivo, o --watch reinicia o servidor e o uptime volta a 0.`,
    },
    commonErrors: [
      {
        title: 'Error: listen EADDRINUSE: address already in use :::3000',
        symptom: 'O servidor não sobe e o processo termina com esse erro.',
        cause: 'Outro processo (geralmente uma execução anterior que ficou aberta) já está usando a porta.',
        fix: 'Encerre o processo anterior com Ctrl+C no terminal dele, ou use outra porta com a variável PORT.',
      },
      {
        title: 'O Thunder Client fica carregando para sempre',
        symptom: 'A requisição nunca termina, até dar timeout.',
        cause: 'Algum caminho do código não chama res.end(). O servidor recebeu a requisição, mas nunca respondeu.',
        fix: 'Garanta que todo caminho termine com res.end(), inclusive os de erro. Um 404 no final cobre as rotas não tratadas.',
      },
      {
        title: 'SyntaxError: Cannot use import statement outside a module',
        symptom: 'O Node.js recusa o primeiro import do arquivo.',
        cause: 'O package.json tem "type": "commonjs" (o npm init coloca esse valor por padrão), então o arquivo é tratado como CommonJS.',
        fix: 'Defina "type": "module" no package.json.',
      },
      {
        title: 'Usar funções Sync dentro de rotas',
        symptom: 'Sob carga, a API inteira fica lenta, mesmo nas rotas que não usam o disco.',
        cause: 'readFileSync, pbkdf2Sync e afins bloqueiam a única thread de JavaScript enquanto rodam.',
        fix: 'Use as versões assíncronas (node:fs/promises). As versões Sync ficam restritas a scripts e à inicialização.',
      },
    ],
    guidance: {
      before: ['JavaScript aprofundado.', 'TypeScript: tipos básicos e módulos.'],
      now: ['V8, libuv e o modelo de thread única.', 'APIs nativas: http, fs/promises, process.', 'npm e package.json.'],
      after: ['Call Stack: como o V8 executa as funções.', 'Promises e Event Loop: como o I/O assíncrono volta para o seu código.'],
      officialDocs: [
        { label: 'Node.js · Introdução', url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs' },
        { label: 'Node.js · O motor V8', url: 'https://nodejs.org/en/learn/getting-started/the-v8-javascript-engine' },
        { label: 'Node.js · Diferenças entre Node.js e navegador', url: 'https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser' },
        { label: 'Node.js API · http', url: 'https://nodejs.org/api/http.html' },
        { label: 'Node.js API · fs', url: 'https://nodejs.org/api/fs.html' },
        { label: 'Node.js API · process', url: 'https://nodejs.org/api/process.html' },
      ],
      complementary: [
        { label: 'libuv · Visão geral do design', url: 'https://docs.libuv.org/en/v1.x/design.html' },
        { label: 'Node.js · Não bloqueie o Event Loop', url: 'https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop' },
      ],
    },
  },
}
