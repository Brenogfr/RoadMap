import type { Module } from '../types/roadmap'
import { m01 } from './m01'
import { m02, m03, m04, m05, m06, m07, m08, m09, m10 } from './modules/outline'

export const modules: Module[] = [m01, m02, m03, m04, m05, m06, m07, m08, m09, m10]

export const totalTopics = modules.reduce((sum, m) => sum + m.topics.length, 0)
