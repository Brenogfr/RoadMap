/** O que está aberto no painel lateral. */
export type Selection =
  | { kind: 'topic'; moduleId: string; topicId: string }
  | { kind: 'module'; moduleId: string }
  /** Avaliação: nova tentativa, ou o feedback de uma tentativa anterior (attemptId). */
  | { kind: 'assessment'; moduleId: string; attemptId?: string }
  | null
