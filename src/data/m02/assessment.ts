import type { Assessment } from '../../types/assessment'

/**
 * Avaliação técnica do Módulo 02 (NestJS e arquitetura inicial).
 * Questões de escolha: corrigidas automaticamente.
 * Questões abertas: critérios confirmados pela própria pessoa; keywords só sinalizam.
 */
const assessment: Assessment = {
  moduleId: 'm02',
  questions: [
    {
      id: 'm02-q1',
      kind: 'open',
      category: 'conceitual',
      topicId: 'm02-services',
      prompt:
        'A regra "não pode haver duas tarefas com o mesmo título" foi escrita dentro do método criar do TarefasController. Agora a empresa quer importar tarefas de uma planilha, por uma fila. Explique por que essa regra deveria estar no service, e não no controller.',
      expectedAnswer:
        'O controller só deveria traduzir HTTP: ler parâmetros, chamar o service e devolver a resposta. Regras de negócio no service ficam em um único lugar e valem para qualquer entrada: a rota POST, o consumidor da fila ou um job. Se a regra ficar no controller, a importação precisaria copiá-la (e alguém um dia esquece ou altera só uma das cópias). Além disso, uma regra no service pode ser testada diretamente, sem fazer requisições HTTP.',
      criteria: [
        {
          id: 'lugar-unico',
          description: 'Explica que no service a regra fica em um único lugar e vale para todas as entradas (rota, fila, job).',
          weight: 0.4,
          keywords: ['um lugar', 'unico lugar', 'reutiliz', 'reaproveit', 'fila', 'qualquer entrada', 'duplica', 'copiar', 'repetir'],
        },
        {
          id: 'papel-controller',
          description: 'Afirma que o papel do controller é traduzir HTTP (parâmetros, chamada ao service, resposta).',
          weight: 0.3,
          keywords: ['traduz', 'http', 'requisic', 'camada de entrada', 'so recebe', 'apenas recebe', 'delega'],
        },
        {
          id: 'testavel',
          description: 'Menciona que a regra no service pode ser testada sem HTTP.',
          weight: 0.3,
          keywords: ['test'],
        },
      ],
      reinforcement:
        'Crie no tarefas-api um método importar(titulos: string[]) no TarefasService que reaproveite criar. Escreva um teste mostrando que um título repetido na lista é recusado pela mesma regra da rota.',
    },
    {
      id: 'm02-q2',
      kind: 'choice',
      category: 'identificacao-de-erro',
      topicId: 'm02-feature-modules',
      prompt: 'A aplicação não sobe com o erro abaixo. RelatoriosModule tem imports: [TarefasModule]. Qual é a causa mais provável?',
      code: {
        language: 'text',
        code: `Nest can't resolve dependencies of the RelatoriosController (?).
Please make sure that the argument TarefasService at index [0]
is available in the RelatoriosModule module.`,
      },
      options: [
        { id: 'a', text: 'Falta @Injectable() no RelatoriosController.' },
        { id: 'b', text: 'TarefasService não está em exports do TarefasModule.' },
        { id: 'c', text: 'RelatoriosController precisa estar nos controllers do AppModule.' },
        { id: 'd', text: 'O import do arquivo tarefas.service.js está sem a extensão.' },
      ],
      correctOptionId: 'b',
      explanation:
        'Providers são privados do módulo. Como RelatoriosModule já importa TarefasModule, o que falta é TarefasModule exportar o service. Controllers não precisam de @Injectable; registrá-lo no AppModule não muda o escopo de injeção; e um import sem extensão falharia na compilação (TS2307), não na injeção.',
      reinforcement:
        'No tarefas-api, remova o exports do TarefasModule, leia a mensagem completa e restaure. Depois remova o imports do RelatoriosModule e compare as duas mensagens.',
    },
    {
      id: 'm02-q3',
      kind: 'choice',
      category: 'analise-de-codigo',
      topicId: 'm02-decorators',
      prompt: 'MedirTempo troca descritor.value por um wrapper. Depois de adicioná-lo, GET /tarefas responde 404 e não aparece no log "Mapped". Por quê?',
      code: {
        language: 'ts',
        code: `@Controller('tarefas')
export class TarefasController {
  @MedirTempo()
  @Get()
  listar() {
    return this.tarefasService.listar();
  }
}`,
      },
      options: [
        { id: 'a', text: 'Decorators próprios não podem ser usados em controllers.' },
        { id: 'b', text: 'O @Get é aplicado primeiro e grava os metadados na função original; @MedirTempo, aplicado depois, troca a função por outra sem esses metadados.' },
        { id: 'c', text: 'A ordem não importa; o 404 vem de faltar @HttpCode(200).' },
        { id: 'd', text: 'MedirTempo precisa ser registrado em providers do módulo.' },
      ],
      correctOptionId: 'b',
      explanation:
        'Decorators são aplicados de baixo para cima. @Get grava método e caminho na função do método; @MedirTempo, acima, substitui essa função por um wrapper novo, e o Nest não encontra mais os metadados de rota. Decorators próprios funcionam em controllers (abaixo dos do Nest, ou como interceptor); @HttpCode não tem relação com o registro da rota; decorators não são providers.',
      reinforcement:
        'Reproduza o problema no tarefas-api e corrija de duas formas: movendo @MedirTempo para baixo do @Get e trocando-o por um interceptor aplicado com @UseInterceptors.',
    },
    {
      id: 'm02-q4',
      kind: 'open',
      category: 'identificacao-de-erro',
      topicId: 'm02-providers',
      prompt:
        'Um colega escreveu constructor(private readonly relogio: Relogio) {}, em que Relogio é uma interface, e registrou { provide: \'Relogio\', useValue: { agora: () => new Date() } } no módulo. A aplicação não sobe: "the argument at index [0] is available...". Explique o problema e como corrigir.',
      code: {
        language: 'ts',
        code: `interface Relogio {
  agora(): Date;
}

@Injectable()
export class TarefasService {
  constructor(private readonly relogio: Relogio) {}
}`,
      },
      expectedAnswer:
        'Interfaces são apagadas na compilação. O metadado design:paramtypes registra apenas Object para esse parâmetro, então o Nest não sabe que deve usar o provider registrado com o token \'Relogio\'. A correção é dizer o token explicitamente com @Inject: constructor(@Inject(RELOGIO) private readonly relogio: Relogio), de preferência usando um Symbol exportado de um arquivo de tokens, para evitar erros de digitação e colisões.',
      criteria: [
        {
          id: 'interface-apagada',
          description: 'Explica que a interface não existe em tempo de execução e o metadado fica Object.',
          weight: 0.4,
          keywords: ['apagad', 'some', 'nao existe', 'compilac', 'object', 'metadado', 'paramtypes'],
        },
        {
          id: 'inject',
          description: 'Propõe @Inject com o token no parâmetro do construtor.',
          weight: 0.4,
          keywords: ['@inject', 'inject('],
        },
        {
          id: 'symbol',
          description: 'Sugere um token reutilizável (Symbol ou constante exportada) em vez de string solta.',
          weight: 0.2,
          keywords: ['symbol', 'constante', 'token export', 'arquivo de tokens'],
        },
      ],
      reinforcement:
        'Rode o script inspecionar-construtores da aula de Constructors com uma classe que depende de uma interface e confirme o Object no metadado. Depois corrija com um Symbol e @Inject e suba a aplicação.',
    },
    {
      id: 'm02-q5',
      kind: 'choice',
      category: 'analise-de-codigo',
      topicId: 'm02-fluxo',
      prompt:
        'A aplicação tem um middleware de log, um guard global, um interceptor global e a rota GET /tarefas/:id com @Param(\'id\', ParseIntPipe, PositivoPipe). Quais etapas rodam para GET /tarefas/abc?',
      options: [
        { id: 'a', text: 'Middleware, guard, interceptor (antes), ParseIntPipe falha e o exception filter monta a resposta 400.' },
        { id: 'b', text: 'Só o ParseIntPipe, porque pipes rodam antes de tudo.' },
        { id: 'c', text: 'Middleware, guard, interceptor, ParseIntPipe, PositivoPipe e controller; o 400 é montado pelo interceptor na volta.' },
        { id: 'd', text: 'Middleware e exception filter; guards e interceptors só rodam se os pipes passarem.' },
      ],
      correctOptionId: 'a',
      explanation:
        'A ordem é middleware → guards → interceptors (antes) → pipes → controller. O ParseIntPipe falha com "abc", então PositivoPipe e o controller não rodam, e a exceção vai para o filter. Pipes rodam depois de guards e interceptors; o interceptor não monta respostas de erro.',
      reinforcement:
        'Na prática de Fluxo de uma requisição, faça as requisições /tarefas/1, /tarefas/0, /tarefas/abc e /tarefas/99 e anote quais logs aparecem em cada uma. Explique a diferença entre as quatro.',
    },
    {
      id: 'm02-q6',
      kind: 'open',
      category: 'situacao-pratica',
      topicId: 'm02-services',
      prompt:
        'Para "facilitar", um service guarda o usuário da requisição em this.usuarioAtual no início de cada operação e o lê nos outros métodos. Em produção, usuários passam a ver dados uns dos outros sob carga. Explique a causa e a correção.',
      expectedAnswer:
        'Por padrão, o service é singleton: uma única instância compartilhada por todas as requisições. Com requisições simultâneas, uma sobrescreve this.usuarioAtual enquanto a outra ainda está usando o valor (por exemplo, durante um await), e os dados se misturam. A correção é passar o usuário como parâmetro dos métodos (o controller extrai da requisição e repassa) e manter nas propriedades do service apenas o que é da aplicação inteira.',
      criteria: [
        {
          id: 'singleton',
          description: 'Identifica que o service é singleton, compartilhado por todas as requisições.',
          weight: 0.4,
          keywords: ['singleton', 'uma instancia', 'unica instancia', 'compartilhad', 'mesma instancia'],
        },
        {
          id: 'concorrencia',
          description: 'Explica que requisições simultâneas sobrescrevem a propriedade (por exemplo, entre awaits).',
          weight: 0.3,
          keywords: ['simultane', 'ao mesmo tempo', 'concorr', 'sobrescrev', 'await', 'outra requisicao'],
        },
        {
          id: 'parametro',
          description: 'Propõe passar o usuário como parâmetro dos métodos, sem guardar estado da requisição no service.',
          weight: 0.3,
          keywords: ['parametro', 'argumento', 'passar o usuario', 'repass'],
        },
      ],
      reinforcement:
        'Crie um service com uma propriedade usuarioAtual e um método async que espera 100 ms antes de lê-la. Dispare duas chamadas com usuários diferentes em paralelo (Promise.all) e observe o resultado. Corrija passando o usuário como parâmetro.',
    },
    {
      id: 'm02-q7',
      kind: 'open',
      category: 'justificativa',
      topicId: 'm02-di',
      prompt:
        'No TarefasService, o limite de pendentes era uma constante e a data vinha de new Date(). Você os trocou por providers injetados (CONFIG_TAREFAS e RELOGIO). Justifique essa decisão técnica: o que ela permite que antes não era possível?',
      expectedAnswer:
        'Com as dependências injetadas, o service não decide de onde vêm a configuração e a data. Em testes, é possível injetar um relógio fixo e um limite pequeno, tornando os testes determinísticos e curtos, sem mudar o código do service. Em produção, o limite pode mudar por variável de ambiente, sem editar código. E as dependências ficam explícitas no construtor, em vez de escondidas no meio dos métodos.',
      criteria: [
        {
          id: 'testes',
          description: 'Explica que testes podem substituir as dependências (relógio fixo, limite controlado) e ficam determinísticos.',
          weight: 0.4,
          keywords: ['test', 'determin', 'fixo', 'previs', 'substitu', 'dubl', 'mock'],
        },
        {
          id: 'configuracao',
          description: 'Menciona que o comportamento muda por configuração (ambiente) sem editar o service.',
          weight: 0.3,
          keywords: ['ambiente', 'env', 'configurac', 'sem editar', 'sem mudar o codigo'],
        },
        {
          id: 'explicito',
          description: 'Aponta que as dependências ficam explícitas no construtor.',
          weight: 0.3,
          keywords: ['explicit', 'construtor', 'escondid', 'visive'],
        },
      ],
      reinforcement:
        'Escreva um teste com Test.createTestingModule que use RELOGIO fixo em 31/12 às 23:59 e verifique o criadaEm da tarefa. Depois escreva outro teste com limitePendentes: 2 e confirme o 409 na terceira tarefa.',
    },
    {
      id: 'm02-q8',
      kind: 'choice',
      category: 'conceitual',
      topicId: 'm02-private-readonly',
      prompt: 'Sobre constructor(private readonly tarefasService: TarefasService) {}, qual afirmação está correta?',
      options: [
        { id: 'a', text: 'private impede, em tempo de execução, que qualquer código leia a propriedade, e ela não aparece em console.log.' },
        { id: 'b', text: 'readonly impede que o service seja alterado internamente: suas propriedades ficam congeladas.' },
        { id: 'c', text: 'Os modificadores são verificados pelo compilador: private impede o acesso de fora da classe no código TypeScript, e readonly impede reatribuir this.tarefasService.' },
        { id: 'd', text: 'Sem private e readonly, o Nest não consegue injetar a dependência.' },
      ],
      correctOptionId: 'c',
      explanation:
        'private e readonly existem só para o compilador: no JavaScript gerado, a propriedade é comum e aparece em console.log (privacidade em execução exige #campos). readonly protege a referência, não o conteúdo do objeto. O Nest injeta pelo construtor de qualquer forma; sem um modificador, porém, o valor não é guardado em this.',
      reinforcement:
        'Rode o demonstrar-modificadores da aula de Private e Readonly e explique, em três frases, a diferença entre private, readonly e #campo com base na saída.',
    },
  ],
}

export default assessment
