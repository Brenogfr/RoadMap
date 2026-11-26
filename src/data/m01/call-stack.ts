import type { Topic } from '../../types/roadmap'

export const callStack: Topic = {
  id: 'm01-call-stack',
  title: 'Call Stack',
  summary: 'A pilha de chamadas: como o motor sabe onde está, como ler um stack trace e o que é stack overflow.',
  lesson: {
    intro: {
      whatIs:
        'A call stack (pilha de chamadas) é a estrutura que o motor JavaScript usa para saber qual função está executando agora e para onde voltar quando ela terminar. Cada chamada empilha um quadro (frame); cada retorno desempilha.',
      purpose:
        'Entender a pilha permite ler stack traces para localizar bugs, entender por que uma recursão estoura a memória e, principalmente, entender a regra que sustenta todo o modelo assíncrono do Node.js: um callback só roda quando a pilha está vazia.',
      problem:
        'Sem esse modelo mental, um stack trace de 15 linhas parece ruído, um "Maximum call stack size exceeded" parece aleatório, e a ordem de execução de código assíncrono parece imprevisível.',
      whyExists:
        'Toda linguagem com funções precisa lembrar o caminho de volta de cada chamada. O JavaScript tem uma única pilha por thread, e o Node.js executa seu código em uma única thread: por isso existe só uma pilha para todo o seu código.',
      whereUsed:
        'Em toda depuração: stack traces de erros em logs de produção, no terminal, nos testes. E como base para entender Event Loop, Promises e por que código síncrono pesado trava uma API.',
    },
    technical: {
      internals: [
        'Ao chamar uma função, o motor cria um frame com os argumentos, as variáveis locais e o endereço de retorno, e o coloca no topo da pilha.',
        'A pilha é LIFO (último a entrar, primeiro a sair): a função no topo é a que está executando. Quando ela retorna, seu frame é removido e a execução continua na função de baixo.',
        'Execução até o fim (run-to-completion): uma vez iniciada, uma função não é interrompida por outro código JavaScript. Nada roda "em paralelo" na mesma thread.',
        'Um stack trace é uma foto da pilha no momento em que o Error foi criado. A primeira linha "at" é o topo (onde o erro nasceu); as de baixo são quem chamou.',
        'A pilha tem tamanho limitado. Recursão sem fim, ou profunda demais, esgota esse espaço e o motor lança RangeError: Maximum call stack size exceeded.',
        'Callbacks agendados (timers, I/O, Promises) não rodam dentro da função que os agendou: rodam depois, em uma pilha nova, quando a pilha atual esvazia.',
      ],
      concepts: [
        { term: 'Frame', description: 'O registro de uma chamada em andamento: função, argumentos, variáveis locais e ponto de retorno.' },
        { term: 'LIFO', description: 'Last In, First Out. A última função chamada é a primeira a terminar.' },
        { term: 'Stack trace', description: 'Lista dos frames no momento do erro. Lida de cima para baixo: onde quebrou, e quem chamou.' },
        { term: 'Stack overflow', description: 'Estouro do limite da pilha, quase sempre por recursão sem caso base.' },
        { term: 'Run-to-completion', description: 'Uma função síncrona roda até o fim antes de qualquer outro código JavaScript.' },
        { term: 'Pilha vazia', description: 'Condição para o event loop executar o próximo callback. Código síncrono longo atrasa todos os callbacks.' },
      ],
      examples: [
        {
          title: 'lendo um stack trace',
          description: 'Três funções encadeadas e um erro na mais interna. O stack trace mostra exatamente o caminho percorrido.',
          sample: {
            filename: 'stack-trace.ts',
            language: 'ts',
            code: `function validarPreco(preco: number) {
  if (preco <= 0) {
    throw new Error('Preço inválido: ' + preco)
  }
  return preco
}

function calcularTotal(itens: { preco: number; qtd: number }[]) {
  return itens.reduce((soma, i) => soma + validarPreco(i.preco) * i.qtd, 0)
}

function finalizarPedido() {
  return calcularTotal([{ preco: 50, qtd: 2 }, { preco: -10, qtd: 1 }])
}

try {
  finalizarPedido()
} catch (erro) {
  console.log((erro as Error).stack)
}`,
            lineNotes: [
              { line: '3', note: 'O Error captura a pilha no momento em que é criado, com validarPreco no topo.' },
              { line: '9', note: 'reduce chama o callback, que chama validarPreco. Tudo isso fica empilhado.' },
              { line: '13', note: 'O segundo item tem preço negativo: é ele que dispara o erro.' },
              { line: '17', note: 'Pilha neste ponto, do topo para a base: validarPreco → callback do reduce → Array.reduce → calcularTotal → finalizarPedido → módulo.' },
              { line: '19', note: 'error.stack é uma string com a mensagem e um "at" por frame. Em produção é o que aparece nos logs.' },
            ],
          },
        },
        {
          title: 'estouro da pilha',
          description: 'Cada chamada recursiva ocupa um frame. Com entradas grandes, a versão iterativa é a escolha segura.',
          sample: {
            filename: 'overflow.ts',
            language: 'ts',
            code: `function somaRecursiva(n: number): number {
  if (n === 0) return 0
  return n + somaRecursiva(n - 1)
}

function somaIterativa(n: number): number {
  let total = 0
  for (let i = 1; i <= n; i++) total += i
  return total
}

console.log(somaRecursiva(1_000))
console.log(somaIterativa(1_000_000))

try {
  somaRecursiva(1_000_000)
} catch (erro) {
  console.log((erro as Error).name + ': ' + (erro as Error).message)
}`,
            lineNotes: [
              { line: '2', note: 'O caso base. Sem ele, a recursão nunca para.' },
              { line: '3', note: 'A soma só acontece depois que a chamada interna retorna, então todos os frames ficam vivos ao mesmo tempo.' },
              { line: '6-10', note: 'A versão com laço usa um único frame, qualquer que seja n.' },
              { line: '12', note: 'Mil frames cabem com folga na pilha.' },
              { line: '16', note: 'Um milhão de frames excede o limite. O motor lança RangeError antes de travar o processo.' },
            ],
          },
        },
      ],
    },
    flows: [
      {
        title: 'A pilha durante finalizarPedido()',
        steps: [
          { label: 'Módulo', detail: 'O código de nível superior começa a executar: um frame na base.' },
          { label: '+ finalizarPedido', detail: 'Empilhada pela chamada dentro do try.' },
          { label: '+ calcularTotal', detail: 'Empilhada por finalizarPedido.' },
          { label: '+ Array.reduce e o callback', detail: 'reduce chama o callback uma vez por item.' },
          { label: '+ validarPreco (topo)', detail: 'No segundo item, o preço -10 dispara o throw.' },
          { label: 'Desempilhamento até o catch', detail: 'O erro sobe frame a frame até encontrar um try/catch. Se nenhum tratar, o processo termina.' },
        ],
        caption: 'O stack trace impresso é exatamente essa pilha, lida do topo (validarPreco) para a base (módulo).',
      },
    ],
    practice: {
      goal: 'Observar a pilha com console.trace, e comprovar que um callback de timer roda em uma pilha nova, sem as funções que o agendaram.',
      structure: `pratica-call-stack/
├── package.json
└── src/
    └── pilha.ts`,
      files: [
        {
          path: 'package.json',
          purpose: 'Configuração mínima de módulo ES.',
          sample: {
            language: 'json',
            code: `{
  "name": "pratica-call-stack",
  "type": "module"
}`,
          },
        },
        {
          path: 'src/pilha.ts',
          purpose: 'console.trace imprime a pilha atual sem lançar erro.',
          sample: {
            language: 'ts',
            code: `function nivel3() {
  console.trace('Dentro de nivel3')
}

function nivel2() {
  nivel3()
}

function nivel1() {
  nivel2()
  setTimeout(function depoisDoTimer() {
    console.trace('Dentro do callback do timer')
  }, 0)
}

nivel1()
console.log('Fim do código síncrono')`,
            lineNotes: [
              { line: '2', note: 'console.trace escreve a mensagem e a pilha atual na saída de erro (stderr).' },
              { line: '10', note: 'Daqui nivel2 chama nivel3. Quando o primeiro trace roda, a pilha é: nivel3 → nivel2 → nivel1 → módulo.' },
              { line: '11-13', note: 'setTimeout só agenda a função. nivel1 termina sem esperar.' },
              { line: '12', note: 'Quando o timer dispara, nivel1 já não existe na pilha. O trace mostra depoisDoTimer e funções internas do Node.js (node:internal/timers).' },
              { line: '17', note: 'Roda antes do timer, mesmo com atraso 0: o timer precisa da pilha vazia.' },
            ],
          },
        },
      ],
      run: ['cd pratica-call-stack', 'node src/pilha.ts'],
      verify:
        'Compare os dois traces. O primeiro lista nivel3, nivel2, nivel1 e o módulo. O segundo não tem nenhuma delas. Depois, crie uma função recursiva sem caso base e veja o RangeError.',
      expected: `Trace: Dentro de nivel3
    at nivel3 (.../src/pilha.ts:2:11)
    at nivel2 (.../src/pilha.ts:6:3)
    at nivel1 (.../src/pilha.ts:10:3)
    at .../src/pilha.ts:16:1
    ...
Fim do código síncrono
Trace: Dentro do callback do timer
    at Timeout.depoisDoTimer [as _onTimeout] (.../src/pilha.ts:12:13)
    at listOnTimeout (node:internal/timers:...)
    at process.processTimers (node:internal/timers:...)`,
    },
    commonErrors: [
      {
        title: 'RangeError: Maximum call stack size exceeded',
        symptom: 'O processo lança esse erro, geralmente com centenas de linhas repetidas no stack trace.',
        cause:
          'Recursão sem caso base, recursão profunda demais, ou recursão acidental: um getter que lê a si mesmo (get nome() { return this.nome }) ou duas funções que se chamam mutuamente.',
        fix: 'Procure o padrão que se repete no trace. Garanta um caso base, converta para laço quando a profundidade depender da entrada, ou corrija o nome da propriedade.',
      },
      {
        title: 'Não encontrar o próprio código no stack trace',
        symptom: 'O trace mostra linhas de node:internal e node_modules, e o erro parece vir "de dentro" da biblioteca.',
        cause: 'O topo da pilha costuma estar em código de terceiros que recebeu um valor errado do seu código.',
        fix: 'Leia de cima para baixo até a primeira linha que aponta para um arquivo seu. Quase sempre é ali que o valor errado foi passado.',
      },
      {
        title: 'Esperar que o callback "lembre" quem o agendou',
        symptom: 'O erro dentro de um setTimeout ou de um evento mostra um stack trace curto, sem a rota ou a função que o originou.',
        cause: 'O callback roda em uma pilha nova, depois que a função original já terminou.',
        fix: 'Inclua contexto na mensagem ou no log (id da requisição, parâmetros). Com async/await, o V8 reconstrói parte do caminho (async stack traces).',
      },
      {
        title: 'Laço síncrono longo travando o servidor',
        symptom: 'Enquanto um cálculo pesado roda, nenhuma outra requisição é respondida.',
        cause: 'A pilha nunca esvazia durante o laço, então o event loop não consegue executar nenhum outro callback.',
        fix: 'Evite trabalho pesado na thread principal: divida o trabalho, use worker threads ou leve para uma fila (Módulo 10). Detalhes na aula de Event Loop.',
      },
    ],
    guidance: {
      before: ['JavaScript aprofundado: funções e escopo.', 'Node.js: o modelo de thread única.'],
      now: ['Frames e o comportamento LIFO.', 'Leitura de stack traces.', 'Recursão e stack overflow.', 'A regra da pilha vazia.'],
      after: ['Promises: código que termina depois.', 'Event Loop: quem decide o próximo callback quando a pilha esvazia.'],
      officialDocs: [
        { label: 'MDN · Call stack (glossário)', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Call_stack' },
        { label: 'MDN · Modelo de execução do JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model' },
        { label: 'MDN · Error', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error' },
        { label: 'Node.js API · Errors (error.stack)', url: 'https://nodejs.org/api/errors.html' },
      ],
    },
  },
}
