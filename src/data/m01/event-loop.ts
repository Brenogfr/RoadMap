import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'O event loop é o laço que o Node.js executa enquanto houver trabalho pendente. A cada volta, ele verifica timers vencidos, I/O concluído e callbacks agendados, e executa cada um na thread principal, sempre que a call stack estiver vazia.',
    purpose:
      'É o mecanismo que permite a uma única thread de JavaScript atender milhares de conexões: enquanto o I/O acontece fora da thread, o loop segue executando outros callbacks.',
    problem:
      'Sem entender o loop, não dá para prever a ordem de execução de código assíncrono, nem explicar por que um cálculo pesado em uma rota deixa todas as outras rotas lentas.',
    whyExists:
      'É a consequência direta do modelo do Node.js: uma thread para JavaScript, I/O delegado à libuv. Alguém precisa coordenar quando cada resultado volta para o JavaScript, e esse alguém é o event loop, implementado pela libuv.',
    whereUsed:
      'Em toda aplicação Node.js. É o que explica por que o NestJS consegue atender muitas requisições simultâneas, e o que se perde quando uma rota executa trabalho síncrono pesado.',
  },
  technical: {
    internals: [
      'Cada volta do loop passa por fases, nesta ordem: timers (setTimeout/setInterval vencidos), pending callbacks (alguns erros de sistema), poll (callbacks de I/O e espera por novos eventos), check (setImmediate) e close callbacks (por exemplo, socket.on("close")).',
      'Cada fase tem uma fila de callbacks. O loop executa os callbacks da fila da fase (até um limite) e passa para a próxima.',
      'Entre um callback e outro, o Node.js esvazia duas filas prioritárias: primeiro a de process.nextTick, depois a de microtasks (callbacks de Promises e queueMicrotask).',
      'Na fase poll, se não houver nada pronto, o loop espera por I/O, mas sem ultrapassar o timer mais próximo. Sem timers, I/O ou handles ativos, o loop termina e o processo encerra.',
      'O loop só avança quando a call stack está vazia. Um callback que demora 2 segundos atrasa em 2 segundos todos os outros callbacks: timers, requisições, tudo.',
    ],
    concepts: [
      { term: 'Event loop', description: 'O laço da libuv que coordena timers, I/O e callbacks na thread principal.' },
      { term: 'Macrotask', description: 'Nome informal dos callbacks das fases: timers, I/O, setImmediate. Um por vez, com microtasks entre eles.' },
      { term: 'Microtask', description: 'Callbacks de Promises (then/catch/finally, continuação de await) e queueMicrotask. Rodam antes da próxima macrotask.' },
      { term: 'process.nextTick', description: 'Fila própria do Node.js, esvaziada antes da fila de microtasks dentro de callbacks.' },
      { term: 'setImmediate', description: 'Executa na fase check, logo depois do poll da volta atual.' },
      { term: 'Bloquear o loop', description: 'Manter a call stack ocupada com trabalho síncrono, impedindo qualquer outro callback de rodar.' },
    ],
    examples: [
      {
        title: 'a ordem dentro de um callback de I/O',
        description:
          'Dentro de um callback de I/O, a ordem é garantida. Os números mostram a sequência real.',
        sample: {
          filename: 'ordem.ts',
          language: 'ts',
          code: `import { readFile } from 'node:fs'

readFile('package.json', () => {
  console.log('1. callback de I/O (fase poll)')

  setTimeout(() => console.log('6. setTimeout: fase timers, na próxima volta'), 0)
  setImmediate(() => console.log('5. setImmediate: fase check, ainda nesta volta'))

  Promise.resolve().then(() => console.log('4. microtask: Promise'))
  process.nextTick(() => console.log('3. process.nextTick'))

  console.log('2. fim do código síncrono do callback')
})`,
          lineNotes: [
            { line: '3', note: 'readFile delega a leitura à libuv. O callback roda na fase poll, quando a leitura termina.' },
            { line: '4', note: 'Código síncrono dentro do callback roda imediatamente, em ordem.' },
            { line: '6', note: 'O loop já passou da fase timers nesta volta. O timer só roda na próxima.' },
            { line: '7', note: 'A fase check vem logo depois do poll, então setImmediate roda antes do timer.' },
            { line: '9-10', note: 'Agendados por último, mas rodam antes de 5 e 6: as filas prioritárias são esvaziadas assim que o callback termina, com nextTick primeiro.' },
            { line: '12', note: 'Termina o callback. A pilha esvazia e começam as filas: nextTick → microtasks → check → timers.' },
          ],
        },
      },
      {
        title: 'um laço síncrono atrasa um timer',
        description: 'O timer pede 10 ms, mas só roda quando o laço libera a pilha.',
        sample: {
          filename: 'bloqueio.ts',
          language: 'ts',
          code: `const inicio = Date.now()

setTimeout(() => {
  console.log('timer de 10 ms executou depois de', Date.now() - inicio, 'ms')
}, 10)

let soma = 0
while (Date.now() - inicio < 500) {
  soma += Math.random()
}
console.log('laço terminou depois de', Date.now() - inicio, 'ms')`,
          lineNotes: [
            { line: '3-5', note: 'O atraso de um timer é um mínimo, não uma garantia.' },
            { line: '8-10', note: 'Por 500 ms a call stack não esvazia. O timer venceu aos 10 ms, mas o loop não consegue chegar à fase timers.' },
            { line: '11', note: 'Só depois desta linha a pilha esvazia e o timer roda, perto dos 500 ms. Numa API, o mesmo vale para todas as requisições em espera.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Uma volta do event loop',
      steps: [
        { label: 'timers', detail: 'Executa callbacks de setTimeout e setInterval cujo tempo já venceu.' },
        { label: 'pending callbacks', detail: 'Callbacks de I/O adiados da volta anterior, como alguns erros de TCP.' },
        { label: 'poll', detail: 'Executa callbacks de I/O concluído (leituras, requisições recebidas). Se não houver nada, espera por eventos até o próximo timer.' },
        { label: 'check', detail: 'Executa callbacks de setImmediate.' },
        { label: 'close callbacks', detail: 'Executa eventos de fechamento, como socket.on("close").' },
        { label: 'Volta ao início ou encerra', detail: 'Se ainda há timers, handles ou I/O pendentes, começa outra volta. Senão, o processo termina.' },
      ],
      caption:
        'Entre um callback e o próximo, em qualquer fase: o Node.js esvazia a fila de process.nextTick e depois a fila de microtasks (Promises).',
    },
  ],
  practice: {
    goal:
      'Ver na prática o efeito de bloquear o event loop: um servidor com uma rota que bloqueia, outra que espera sem bloquear, e uma rota rápida para comparar.',
    structure: `pratica-event-loop/
├── package.json
└── src/
    └── server.ts`,
    files: [
      {
        path: 'package.json',
        purpose: 'Configuração mínima com script de execução.',
        sample: {
          language: 'json',
          code: `{
  "name": "pratica-event-loop",
  "type": "module",
  "scripts": {
    "start": "node src/server.ts"
  }
}`,
        },
      },
      {
        path: 'src/server.ts',
        purpose: '/bloquear ocupa a thread com um laço; /nao-bloquear espera o mesmo tempo com um timer; /rapido responde na hora.',
        sample: {
          language: 'ts',
          code: `import { createServer, type ServerResponse } from 'node:http'
import { setTimeout as esperar } from 'node:timers/promises'

const PORT = Number(process.env.PORT ?? 3000)

function enviar(res: ServerResponse, corpo: object) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(corpo))
}

function bloquear(ms: number) {
  const fim = Date.now() + ms
  while (Date.now() < fim) {
    // ocupa a thread principal sem parar
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const ms = Number(url.searchParams.get('ms') ?? 3000)
  const inicio = Date.now()

  if (url.pathname === '/rapido') {
    return enviar(res, { rota: 'rapido', respondidoEm: new Date().toISOString() })
  }
  if (url.pathname === '/bloquear') {
    bloquear(ms)
    return enviar(res, { rota: 'bloquear', duracaoMs: Date.now() - inicio })
  }
  if (url.pathname === '/nao-bloquear') {
    await esperar(ms)
    return enviar(res, { rota: 'nao-bloquear', duracaoMs: Date.now() - inicio })
  }
  res.writeHead(404).end()
})

server.listen(PORT, () => console.log('Servidor em http://localhost:' + PORT))`,
          lineNotes: [
            { line: '2', note: 'node:timers/promises oferece um setTimeout que devolve Promise, ideal para usar com await.' },
            { line: '11-16', note: 'Um laço que só termina quando o tempo passa. Simula um cálculo pesado, um JSON.parse enorme ou uma regex lenta.' },
            { line: '19-20', note: 'URL separa o caminho (pathname) dos parâmetros de consulta (searchParams).' },
            { line: '27', note: 'Enquanto este laço roda, o servidor não aceita nem processa nenhuma outra requisição.' },
            { line: '31', note: 'await devolve o controle ao event loop. Durante a espera, outras requisições são atendidas normalmente.' },
          ],
        },
      },
    ],
    run: ['cd pratica-event-loop', 'node src/server.ts'],
    httpTests: [
      { method: 'GET', url: 'http://localhost:3000/rapido', expected: '200 OK imediatamente, com o horário da resposta.' },
      {
        method: 'GET',
        url: 'http://localhost:3000/bloquear?ms=5000',
        expected: 'Envie e, em outra aba do Thunder Client, envie logo em seguida GET /rapido. A rota rápida só responde quando a bloqueante termina, cerca de 5 s depois.',
      },
      {
        method: 'GET',
        url: 'http://localhost:3000/nao-bloquear?ms=5000',
        expected: 'Envie e, em outra aba, envie GET /rapido. Agora a rota rápida responde na hora, enquanto esta continua esperando os 5 s.',
      },
    ],
    expected: `/bloquear?ms=5000      → {"rota":"bloquear","duracaoMs":5000}
/nao-bloquear?ms=5000  → {"rota":"nao-bloquear","duracaoMs":5001}

As duas demoram o mesmo tempo, mas só /bloquear impede o servidor de atender outras requisições. A diferença entre as duas é o assunto da aula.`,
  },
  commonErrors: [
    {
      title: 'Ordem diferente no nível superior de um módulo ES',
      symptom:
        'Rodando o quebra-cabeça direto no corpo de um arquivo .ts ou .mjs, a Promise aparece antes do nextTick, e setTimeout(0) e setImmediate trocam de ordem entre execuções.',
      cause:
        'O módulo ES principal é avaliado dentro de uma Promise, então as microtasks são esvaziadas antes da fila de nextTick. Fora de um callback de I/O, a ordem entre timer de 0 ms e setImmediate depende de quanto tempo o processo levou para iniciar.',
      fix: 'Não dependa dessa ordem. Para estudar, rode o código dentro de um callback de I/O, como no exemplo da seção B. Em código real, use await e Promises para garantir sequência.',
    },
    {
      title: 'Trabalho síncrono pesado em uma rota',
      symptom: 'Sob carga, a latência de todas as rotas sobe ao mesmo tempo, mesmo das rotas simples.',
      cause: 'Cálculos longos, JSON.parse/stringify de payloads enormes, funções Sync (crypto, fs) ou expressões regulares com backtracking catastrófico ocupam a pilha.',
      fix: 'Use APIs assíncronas, limite o tamanho dos payloads, divida o trabalho ou leve-o para worker threads ou filas (Módulo 10).',
    },
    {
      title: 'Microtasks ou nextTick recursivos travando o I/O',
      symptom: 'O processo usa 100% de CPU e não responde, sem nenhum laço while aparente.',
      cause: 'Um callback que agenda outro nextTick (ou Promise) que agenda outro, sem fim. Essas filas são esvaziadas por completo antes do loop avançar.',
      fix: 'Use setImmediate para dividir trabalho repetitivo, pois ele permite que o I/O rode entre as etapas.',
    },
    {
      title: 'Achar que setTimeout(fn, 0) roda imediatamente',
      symptom: 'Código que depende do timer roda depois do esperado.',
      cause: 'O atraso é um mínimo. O callback ainda precisa esperar a pilha esvaziar, as microtasks e a fase timers.',
      fix: 'Para "logo depois do código atual", use queueMicrotask ou Promise.resolve().then. Para sequência real, use await.',
    },
  ],
  guidance: {
    before: ['Call Stack: a regra da pilha vazia.', 'Promises: callbacks como microtasks.', 'Node.js: libuv e o pool de threads.'],
    now: ['As fases do loop.', 'nextTick x microtasks x setImmediate x timers.', 'Como identificar e evitar o bloqueio do loop.'],
    after: ['Async/Await: await é uma microtask.', 'Módulo 10: filas e processamento assíncrono para trabalho pesado.'],
    officialDocs: [
      { label: 'Node.js · O Event Loop, timers e process.nextTick()', url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick' },
      { label: 'Node.js · Não bloqueie o Event Loop', url: 'https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop' },
      { label: 'Node.js · Entendendo process.nextTick()', url: 'https://nodejs.org/en/learn/asynchronous-work/understanding-processnexttick' },
      { label: 'Node.js API · Timers', url: 'https://nodejs.org/api/timers.html' },
      { label: 'MDN · Modelo de execução do JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model' },
      { label: 'MDN · queueMicrotask()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask' },
    ],
    complementary: [{ label: 'libuv · Visão geral do design', url: 'https://docs.libuv.org/en/v1.x/design.html' }],
  },
}

export default lesson
