import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'Uma Promise é um objeto que representa o resultado de uma operação que ainda não terminou. Ela começa pendente e termina uma única vez: cumprida (com um valor) ou rejeitada (com um erro).',
    purpose:
      'Dar um formato padrão ao código assíncrono: encadear etapas, propagar erros para um único ponto de tratamento e combinar várias operações (em sequência ou em paralelo). É a base do async/await.',
    problem:
      'Antes das Promises, cada operação assíncrona recebia um callback. Etapas dependentes viravam callbacks dentro de callbacks (o "callback hell"), e cada nível precisava tratar o próprio erro. Esquecer um tratamento fazia o erro sumir.',
    whyExists:
      'Padronizadas no ES2015 para substituir os callbacks aninhados. Hoje quase toda API assíncrona do Node.js (fs/promises, fetch, drivers de banco, Prisma) devolve Promises.',
    whereUsed:
      'Em toda operação de I/O de uma API: consultas ao banco, leitura de arquivos, chamadas HTTP a outros serviços, envio de e-mails, filas.',
  },
  technical: {
    internals: [
      'Uma Promise tem três estados: pending, fulfilled e rejected. A transição acontece uma única vez; depois disso o estado e o valor não mudam mais.',
      'O executor passado a new Promise roda imediatamente, de forma síncrona. resolve e reject apenas mudam o estado.',
      'Os callbacks de then, catch e finally nunca rodam na hora: são agendados como microtasks e executados quando a pilha esvazia, mesmo que a Promise já esteja resolvida.',
      'then sempre devolve uma nova Promise. O valor retornado no callback vira o valor dessa nova Promise; se for outra Promise, a cadeia espera por ela.',
      'Lançar um erro dentro de then rejeita a Promise seguinte. A rejeição desce pela cadeia, pulando os then, até o primeiro catch.',
      'No Node.js 15+, uma Promise rejeitada sem nenhum tratamento encerra o processo (unhandled rejection).',
    ],
    concepts: [
      { term: 'pending / fulfilled / rejected', description: 'Os três estados. "Settled" significa que já saiu de pending.' },
      { term: 'then / catch / finally', description: 'Registram o que fazer no sucesso, na falha e em ambos os casos.' },
      { term: 'Encadeamento', description: 'Cada then recebe o resultado do anterior. Retornar uma Promise faz a cadeia esperar.' },
      { term: 'Promise.all', description: 'Executa em paralelo e cumpre com todos os resultados. Rejeita assim que qualquer uma falhar.' },
      { term: 'Promise.allSettled', description: 'Espera todas terminarem e informa o status de cada uma. Útil quando falhas parciais são aceitáveis.' },
      { term: 'Promise.race / any', description: 'race resolve com a primeira que terminar (sucesso ou falha); any, com a primeira que cumprir.' },
    ],
    examples: [
      {
        title: 'criando e encadeando',
        description: 'Transformar uma API baseada em callback (setTimeout) em Promise, e tratar sucesso e falha.',
        sample: {
          filename: 'encadeamento.ts',
          language: 'ts',
          code: `function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buscarUsuario(id: number): Promise<{ id: number; nome: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id <= 0) {
        reject(new Error('id inválido'))
        return
      }
      resolve({ id, nome: 'Usuário ' + id })
    }, 100)
  })
}

buscarUsuario(1)
  .then((usuario) => {
    console.log('encontrado:', usuario.nome)
    return esperar(50).then(() => usuario.id)
  })
  .then((id) => console.log('próxima etapa com id', id))
  .catch((erro) => console.log('falhou:', erro.message))
  .finally(() => console.log('fim da cadeia'))

buscarUsuario(-1).catch((erro) => console.log('falhou:', erro.message))`,
          lineNotes: [
            { line: '1-3', note: 'Padrão para "promisificar": o callback de setTimeout chama resolve quando o tempo acaba.' },
            { line: '6', note: 'O executor roda na hora. A Promise fica pending até resolve ou reject ser chamado.' },
            { line: '9-10', note: 'Rejeite com um Error (não com uma string) para ter mensagem e stack trace. O return evita chamar resolve depois.' },
            { line: '20', note: 'Retornar uma Promise dentro do then faz a cadeia esperar por ela. O próximo then recebe usuario.id.' },
            { line: '23', note: 'Um único catch trata falhas de qualquer etapa acima.' },
            { line: '24', note: 'finally roda nos dois casos: bom para liberar recursos ou registrar o fim.' },
            { line: '26', note: 'Esta chamada rejeita e cai direto no catch.' },
          ],
        },
      },
      {
        title: 'sequencial x paralelo',
        description: 'Três operações independentes de 200 ms: em sequência levam 600 ms; com Promise.all, cerca de 200 ms.',
        sample: {
          filename: 'paralelo.ts',
          language: 'ts',
          code: `const atraso = (ms: number, valor: string) =>
  new Promise<string>((resolve) => setTimeout(() => resolve(valor), ms))

const falha = (ms: number, mensagem: string) =>
  new Promise<string>((_, reject) => setTimeout(() => reject(new Error(mensagem)), ms))

console.time('sequencial')
atraso(200, 'usuário')
  .then(() => atraso(200, 'pedidos'))
  .then(() => atraso(200, 'endereço'))
  .then(() => console.timeEnd('sequencial'))

console.time('paralelo')
Promise.all([atraso(200, 'usuário'), atraso(200, 'pedidos'), atraso(200, 'endereço')]).then((resultados) => {
  console.timeEnd('paralelo')
  console.log(resultados)
})

Promise.allSettled([atraso(100, 'ok'), falha(100, 'serviço fora do ar')]).then((resultados) =>
  console.log(resultados.map((r) => r.status)),
)`,
          lineNotes: [
            { line: '8-11', note: 'Cada etapa só começa quando a anterior termina: 200 + 200 + 200 ms.' },
            { line: '14', note: 'As três Promises são criadas na mesma linha, então os três timers correm ao mesmo tempo.' },
            { line: '16', note: 'Os resultados chegam na mesma ordem do array de entrada, não na ordem em que terminaram.' },
            { line: '19-21', note: 'allSettled nunca rejeita: devolve { status, value } ou { status, reason } para cada item.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'Ciclo de vida de uma Promise',
      steps: [
        { label: 'new Promise(executor)', detail: 'O executor roda de forma síncrona e inicia a operação. Estado: pending.' },
        { label: 'then/catch registram reações', detail: 'Os callbacks ficam guardados na Promise, sem executar.' },
        { label: 'A operação termina', detail: 'resolve(valor) leva a fulfilled; reject(erro) ou um throw levam a rejected.' },
        { label: 'Reações viram microtasks', detail: 'Os callbacks registrados entram na fila de microtasks.' },
        { label: 'A pilha esvazia', detail: 'O Node.js executa as microtasks: then ou catch roda com o valor ou o erro.' },
        { label: 'Uma nova Promise é resolvida', detail: 'O retorno do callback resolve a Promise devolvida por then, e o ciclo continua na próxima etapa.' },
      ],
    },
  ],
  practice: {
    goal:
      'Montar o "painel" de um usuário consultando três serviços simulados: o usuário é obrigatório, pedidos e recomendações são consultados em paralelo e podem falhar sem derrubar o painel.',
    structure: `pratica-promises/
├── package.json
└── src/
    ├── servicos.ts
    └── painel.ts`,
    files: [
      {
        path: 'package.json',
        purpose: 'Configuração mínima de módulo ES.',
        sample: {
          language: 'json',
          code: `{
  "name": "pratica-promises",
  "type": "module"
}`,
        },
      },
      {
        path: 'src/servicos.ts',
        purpose: 'Serviços falsos com atrasos diferentes. O de recomendações sempre falha, para simular uma dependência fora do ar.',
        sample: {
          language: 'ts',
          code: `export interface Usuario {
  id: number
  nome: string
}

export interface Pedido {
  id: number
  total: number
}

const esperar = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export function buscarUsuario(id: number): Promise<Usuario> {
  return esperar(120).then(() => {
    if (id !== 1) throw new Error('Usuário ' + id + ' não encontrado')
    return { id, nome: 'Ana' }
  })
}

export function buscarPedidos(usuarioId: number): Promise<Pedido[]> {
  return esperar(200).then(() => (usuarioId === 1 ? [{ id: 10, total: 310 }, { id: 11, total: 90 }] : []))
}

export function buscarRecomendacoes(usuarioId: number): Promise<string[]> {
  return esperar(150).then(() => {
    throw new Error('Recomendações indisponíveis para o usuário ' + usuarioId)
  })
}`,
          lineNotes: [
            { line: '14-17', note: 'Um throw dentro de then rejeita a Promise devolvida. Quem chama recebe uma rejeição comum.' },
            { line: '21', note: 'Retornar um valor dentro do then cumpre a Promise com esse valor.' },
            { line: '24-28', note: 'Simula um serviço externo instável.' },
          ],
        },
      },
      {
        path: 'src/painel.ts',
        purpose: 'Combina os serviços: uma etapa obrigatória em sequência e duas opcionais em paralelo.',
        sample: {
          language: 'ts',
          code: `import { buscarPedidos, buscarRecomendacoes, buscarUsuario } from './servicos.ts'

function montarPainel(id: number) {
  const inicio = Date.now()

  return buscarUsuario(id).then((usuario) =>
    Promise.allSettled([buscarPedidos(usuario.id), buscarRecomendacoes(usuario.id)]).then(
      ([pedidos, recomendacoes]) => ({
        usuario: usuario.nome,
        totalGasto: pedidos.status === 'fulfilled' ? pedidos.value.reduce((s, p) => s + p.total, 0) : null,
        recomendacoes: recomendacoes.status === 'fulfilled' ? recomendacoes.value : [],
        avisos: [pedidos, recomendacoes]
          .filter((r) => r.status === 'rejected')
          .map((r) => (r as PromiseRejectedResult).reason.message),
        tempoMs: Date.now() - inicio,
      }),
    ),
  )
}

montarPainel(1)
  .then((painel) => console.log(painel))
  .catch((erro) => console.log('Erro obrigatório:', erro.message))

montarPainel(2)
  .then((painel) => console.log(painel))
  .catch((erro) => console.log('Erro obrigatório:', erro.message))`,
          lineNotes: [
            { line: '6', note: 'O usuário vem primeiro: sem ele, não há o que buscar. Se falhar, a cadeia inteira rejeita.' },
            { line: '7', note: 'Pedidos e recomendações não dependem um do outro: rodam em paralelo.' },
            { line: '8', note: 'allSettled devolve um resultado por Promise, na mesma ordem do array.' },
            { line: '10-11', note: 'Cada resultado é verificado pelo status. Uma falha vira um valor padrão, não um erro.' },
            { line: '12-14', note: 'As falhas parciais viram avisos no painel, em vez de sumirem silenciosamente.' },
            { line: '15', note: 'O tempo total fica perto de 120 + 200 ms, e não de 120 + 200 + 150.' },
            { line: '25-27', note: 'O usuário 2 não existe: a falha obrigatória chega ao catch.' },
          ],
        },
      },
    ],
    run: ['cd pratica-promises', 'node src/painel.ts'],
    verify:
      'Troque allSettled por Promise.all e rode de novo: agora a falha das recomendações derruba o painel inteiro. Essa é a decisão técnica da aula: quais falhas são aceitáveis.',
    expected: `Erro obrigatório: Usuário 2 não encontrado
{
  usuario: 'Ana',
  totalGasto: 400,
  recomendacoes: [],
  avisos: [ 'Recomendações indisponíveis para o usuário 1' ],
  tempoMs: 321
}
(o tempoMs varia um pouco, sempre perto de 320)`,
  },
  commonErrors: [
    {
      title: 'Esquecer o return dentro do then',
      symptom: 'O próximo then recebe undefined, ou roda antes da operação anterior terminar.',
      cause: 'Sem return, o callback devolve undefined e a cadeia não sabe que precisa esperar a Promise criada lá dentro.',
      fix: 'Sempre retorne a Promise ou o valor dentro do then. Em arrow functions de uma linha, o retorno é implícito.',
    },
    {
      title: 'Rejeição sem tratamento derrubando o processo',
      symptom: 'O Node.js imprime o erro e termina com código 1. Se a rejeição não for um Error, a mensagem cita UnhandledPromiseRejection.',
      cause: 'Uma Promise rejeitou e nenhum catch (ou try/catch com await) a tratou.',
      fix: 'Toda cadeia precisa terminar em um catch, ou estar dentro de um try/catch com await. Rejeite sempre com objetos Error.',
    },
    {
      title: 'Esperar em sequência o que poderia ser paralelo',
      symptom: 'A rota é lenta: o tempo é a soma de todas as consultas.',
      cause: 'Operações independentes encadeadas uma após a outra.',
      fix: 'Crie todas as Promises independentes antes e combine com Promise.all ou allSettled.',
    },
    {
      title: 'Usar Promise.all quando falhas parciais são aceitáveis',
      symptom: 'Uma dependência secundária fora do ar derruba uma resposta que poderia ser parcial.',
      cause: 'Promise.all rejeita assim que qualquer Promise falha, descartando os outros resultados.',
      fix: 'Use allSettled para dependências opcionais e trate cada status. Mantenha Promise.all quando tudo for obrigatório.',
    },
  ],
  guidance: {
    before: ['Call Stack: por que callbacks rodam depois.', 'JavaScript: funções como valores.'],
    now: ['Estados e encadeamento.', 'Propagação de erros até o catch.', 'Promise.all, allSettled, race e any.'],
    after: ['Event Loop: a fila de microtasks em detalhe.', 'Async/Await: a mesma lógica com sintaxe sequencial.'],
    officialDocs: [
      { label: 'MDN · Promise', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise' },
      { label: 'MDN · Usando Promises', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises' },
      { label: 'MDN · Promise.all', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all' },
      { label: 'Node.js · Programação assíncrona e callbacks', url: 'https://nodejs.org/en/learn/asynchronous-work/javascript-asynchronous-programming-and-callbacks' },
    ],
  },
}

export default lesson
