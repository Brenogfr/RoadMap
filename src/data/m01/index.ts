import type { Module } from '../../types/roadmap'
import { m01Practice } from './practice'
import { javascript } from './javascript'
import { typescript } from './typescript'
import { nodejs } from './nodejs'
import { callStack } from './call-stack'
import { promises } from './promises'
import { eventLoop } from './event-loop'
import { asyncAwait } from './async-await'
import { errorHandling } from './error-handling'
import { httpHttps } from './http-https'
import { httpMethods } from './http-methods'
import { statusCodes } from './status-codes'
import { requestLifecycle } from './request-lifecycle'

/**
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
    javascript,
    typescript,
    nodejs,
    callStack,
    promises,
    eventLoop,
    asyncAwait,
    errorHandling,
    httpHttps,
    httpMethods,
    statusCodes,
    requestLifecycle,
  ],
  practice: m01Practice,
}
