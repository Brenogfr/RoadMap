import type { Module } from '../../types/roadmap'
import { m01Practice } from './practice'

/**
 * Módulo 01. Aqui ficam só os metadados (leves); cada aula e a avaliação
 * são carregadas sob demanda com import(), em arquivos separados no build.
 *
 * Ordem ajustada aos pré-requisitos: Event Loop vem depois de Call Stack
 * e Promises, porque só faz sentido quando os dois já estão claros.
 */
export const m01: Module = {
  id: 'm01',
  number: 1,
  title: 'Fundamentos de programação Back-end',
  label: 'Fundamentos',
  accent: 'blue',
  description:
    'A base de tudo o que vem depois: a linguagem, o runtime, como o Node.js executa código assíncrono e como funciona o protocolo que toda API usa.',
  topics: [
    {
      id: 'm01-javascript',
      title: 'JavaScript aprofundado',
      summary: 'Valor x referência, escopo, closures, this, funções, métodos de array e módulos.',
      loadLesson: () => import('./javascript').then((m) => m.default),
    },
    {
      id: 'm01-typescript',
      title: 'TypeScript',
      summary: 'Tipos estáticos sobre o JavaScript: o que o compilador garante e o que ele não garante.',
      loadLesson: () => import('./typescript').then((m) => m.default),
    },
    {
      id: 'm01-nodejs',
      title: 'Node.js',
      summary: 'O runtime que executa JavaScript no servidor: V8, libuv, I/O não bloqueante e APIs nativas.',
      loadLesson: () => import('./nodejs').then((m) => m.default),
    },
    {
      id: 'm01-call-stack',
      title: 'Call Stack',
      summary: 'A pilha de chamadas: como o motor sabe onde está, como ler um stack trace e o que é stack overflow.',
      loadLesson: () => import('./call-stack').then((m) => m.default),
    },
    {
      id: 'm01-promises',
      title: 'Promises',
      summary: 'Um valor que chega depois: estados, encadeamento, tratamento de falhas e execução em paralelo.',
      loadLesson: () => import('./promises').then((m) => m.default),
    },
    {
      id: 'm01-event-loop',
      title: 'Event Loop',
      summary: 'Como o Node.js decide qual callback roda a seguir: fases, microtasks e o que significa bloquear o loop.',
      loadLesson: () => import('./event-loop').then((m) => m.default),
    },
    {
      id: 'm01-async-await',
      title: 'Async/Await',
      summary: 'Código assíncrono com cara de sequencial: o que await pausa, o que não pausa e as armadilhas comuns.',
      loadLesson: () => import('./async-await').then((m) => m.default),
    },
    {
      id: 'm01-error-handling',
      title: 'Tratamento de erros',
      summary: 'Erros operacionais x bugs, classes de erro, cause, tratamento centralizado e o que nunca expor ao cliente.',
      loadLesson: () => import('./error-handling').then((m) => m.default),
    },
    {
      id: 'm01-http-https',
      title: 'HTTP e HTTPS',
      summary: 'O formato de requisições e respostas, headers, a natureza stateless do HTTP e o que o TLS adiciona.',
      loadLesson: () => import('./http-https').then((m) => m.default),
    },
    {
      id: 'm01-http-methods',
      title: 'Métodos HTTP',
      summary: 'A semântica de GET, POST, PUT, PATCH e DELETE, e as propriedades que importam: seguro e idempotente.',
      loadLesson: () => import('./http-methods').then((m) => m.default),
    },
    {
      id: 'm01-status-codes',
      title: 'Status Codes',
      summary: 'O número que diz ao cliente o que aconteceu: classes, os códigos mais usados e como escolher entre eles.',
      loadLesson: () => import('./status-codes').then((m) => m.default),
    },
    {
      id: 'm01-request-lifecycle',
      title: 'Ciclo de vida de uma requisição',
      summary: 'Do clique no Send até a conexão fechar: rede, parsing, pipeline de middlewares, resposta e keep-alive.',
      loadLesson: () => import('./request-lifecycle').then((m) => m.default),
    },
  ],
  practice: m01Practice,
  loadAssessment: () => import('./assessment').then((m) => m.default),
}
