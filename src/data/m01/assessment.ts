import type { Assessment } from '../../types/assessment'

/**
 * Avaliação técnica do Módulo 01.
 * Questões de escolha: corrigidas automaticamente.
 * Questões abertas: critérios confirmados pela própria pessoa; keywords só sinalizam.
 */
const assessment: Assessment = {
  moduleId: 'm01',
  questions: [
    {
      id: 'm01-q1',
      kind: 'open',
      category: 'conceitual',
      topicId: 'm01-event-loop',
      prompt:
        'Uma rota da sua API lê um arquivo grande com fs.readFileSync. Por que isso deixa a API lenta para todos os usuários, e não apenas para quem chamou essa rota? Como você corrigiria?',
      expectedAnswer:
        'readFileSync executa na thread principal e bloqueia o event loop até a leitura terminar. Como o Node.js executa todo o JavaScript em uma única thread, nenhuma outra requisição (nem timers ou outros callbacks) é processada enquanto isso: todas esperam a pilha esvaziar. A correção é usar a versão assíncrona (readFile de node:fs/promises com await), que entrega a leitura à libuv e libera o event loop.',
      criteria: [
        {
          id: 'bloqueio',
          description: 'Identifica que a leitura síncrona bloqueia a thread principal (o event loop).',
          weight: 0.4,
          keywords: ['bloque', 'trava', 'sincron', 'thread', 'event loop', 'pilha'],
        },
        {
          id: 'thread-unica',
          description: 'Explica que as outras requisições esperam porque existe uma única thread de JavaScript.',
          weight: 0.3,
          keywords: ['outras requisicoes', 'todas as requisicoes', 'todos os usuarios', 'unica thread', 'uma thread', 'single thread', 'fila', 'esperam'],
        },
        {
          id: 'assincrono',
          description: 'Propõe a versão assíncrona: readFile de node:fs/promises com await.',
          weight: 0.3,
          keywords: ['fs/promises', 'assincron', 'await', 'versao async', 'readfile com'],
        },
      ],
      reinforcement:
        'Rode a prática da aula de Event Loop: chame /bloquear?ms=5000 e, em outra aba, /rapido. Depois troque o laço por await esperar(ms) e escreva, em duas frases, o que mudou no event loop.',
    },
    {
      id: 'm01-q2',
      kind: 'choice',
      category: 'analise-de-codigo',
      topicId: 'm01-event-loop',
      prompt: 'Em que ordem as letras são impressas?',
      code: {
        language: 'ts',
        code: `import { readFile } from 'node:fs'

readFile('package.json', () => {
  setTimeout(() => console.log('A'), 0)
  setImmediate(() => console.log('B'))
  Promise.resolve().then(() => console.log('C'))
  process.nextTick(() => console.log('D'))
  console.log('E')
})`,
      },
      options: [
        { id: 'a', text: 'E, C, D, A, B' },
        { id: 'b', text: 'E, D, C, B, A' },
        { id: 'c', text: 'A, B, C, D, E' },
        { id: 'd', text: 'E, C, D, B, A' },
      ],
      correctOptionId: 'b',
      explanation:
        'E é síncrono e roda primeiro. Quando o callback termina, o Node.js esvazia a fila de nextTick (D) e depois a de microtasks (C). O loop está na fase poll: a próxima fase é check (B, setImmediate), e só na volta seguinte vem a fase timers (A).',
      reinforcement:
        'Sem rodar, escreva a ordem de um callback de I/O com dois setImmediate, um setTimeout(0) e duas Promises. Depois rode e compare. Explique cada diferença usando as fases do loop.',
    },
    {
      id: 'm01-q3',
      kind: 'choice',
      category: 'identificacao-de-erro',
      topicId: 'm01-async-await',
      prompt: 'buscarPreco é uma função async que demora 100 ms. O que este código imprime, e por quê?',
      code: {
        language: 'ts',
        code: `const ids = [1, 2, 3]
const precos: number[] = []

ids.forEach(async (id) => {
  const preco = await buscarPreco(id)
  precos.push(preco)
})

console.log(precos.length)`,
      },
      options: [
        { id: 'a', text: '3, porque o await faz o forEach esperar cada busca.' },
        { id: 'b', text: '0, porque o forEach não espera as Promises devolvidas pelo callback async.' },
        { id: 'c', text: '3, mas os preços ficam em ordem aleatória.' },
        { id: 'd', text: 'Lança um erro, porque await não pode ser usado dentro de forEach.' },
      ],
      correctOptionId: 'b',
      explanation:
        'O callback async devolve uma Promise, e o forEach simplesmente a ignora. O console.log roda logo depois de disparar as três buscas, quando nenhuma terminou. A correção é for...of com await (em sequência) ou await Promise.all(ids.map(buscarPreco)) (em paralelo).',
      reinforcement:
        'Reescreva o trecho de duas formas: com for...of e com Promise.all. Meça o tempo das duas com console.time e explique a diferença.',
    },
    {
      id: 'm01-q4',
      kind: 'open',
      category: 'identificacao-de-erro',
      topicId: 'm01-async-await',
      prompt:
        'buscarUsuario é async e rejeita quando o usuário não existe. Mesmo assim, o catch abaixo nunca roda e quem chama carregarPerfil recebe a rejeição. Explique por quê e como corrigir.',
      code: {
        language: 'ts',
        code: `async function carregarPerfil(id: number) {
  try {
    return buscarUsuario(id)
  } catch (erro) {
    console.error('Falha ao buscar usuário', erro)
    return null
  }
}`,
      },
      expectedAnswer:
        'return buscarUsuario(id) devolve a Promise sem esperar por ela. A função sai do try imediatamente; quando a Promise rejeita, o try já terminou, e a rejeição segue para quem chamou carregarPerfil. A correção é return await buscarUsuario(id), que mantém a espera (e a rejeição) dentro do try.',
      criteria: [
        {
          id: 'sem-await',
          description: 'Explica que a Promise é devolvida sem ser aguardada (falta o await).',
          weight: 0.4,
          keywords: ['sem await', 'falta await', 'faltou await', 'falta o await', 'nao espera', 'nao aguarda', 'sem esperar', 'devolve a promise', 'retorna a promise'],
        },
        {
          id: 'fora-do-try',
          description: 'Explica que a rejeição acontece depois que a função já saiu do try.',
          weight: 0.3,
          keywords: ['saiu do try', 'fora do try', 'ja saiu', 'ja terminou', 'ja retornou', 'depois'],
        },
        {
          id: 'return-await',
          description: 'Propõe return await buscarUsuario(id).',
          weight: 0.3,
          keywords: ['return await', 'await buscarusuario'],
        },
      ],
      reinforcement:
        'Monte um exemplo com uma função que rejeita após 50 ms. Teste as versões com return e com return await dentro de try/catch e registre qual delas cai no catch.',
    },
    {
      id: 'm01-q5',
      kind: 'open',
      category: 'situacao-pratica',
      topicId: 'm01-http-methods',
      prompt:
        'Um aplicativo faz POST /pedidos, a conexão cai antes da resposta chegar e o app repete a requisição automaticamente. No banco, aparecem dois pedidos idênticos. Explique por que isso aconteceu e proponha uma solução no servidor.',
      expectedAnswer:
        'POST não é idempotente: cada requisição processada cria um novo pedido. A primeira requisição chegou ao servidor e foi processada; só a resposta se perdeu. O retry criou o segundo pedido. Solução: o cliente envia um header Idempotency-Key único por operação, e o servidor guarda as chaves já processadas, devolvendo o resultado original em vez de criar outro pedido.',
      criteria: [
        {
          id: 'post-nao-idempotente',
          description: 'Afirma que POST não é idempotente: repetir cria outro recurso.',
          weight: 0.35,
          keywords: ['idempot'],
        },
        {
          id: 'primeira-processada',
          description: 'Explica que a primeira requisição foi processada e apenas a resposta se perdeu.',
          weight: 0.3,
          keywords: ['processad', 'chegou', 'resposta se perdeu', 'sem resposta', 'perdeu a resposta', 'foi criado'],
        },
        {
          id: 'chave-idempotencia',
          description: 'Propõe uma chave de idempotência (ou identificador único da operação verificado pelo servidor).',
          weight: 0.35,
          keywords: ['idempotency-key', 'idempotency key', 'chave de idempotencia', 'chave unica', 'identificador unico', 'id unico', 'duplicad'],
        },
      ],
      reinforcement:
        'Na prática de Métodos HTTP, faça o POST /tarefas aceitar um header Idempotency-Key: guarde as chaves em um Map e devolva a tarefa original quando a chave se repetir.',
    },
    {
      id: 'm01-q6',
      kind: 'open',
      category: 'justificativa',
      topicId: 'm01-status-codes',
      prompt:
        'A rota POST /produtos exige o papel admin. Chega uma requisição com um token válido de um cliente comum e um corpo com preco: -10. Qual status code a API deve responder? Justifique, e explique por que não seria 400 nem 401.',
      expectedAnswer:
        '403 Forbidden. A identidade é conhecida (o token é válido), mas o papel não tem permissão. A autorização é verificada antes da validação do corpo: quem não pode criar produtos nem chega à validação, então não é 400. Não é 401 porque 401 significa que faltam credenciais válidas, e aqui elas existem.',
      criteria: [
        { id: '403', description: 'Responde 403 Forbidden.', weight: 0.4, keywords: ['403', 'forbidden'] },
        {
          id: 'ordem',
          description: 'Explica que a permissão é verificada antes da validação do corpo, por isso não é 400.',
          weight: 0.3,
          keywords: ['antes da validacao', 'antes de validar', 'antes do corpo', 'primeiro', 'ordem', 'nem chega'],
        },
        {
          id: 'nao-401',
          description: 'Diferencia de 401: o token é válido e a identidade é conhecida.',
          weight: 0.3,
          keywords: ['401', 'token valido', 'sabe quem', 'identidade', 'autenticad'],
        },
      ],
      reinforcement:
        'Escreva a sequência de verificações de um DELETE /produtos/:id (rota, método, autenticação, permissão, existência) e o status de cada falha. Depois confira com a prática da aula de Status Codes.',
    },
    {
      id: 'm01-q7',
      kind: 'choice',
      category: 'analise-de-codigo',
      topicId: 'm01-typescript',
      prompt: 'O que acontece com este código?',
      code: {
        language: 'ts',
        code: `interface Produto {
  nome: string
  preco: number
}

const body = JSON.parse('{"nome":"Mouse","preco":"abc"}') as Produto
console.log(body.preco * 2)`,
      },
      options: [
        { id: 'a', text: 'Erro de compilação, porque preco é uma string no JSON.' },
        { id: 'b', text: 'Erro em tempo de execução no JSON.parse, porque preco não é um número.' },
        { id: 'c', text: 'Compila e imprime NaN: o as só convence o compilador, nada é verificado em runtime.' },
        { id: 'd', text: 'Imprime 0, porque o TypeScript converte "abc" para número.' },
      ],
      correctOptionId: 'c',
      explanation:
        'JSON.parse devolve any, e o as Produto apenas diz ao compilador para confiar. Os tipos são apagados antes da execução, então "abc" * 2 vira NaN sem nenhum aviso. Dados externos precisam ser tratados como unknown e validados.',
      reinforcement:
        'Escreva uma função validarProduto(dados: unknown): Produto que lance um erro claro quando preco não for um número positivo, sem usar as em nenhum ponto.',
    },
    {
      id: 'm01-q8',
      kind: 'choice',
      category: 'situacao-pratica',
      topicId: 'm01-promises',
      prompt:
        'A rota GET /produtos/:id precisa dos dados do produto (obrigatórios) e das avaliações de um serviço externo, que às vezes fica fora do ar. A página deve funcionar mesmo sem as avaliações. Qual abordagem é a mais adequada?',
      options: [
        { id: 'a', text: 'Promise.all com produto e avaliações, para buscar tudo em paralelo.' },
        { id: 'b', text: 'await do produto e Promise.allSettled para as dependências opcionais, tratando cada status com um valor padrão.' },
        { id: 'c', text: 'await de cada busca em sequência, dentro de um único try/catch que responde 500 em qualquer falha.' },
        { id: 'd', text: 'Promise.race entre produto e avaliações, usando o que chegar primeiro.' },
      ],
      correctOptionId: 'b',
      explanation:
        'Promise.all rejeita na primeira falha, derrubando a página por causa de algo opcional. A sequência com um try/catch único é mais lenta e tem o mesmo problema. race descarta um dos resultados. allSettled nunca rejeita e permite tratar a falha das avaliações como uma lista vazia, mantendo o produto obrigatório.',
      reinforcement:
        'Na prática de Promises, troque allSettled por Promise.all e observe o resultado. Depois adicione um terceiro serviço opcional e garanta que a falha de qualquer opcional vire um aviso, não um erro.',
    },
  ],
}

export default assessment
