import type { Lesson } from '../../types/roadmap'

const lesson: Lesson = {
  intro: {
    whatIs:
      'Um service é uma classe com @Injectable() que concentra as regras de negócio de um domínio: o que pode ou não acontecer, cálculos, validações de estado e acesso aos dados. Controllers (e qualquer outra parte da aplicação) usam o service; o service não sabe que existe HTTP.',
    purpose:
      'Ter um único lugar para cada regra. "Não pode haver duas tarefas com o mesmo título" vale para a rota POST, para uma importação em lote e para um job agendado. Se a regra mora no service, todos a respeitam.',
    problem:
      'Quando regras ficam no controller, elas se repetem entre rotas, ficam presas ao formato HTTP e só podem ser testadas fazendo requisições. Corrigir uma regra exige lembrar de todos os lugares onde ela foi copiada.',
    whyExists:
      'É a separação de responsabilidades aplicada a uma API: a camada de entrada (controller) traduz o protocolo; a camada de aplicação (service) decide. O Nest reforça isso com a injeção de dependência: controllers recebem services prontos.',
    whereUsed:
      'Em todo domínio de uma API Nest: TarefasService, UsuariosService, PagamentosService. Nos próximos módulos, é o service que vai conversar com o banco (Prisma) e ser coberto por testes unitários.',
  },
  technical: {
    internals: [
      '@Injectable() marca a classe como um provider: o Nest pode criá-la e injetá-la. Sem o decorator, o Nest não consegue ler as dependências do construtor dela.',
      'Por padrão, o Nest cria uma única instância do service para toda a aplicação (escopo singleton). Todas as requisições usam o mesmo objeto, por isso estado guardado em propriedades é compartilhado entre usuários.',
      'Guardar dados em um array no service serve para aprender, mas some a cada reinício e não funciona com mais de uma instância da API. No Módulo 06, o array é substituído por um banco de dados, sem mudar o controller.',
      'O service pode lançar as exceções HTTP do Nest (NotFoundException, ConflictException). É prático e comum. A alternativa mais desacoplada, erros de domínio traduzidos em outra camada, aparece no Módulo 09.',
      'Como não depende de req, res ou decorators de rota, um service pode ser instanciado e testado diretamente, como qualquer classe.',
    ],
    concepts: [
      { term: '@Injectable()', description: 'Marca a classe como provider gerenciado pelo Nest.' },
      { term: 'Regra de negócio', description: 'Uma decisão do domínio: título único, limite de pendentes, não concluir duas vezes.' },
      { term: 'Controller fino', description: 'O controller só traduz HTTP: lê parâmetros, chama o service, devolve o resultado.' },
      { term: 'Singleton', description: 'Uma instância do service para a aplicação inteira, compartilhada por todas as requisições.' },
      { term: 'Estado em memória', description: 'Útil para aprender; perde os dados no restart e não escala horizontalmente.' },
      { term: '409 Conflict', description: 'Usado quando a regra de negócio impede a operação por causa do estado atual.' },
    ],
    examples: [
      {
        title: 'controller gordo x controller fino',
        description: 'A mesma rota, antes e depois de mover a regra para o service.',
        sample: {
          filename: 'antes-e-depois.ts',
          language: 'ts',
          code: `// Antes: a regra mora na rota e só existe para requisições HTTP
@Post()
criar(@Body() corpo: { titulo: string }) {
  const existe = this.tarefas.some((t) => t.titulo === corpo.titulo);
  if (existe) throw new ConflictException('Título repetido');
  const tarefa = { id: this.tarefas.length + 1, titulo: corpo.titulo, concluida: false };
  this.tarefas.push(tarefa);
  return tarefa;
}

// Depois: a rota traduz HTTP; a regra mora no service
@Post()
criar(@Body() corpo: { titulo: string }) {
  return this.tarefasService.criar(corpo.titulo);
}`,
          lineNotes: [
            { line: '4-5', note: 'Uma importação de tarefas por planilha precisaria copiar estas linhas, e alguém um dia esquece.' },
            { line: '6-7', note: 'O controller também guarda os dados: impossível reaproveitar sem passar por HTTP.' },
            { line: '12-15', note: 'Uma linha: qualquer outra entrada (job, fila, teste) chama o mesmo criar e obedece às mesmas regras.' },
          ],
        },
      },
      {
        title: 'um service testado sem HTTP',
        description: 'Instanciar o service diretamente e verificar as regras, sem subir servidor nem fazer requisições.',
        sample: {
          filename: 'src/verificar-regras.ts',
          language: 'ts',
          code: `import { TarefasService } from './tarefas/tarefas.service.js';

const service = new TarefasService();

service.criar('Ler a documentação');
try {
  service.criar('ler a documentação');
} catch (erro) {
  console.log('Título repetido:', (erro as Error).message);
}

const tarefa = service.criar('Escrever um service');
service.concluir(tarefa.id);
try {
  service.concluir(tarefa.id);
} catch (erro) {
  console.log('Concluir duas vezes:', (erro as Error).message);
}`,
          lineNotes: [
            { line: '3', note: 'Sem dependências, o service é uma classe comum. No Módulo 08 isto vira um teste unitário com Vitest.' },
            { line: '6-7', note: 'A regra de título único ignora maiúsculas e minúsculas: "ler" e "Ler" são o mesmo título.' },
            { line: '13-16', note: 'A regra de estado: uma tarefa já concluída não pode ser concluída de novo.' },
          ],
        },
      },
    ],
  },
  flows: [
    {
      title: 'POST /tarefas com um título repetido',
      steps: [
        { label: 'O controller recebe a requisição', detail: 'Valida o formato mínimo do corpo e chama tarefasService.criar(titulo).' },
        { label: 'O service aplica as regras', detail: 'Normaliza o título e procura uma tarefa com o mesmo nome.' },
        { label: 'A regra é violada', detail: 'O service lança ConflictException com uma mensagem clara.' },
        { label: 'A exceção atravessa o controller', detail: 'O controller não precisa de try/catch: ele não sabe o que fazer com o erro.' },
        { label: 'O Nest responde 409', detail: 'No formato padrão: { message, error: "Conflict", statusCode: 409 }.' },
      ],
    },
  ],
  practice: {
    goal:
      'Dar ao TarefasService regras de negócio reais e uma nova rota para concluir tarefas, mantendo o controller sem nenhuma decisão de domínio.',
    structure: `tarefas-api/src/
├── verificar-regras.ts      (exemplo da seção B, opcional)
└── tarefas/
    ├── tarefas.module.ts
    ├── tarefas.controller.ts
    └── tarefas.service.ts`,
    files: [
      {
        path: 'src/tarefas/tarefas.service.ts',
        purpose: 'Três regras: título único (sem diferenciar maiúsculas), no máximo 5 tarefas pendentes e não concluir duas vezes.',
        sample: {
          language: 'ts',
          code: `import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

export interface Tarefa {
  id: number;
  titulo: string;
  concluida: boolean;
}

const LIMITE_PENDENTES = 5;

@Injectable()
export class TarefasService {
  private tarefas: Tarefa[] = [];
  private proximoId = 1;

  listar(concluida?: boolean): Tarefa[] {
    return concluida === undefined ? this.tarefas : this.tarefas.filter((t) => t.concluida === concluida);
  }

  buscarPorId(id: number): Tarefa {
    const tarefa = this.tarefas.find((t) => t.id === id);
    if (!tarefa) throw new NotFoundException('Tarefa ' + id + ' não encontrada');
    return tarefa;
  }

  criar(titulo: string): Tarefa {
    const normalizado = titulo.trim();
    const repetido = this.tarefas.some((t) => t.titulo.toLowerCase() === normalizado.toLowerCase());
    if (repetido) throw new ConflictException('Já existe uma tarefa com o título "' + normalizado + '"');

    const pendentes = this.tarefas.filter((t) => !t.concluida).length;
    if (pendentes >= LIMITE_PENDENTES) {
      throw new ConflictException('Limite de ' + LIMITE_PENDENTES + ' tarefas pendentes atingido. Conclua alguma antes.');
    }

    const tarefa: Tarefa = { id: this.proximoId++, titulo: normalizado, concluida: false };
    this.tarefas.push(tarefa);
    return tarefa;
  }

  concluir(id: number): Tarefa {
    const tarefa = this.buscarPorId(id);
    if (tarefa.concluida) throw new ConflictException('A tarefa ' + id + ' já está concluída');
    tarefa.concluida = true;
    return tarefa;
  }

  remover(id: number): void {
    this.buscarPorId(id);
    this.tarefas = this.tarefas.filter((t) => t.id !== id);
  }
}`,
          lineNotes: [
            { line: '9', note: 'Uma regra de negócio com nome, fora do método: fácil de encontrar e de mudar.' },
            { line: '13-14', note: 'Estado em memória, compartilhado por todas as requisições porque o service é singleton.' },
            { line: '26-29', note: 'Normalizar antes de comparar: "  Estudar " e "estudar" são o mesmo título.' },
            { line: '31-34', note: 'A regra depende do estado atual, não do formato dos dados: por isso 409, e não 400.' },
            { line: '41-46', note: 'Concluir é uma operação de domínio com nome próprio, e não um PATCH genérico de qualquer campo.' },
          ],
        },
      },
      {
        path: 'src/tarefas/tarefas.controller.ts',
        purpose: 'O controller ganha a rota PATCH /tarefas/:id/concluir e continua sem regras.',
        sample: {
          language: 'ts',
          code: `import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TarefasService, type Tarefa } from './tarefas.service.js';

@Controller('tarefas')
export class TarefasController {
  constructor(private readonly tarefasService: TarefasService) {}

  @Get()
  listar(@Query('concluida') concluida?: string): Tarefa[] {
    if (concluida === undefined) return this.tarefasService.listar();
    if (concluida !== 'true' && concluida !== 'false') {
      throw new BadRequestException('concluida deve ser true ou false');
    }
    return this.tarefasService.listar(concluida === 'true');
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number): Tarefa {
    return this.tarefasService.buscarPorId(id);
  }

  @Post()
  criar(@Body() corpo: { titulo?: unknown }): Tarefa {
    if (typeof corpo?.titulo !== 'string' || corpo.titulo.trim() === '') {
      throw new BadRequestException('titulo é obrigatório');
    }
    return this.tarefasService.criar(corpo.titulo);
  }

  @Patch(':id/concluir')
  concluir(@Param('id', ParseIntPipe) id: number): Tarefa {
    return this.tarefasService.concluir(id);
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number): void {
    this.tarefasService.remover(id);
  }
}`,
          lineNotes: [
            { line: '36-38', note: 'O controller continua validando só o formato (é texto? veio vazio?). Se o título já existe, é o service quem decide.' },
            { line: '42-45', note: 'Uma rota de ação sobre o recurso: PATCH /tarefas/1/concluir. Toda a decisão fica no service.' },
          ],
        },
      },
    ],
    run: ['cd tarefas-api', 'npm run start:dev', '# Opcional: compile e rode o exemplo da seção B', 'npm run build', 'node dist/verificar-regras.js'],
    httpTests: [
      { method: 'POST', url: 'http://localhost:3000/tarefas', body: `{ "titulo": "Estudar services" }`, expected: '201 com a tarefa de id 1.' },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "  estudar SERVICES " }`,
        expected: '409 com "Já existe uma tarefa com o título \\"estudar SERVICES\\"".',
      },
      { method: 'PATCH', url: 'http://localhost:3000/tarefas/1/concluir', expected: '200 com "concluida": true. Envie de novo: 409, já está concluída.' },
      {
        method: 'POST',
        url: 'http://localhost:3000/tarefas',
        body: `{ "titulo": "Tarefa N" }`,
        expected: 'Crie seis tarefas com títulos diferentes: a sexta pendente recebe 409 com a mensagem de limite.',
      },
    ],
    expected: `Regras aplicadas sem nenhum if de negócio no controller.
node dist/verificar-regras.js imprime:
Título repetido: Já existe uma tarefa com o título "ler a documentação"
Concluir duas vezes: A tarefa 2 já está concluída`,
  },
  commonErrors: [
    {
      title: 'Esquecer o @Injectable()',
      symptom: "Nest can't resolve dependencies of the TarefasService (?), quando o service passa a receber algo no construtor.",
      cause: 'Sem o decorator, o TypeScript não emite os metadados do construtor, e o Nest não sabe o que injetar.',
      fix: 'Todo service (e todo provider com dependências) leva @Injectable().',
    },
    {
      title: 'Guardar dados de uma requisição em propriedades do service',
      symptom: 'Usuários veem dados uns dos outros; um valor "vaza" de uma requisição para a seguinte.',
      cause: 'O service é singleton: uma propriedade como this.usuarioAtual é compartilhada por todas as requisições simultâneas.',
      fix: 'Passe dados da requisição como parâmetros dos métodos. Propriedades do service guardam só o que é da aplicação inteira.',
    },
    {
      title: 'Service que conhece req e res',
      symptom: 'Métodos como criar(req: Request) ou um service que chama res.status().',
      cause: 'A camada HTTP vazou para a regra de negócio.',
      fix: 'O controller extrai os dados e passa valores simples ao service. O service devolve dados ou lança exceções.',
    },
    {
      title: 'Validar formato no service e regra no controller',
      symptom: 'Responsabilidades trocadas: o service checa typeof e o controller procura duplicados.',
      cause: 'Falta de clareza entre "o dado tem o formato certo?" e "a operação é permitida?".',
      fix: 'Formato e tipos ficam na entrada (controller agora, DTOs no Módulo 03). Regras que dependem do estado ficam no service.',
    },
  ],
  guidance: {
    before: ['Controllers.', 'Módulo 01: Tratamento de erros e Status Codes.'],
    now: ['O que é regra de negócio.', 'Controller fino, service com as regras.', 'Singleton e o cuidado com estado.', 'Testar regras sem HTTP.'],
    after: ['Constructors e Private/Readonly: como o service chega ao controller.', 'Módulo 06: trocar o array por um banco de dados.'],
    officialDocs: [
      { label: 'NestJS · Providers (services)', url: 'https://docs.nestjs.com/providers' },
      { label: 'NestJS · Injection scopes (singleton)', url: 'https://docs.nestjs.com/fundamentals/injection-scopes' },
    ],
  },
}

export default lesson
