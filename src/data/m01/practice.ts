import type { PracticeTask } from '../../types/roadmap'

export const m01Practice: PracticeTask = {
  kind: 'exercise',
  title: 'Servidor de notas sem framework',
  description:
    'Construir uma pequena API de notas usando apenas o módulo node:http e TypeScript, sem Express nem NestJS. O objetivo é sentir na mão tudo o que um framework faz por você: ler o corpo, rotear, validar, escolher o status code e tratar erros.',
  requirements: [
    'GET /notas lista as notas; GET /notas/:id devolve uma nota.',
    'POST /notas cria uma nota com "titulo" (obrigatório) e "conteudo".',
    'DELETE /notas/:id remove uma nota.',
    'As notas são salvas em um arquivo notas.json usando node:fs/promises e async/await.',
    'Um único ponto trata erros e converte cada erro em uma resposta JSON com o status code adequado.',
    'Cada resposta tem o header X-Request-Id e cada requisição é registrada no console com método, rota, status e duração.',
  ],
  doneWhen: [
    'Respostas usam 200, 201, 204, 400, 404, 405 e 500 nos casos certos.',
    'JSON inválido no corpo devolve 400, e não derruba o servidor.',
    'Nenhuma operação síncrona de disco (readFileSync/writeFileSync) é usada dentro das rotas.',
    'Você consegue desenhar o caminho de uma requisição, do Thunder Client até o arquivo e de volta.',
  ],
  hints: [
    'Reaproveite as funções readJson e sendJson das aulas de Métodos HTTP e Status Codes.',
    'Crie uma classe HttpError com statusCode e lance-a nas rotas; o tratador central decide a resposta.',
    'Rode com: node src/server.ts (Node 22.18+ executa TypeScript diretamente).',
  ],
}
