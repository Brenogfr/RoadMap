/** O que está aberto no painel lateral. */
export type Selection =
  | { kind: 'topic'; moduleId: string; topicId: string }
  | { kind: 'module'; moduleId: string }
  | null
