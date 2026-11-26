import type { Assessment } from '../../types/assessment'

/**
 * Avaliação técnica do Módulo 03 (DTOs e validação).
 * Questões de escolha: corrigidas automaticamente.
 * Questões abertas: critérios confirmados pela própria pessoa; keywords só sinalizam.
 * Todos os comportamentos citados foram reproduzidos no tarefas-api (NestJS 12).
 */
const assessment: Assessment = {
  moduleId: 'm03',
  questions: [
    {
      id: 'm03-q1',
      kind: 'open',
      category: 'situacao-pratica',
      topicId: 'm03-whitelist',
      prompt:
        'O service cria a tarefa com { id: this.proximoId++, concluida: false, ...dados }, e o ValidationPipe global não tem nenhuma opção. Um cliente envia { "titulo": "Pagar fornecedor", "id": 999, "concluida": true } e a tarefa é gravada com id 999 e já concluída. Explique o que aconteceu e como o módulo resolveu isso, em duas camadas.',
      code: {
        language: 'ts',
        code: `criar(dados: CriarTarefaDto): Tarefa {
  const tarefa = { id: this.proximoId++, concluida: false, ...dados };
  this.tarefas.push(tarefa);
  return tarefa;
}`,
      },
      expectedAnswer:
        'É mass assignment: o pipe valida as regras do DTO, mas sem whitelist as propriedades que o DTO não declara continuam no objeto, e o espalhamento ...dados depois dos valores padrão sobrescreve id e concluida. A primeira camada é a whitelist (com forbidNonWhitelisted para responder 400 e avisar o cliente, em vez de remover em silêncio). A segunda é o service não espalhar a entrada sobre a entidade: ele monta o objeto campo a campo, só com o que o contrato permite, e os campos controlados pelo servidor (id, concluida) nunca vêm do cliente.',
      criteria: [
        {
          id: 'causa',
          description: 'Explica que, sem whitelist, campos não declarados no DTO passam pela validação e o espalhamento sobrescreve id e concluida.',
          weight: 0.4,
          keywords: ['mass assignment', 'nao declara', 'nao declarad', 'espalh', 'spread', 'sobrescrev', 'campo extra', 'campos extras'],
        },
        {
          id: 'whitelist',
          description: 'Propõe whitelist (de preferência com forbidNonWhitelisted, para responder 400).',
          weight: 0.3,
          keywords: ['whitelist', 'forbidnonwhitelisted', 'forbid', 'should not exist'],
        },
        {
          id: 'service',
          description: 'Propõe que o service monte a entidade campo a campo, sem espalhar a entrada, mantendo os campos do servidor fora do alcance do cliente.',
          weight: 0.3,
          keywords: ['campo a campo', 'nao espalh', 'explicit', 'montar', 'monta', 'servidor controla', 'defesa em profundidade'],
        },
      ],
      reinforcement:
        'No tarefas-api, desligue whitelist e forbidNonWhitelisted e reproduza o POST com id e concluida. Depois religue só a whitelist, repita, e compare com o resultado usando também forbidNonWhitelisted.',
    },
    {
      id: 'm03-q2',
      kind: 'choice',
      category: 'identificacao-de-erro',
      topicId: 'm03-create-update',
      prompt:
        'Com AtualizarTarefaDto extends PartialType(CriarTarefaDto), o PATCH abaixo responde 500 com "TypeError: Cannot read properties of null" vindo do service. Qual é a causa?',
      code: {
        language: 'http',
        code: `PATCH /tarefas/1 HTTP/1.1
Content-Type: application/json

{"titulo":null}`,
      },
      options: [
        { id: 'a', text: 'O ValidationPipe não valida corpos de requisições PATCH.' },
        { id: 'b', text: 'O @IsOptional implícito do PartialType ignora null por padrão, então a validação do título é pulada e o service recebe null.' },
        { id: 'c', text: 'Falta @IsNotEmpty() no CriarTarefaDto: @IsString() aceita null.' },
        { id: 'd', text: 'O @Transform que apara o título não é herdado pelo PartialType.' },
      ],
      correctOptionId: 'b',
      explanation:
        'O PartialType acrescenta um opcional implícito que, por padrão, pula undefined e também null. O título null chega ao service, que chama toLowerCase() ao conferir o título único. Com PartialType(CriarTarefaDto, { skipNullProperties: false }), null volta a ser validado e o PATCH responde 400. O pipe valida qualquer método HTTP; @IsString() recusa null quando a regra roda; e o @Transform é herdado (por isso o título enviado no PATCH também é aparado).',
      reinforcement:
        'No tarefas-api, remova o { skipNullProperties: false } do AtualizarTarefaDto, envie { "titulo": null } e leia o erro no terminal. Restaure a opção e confira o 400.',
    },
    {
      id: 'm03-q3',
      kind: 'choice',
      category: 'analise-de-codigo',
      topicId: 'm03-transform',
      prompt:
        'O ValidationPipe global usa transform: true, e alguém removeu o ParseIntPipe da rota abaixo, achando que ele ficou redundante. O que GET /tarefas/abc responde?',
      code: {
        language: 'ts',
        code: `@Get(':id')
buscar(@Param('id') id: number) {
  return this.service.buscar(id);
}`,
      },
      options: [
        { id: 'a', text: '400 "Validation failed (numeric string is expected)", porque transform valida o número.' },
        { id: 'b', text: '200 com a tarefa de índice 0.' },
        { id: 'c', text: '404 "Tarefa NaN não encontrada": transform converte "abc" em NaN sem reclamar, e o service procura a tarefa NaN.' },
        { id: 'd', text: '500, porque o service recebe uma string onde esperava um número.' },
      ],
      correctOptionId: 'c',
      explanation:
        'Com transform, parâmetros primitivos são convertidos pelo tipo declarado: Number("abc") é NaN, e conversão não é validação. O service não encontra a tarefa NaN e responde 404, quando o erro é do cliente (400). O ParseIntPipe continua necessário: ele valida e converte, respondendo 400 com "Validation failed (numeric string is expected)".',
      reinforcement:
        'No tarefas-api, tire o ParseIntPipe de GET /tarefas/:id, chame /tarefas/abc e anote a resposta. Recoloque o pipe e compare.',
    },
    {
      id: 'm03-q4',
      kind: 'open',
      category: 'justificativa',
      topicId: 'm03-validacao',
      prompt:
        'A regra "tarefas de prioridade 5 precisam de prazo" foi escrita no CriarTarefaDto com @ValidateIf, e o AtualizarTarefaDto herda as regras com PartialType. Mesmo assim, PATCH /tarefas/1 com { "prioridade": 5 } em uma tarefa sem prazo é aceito. Explique por que, onde essa verificação deve ficar e com qual status responder.',
      expectedAnswer:
        'O DTO só conhece a requisição. No PATCH, o prazo não foi enviado, e o opcional implícito do Update DTO pula as regras dele; o DTO não tem como saber que a tarefa salva não tem prazo. A regra depende do estado atual, então é regra de negócio: o service busca a tarefa, calcula o resultado final (o que veio combinado com o que está salvo) e, se for prioridade 5 sem prazo, lança ConflictException (409). Erros de formato, que dependem só da requisição, continuam no DTO com 400.',
      criteria: [
        {
          id: 'dto-limite',
          description: 'Explica que o DTO conhece só a requisição e que o Update DTO pula o prazo ausente.',
          weight: 0.35,
          keywords: ['so a requisicao', 'so conhece', 'nao conhece', 'estado salvo', 'ausente', 'nao enviado', 'nao veio', 'opcional', 'pula'],
        },
        {
          id: 'service',
          description: 'Coloca a verificação no service, combinando o que veio com o que está salvo.',
          weight: 0.4,
          keywords: ['service', 'servico', 'estado', 'salv', 'combin', 'resultado final', 'regra de negocio'],
        },
        {
          id: 'status',
          description: 'Responde 409 Conflict (e distingue do 400 de formato).',
          weight: 0.25,
          keywords: ['409', 'conflict', 'conflito'],
        },
      ],
      reinforcement:
        'No tarefas-api, comente a verificação de prazo do método atualizar, reproduza o PATCH aceito e descomente. Depois classifique três regras novas (e-mail único, data de nascimento válida, no máximo 10 pendentes) em DTO ou service.',
    },
    {
      id: 'm03-q5',
      kind: 'choice',
      category: 'conceitual',
      topicId: 'm03-dtos',
      prompt: 'Por que, no Nest, um DTO de entrada é declarado como classe, e não como interface ou type?',
      options: [
        { id: 'a', text: 'Porque interfaces deixam a compilação mais lenta.' },
        { id: 'b', text: 'Porque interfaces não aceitam propriedades opcionais.' },
        { id: 'c', text: 'Porque é exigência do TypeScript strict para parâmetros de métodos decorados.' },
        { id: 'd', text: 'Porque interfaces somem na compilação: só uma classe existe em tempo de execução, pode receber decorators de validação e ser usada pelo pipe como metatype.' },
      ],
      correctOptionId: 'd',
      explanation:
        'Interfaces e types são apagados na compilação. O ValidationPipe descobre o tipo do parâmetro pelo metadado design:paramtypes; uma interface vira Object, que o pipe não valida. Uma classe existe em tempo de execução, carrega os metadados dos decorators do class-validator e pode ser instanciada por plainToInstance. As outras opções são falsas.',
      reinforcement:
        'Troque o tipo do corpo de POST /tarefas por uma interface com os mesmos campos, envie { "titulo": 123 } e veja que nada é validado. Volte para a classe.',
    },
    {
      id: 'm03-q6',
      kind: 'open',
      category: 'identificacao-de-erro',
      topicId: 'm03-respostas-invalidas',
      prompt:
        'Com a exceptionFactory configurada, o ValidationPipe lança BadRequestException({ mensagem: "Dados inválidos", erros: [...] }). Mas o filtro global de erros do Módulo 02 continua respondendo como abaixo, sem a lista de erros. Explique a causa e a correção.',
      code: {
        language: 'json',
        code: `{
  "statusCode": 400,
  "mensagem": "Bad Request Exception",
  "caminho": "/tarefas",
  "momento": "2026-05-04T12:00:00.000Z"
}`,
      },
      expectedAnswer:
        'O filtro monta a resposta com erro.message. Quando a exceção recebe um objeto, message é só o texto genérico "Bad Request Exception"; o corpo passado à exceção fica em getResponse(). A correção é o filtro ler getResponse(), usar a mensagem do corpo quando existir e repassar a lista de erros quando ela estiver presente, mantendo o mesmo formato para as outras exceções (404, 409).',
      criteria: [
        {
          id: 'causa',
          description: 'Identifica que o filtro usa erro.message, que vira o texto genérico quando a exceção recebe um objeto.',
          weight: 0.45,
          keywords: ['message', 'texto generico', 'generic', 'bad request exception', 'perde', 'descarta'],
        },
        {
          id: 'getresponse',
          description: 'Propõe ler getResponse() para obter mensagem e erros do corpo da exceção.',
          weight: 0.4,
          keywords: ['getresponse', 'corpo da excecao', 'response'],
        },
        {
          id: 'formato',
          description: 'Mantém o formato único: a lista de erros só aparece quando existe, e as outras exceções continuam iguais.',
          weight: 0.15,
          keywords: ['formato', 'consistent', 'quando existe', 'outras excecoes', '404', '409'],
        },
      ],
      reinforcement:
        'No ErrosFilter, troque temporariamente getResponse() por erro.message, envie um POST inválido e compare as respostas. Restaure e confira que 404 e 409 não ganharam o campo erros.',
    },
    {
      id: 'm03-q7',
      kind: 'choice',
      category: 'analise-de-codigo',
      topicId: 'm03-respostas-invalidas',
      prompt:
        'O ValidationPipe usa stopAtFirstError: true. Com o DTO abaixo, POST /tarefas com { "titulo": 123 } responde com qual mensagem para o título?',
      code: {
        language: 'ts',
        code: `export class CriarTarefaDto {
  @IsString({ message: 'titulo deve ser um texto' })
  @Length(3, 80, { message: 'titulo deve ter entre 3 e 80 caracteres' })
  titulo!: string;
}`,
      },
      options: [
        { id: 'a', text: '"titulo deve ter entre 3 e 80 caracteres": o decorator mais próximo da propriedade roda primeiro.' },
        { id: 'b', text: '"titulo deve ser um texto": a validação segue a ordem de leitura do código.' },
        { id: 'c', text: 'As duas mensagens: stopAtFirstError só vale entre propriedades diferentes.' },
        { id: 'd', text: 'Nenhuma: com stopAtFirstError, números são convertidos em texto antes de validar.' },
      ],
      correctOptionId: 'a',
      explanation:
        'Decorators são aplicados de baixo para cima, e na prática o mais próximo da propriedade é o primeiro a rodar. Com stopAtFirstError, a validação do campo para nesse primeiro erro, e a mensagem que aparece é a do tamanho, que não ajuda quem enviou um número. Por isso, nas aulas, a regra mais básica (o tipo) fica embaixo, junto da propriedade. stopAtFirstError vale por propriedade e não converte valores.',
      reinforcement:
        'No CriarTarefaDto do tarefas-api, inverta a ordem de @IsString e @Length, envie { "titulo": 123 } e compare a mensagem. Restaure a ordem das aulas.',
    },
    {
      id: 'm03-q8',
      kind: 'open',
      category: 'conceitual',
      topicId: 'm03-class-transformer',
      prompt:
        'Um script chama validate() diretamente no corpo recebido, um objeto literal vindo do JSON.parse, e recebe o erro "an unknown value was passed to the validate function", mesmo com o CriarTarefaDto cheio de decorators. Explique por que e o que precisa ser feito antes de validar.',
      expectedAnswer:
        'As regras do class-validator ficam guardadas nos metadados da classe. Um objeto literal não é instância de nenhuma classe, então validate não tem regras para aplicar e, na versão atual, recusa o valor desconhecido. Antes de validar é preciso criar uma instância do DTO com plainToInstance(CriarTarefaDto, corpo), do class-transformer, que também aplica @Transform e @Type. É exatamente o que o ValidationPipe faz por baixo.',
      criteria: [
        {
          id: 'metadados',
          description: 'Explica que as regras estão nos metadados da classe e que um objeto literal não é instância dela.',
          weight: 0.4,
          keywords: ['instancia', 'metadad', 'objeto literal', 'objeto comum', 'nao e da classe', 'prototipo', 'classe'],
        },
        {
          id: 'plaintoinstance',
          description: 'Indica plainToInstance (class-transformer) para criar a instância antes de validar.',
          weight: 0.4,
          keywords: ['plaintoinstance', 'class-transformer', 'class transformer', 'transformar'],
        },
        {
          id: 'pipe',
          description: 'Relaciona com o ValidationPipe, que faz os dois passos automaticamente.',
          weight: 0.2,
          keywords: ['validationpipe', 'pipe', 'automatic'],
        },
      ],
      reinforcement:
        'Escreva um script que valida o mesmo corpo de duas formas: validate(corpo) e validate(plainToInstance(CriarTarefaDto, corpo)). Compare os resultados.',
    },
  ],
}

export default assessment
