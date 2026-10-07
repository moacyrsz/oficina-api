import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { AdicionarPecaUseCase } from './adicionar-peca.use-case';
import { AdicionarServicoUseCase } from './adicionar-servico.use-case';
import { AprovarOrcamentoUseCase } from './aprovar-orcamento.use-case';
import { CriarOrdemDeServicoUseCase } from './criar-ordem-de-servico.use-case';
import { EntregarVeiculoUseCase } from './entregar-veiculo.use-case';
import { EnviarOrcamentoUseCase } from './enviar-orcamento.use-case';
import { FinalizarOrdemUseCase } from './finalizar-ordem.use-case';
import { IniciarDiagnosticoUseCase } from './iniciar-diagnostico.use-case';
import { RejeitarOrcamentoUseCase } from './rejeitar-orcamento.use-case';
import {
  CatalogoDeServicosFake,
  ConsultaDeClienteFake,
  ConsultaDeVeiculoFake,
  GestaoDeEstoqueFake,
  RepositorioDeOrdensEmMemoria,
  UnidadeDeTrabalhoFake,
} from './__support__/fakes';

const ID_INEXISTENTE = '00000000-0000-0000-0000-000000000000';

describe('Casos de uso quando a ordem nao existe', () => {
  const ordens = new RepositorioDeOrdensEmMemoria();
  const uow = new UnidadeDeTrabalhoFake();
  const estoque = new GestaoDeEstoqueFake([]);
  const catalogo = new CatalogoDeServicosFake([]);

  const casos: Array<[string, () => Promise<unknown>]> = [
    ['iniciar diagnostico', () => new IniciarDiagnosticoUseCase(ordens, uow).executar(ID_INEXISTENTE)],
    ['enviar orcamento', () => new EnviarOrcamentoUseCase(ordens, uow).executar(ID_INEXISTENTE)],
    ['aprovar orcamento', () => new AprovarOrcamentoUseCase(ordens, estoque, uow).executar(ID_INEXISTENTE)],
    ['rejeitar orcamento', () => new RejeitarOrcamentoUseCase(ordens, uow).executar(ID_INEXISTENTE)],
    ['finalizar ordem', () => new FinalizarOrdemUseCase(ordens, uow).executar(ID_INEXISTENTE)],
    ['entregar veiculo', () => new EntregarVeiculoUseCase(ordens, uow).executar(ID_INEXISTENTE)],
    [
      'adicionar servico',
      () =>
        new AdicionarServicoUseCase(ordens, catalogo, uow).executar({
          ordemId: ID_INEXISTENTE,
          servicoId: 's',
          quantidade: 1,
        }),
    ],
    [
      'adicionar peca',
      () =>
        new AdicionarPecaUseCase(ordens, estoque, uow).executar({
          ordemId: ID_INEXISTENTE,
          pecaId: 'p',
          quantidade: 1,
        }),
    ],
  ];

  it.each(casos)('retorna 404 ao %s', async (_descricao, acao) => {
    await expect(acao()).rejects.toBeInstanceOf(RecursoNaoEncontrado);
  });

  it('retorna 404 ao criar ordem com veiculo inexistente', async () => {
    const clientes = new ConsultaDeClienteFake([{ id: 'c1', nome: 'Ana', documento: '52998224725' }]);
    const veiculos = new ConsultaDeVeiculoFake([]);
    const criar = new CriarOrdemDeServicoUseCase(ordens, clientes, veiculos, uow);
    await expect(
      criar.executar({ clienteId: 'c1', veiculoId: ID_INEXISTENTE }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontrado);
  });

  it('retorna 404 ao adicionar servico inexistente em ordem existente', async () => {
    const repo = new RepositorioDeOrdensEmMemoria();
    const clientes = new ConsultaDeClienteFake([{ id: 'c1', nome: 'Ana', documento: '52998224725' }]);
    const veiculos = new ConsultaDeVeiculoFake([
      { id: 'v1', clienteId: 'c1', placa: 'ABC1D23', marca: 'VW', modelo: 'Gol', ano: 2019 },
    ]);
    const criada = await new CriarOrdemDeServicoUseCase(repo, clientes, veiculos, uow).executar({
      clienteId: 'c1',
      veiculoId: 'v1',
    });
    const addServico = new AdicionarServicoUseCase(repo, new CatalogoDeServicosFake([]), uow);
    await expect(
      addServico.executar({ ordemId: criada.id, servicoId: 'inexistente', quantidade: 1 }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontrado);

    const addPeca = new AdicionarPecaUseCase(repo, new GestaoDeEstoqueFake([]), uow);
    await expect(
      addPeca.executar({ ordemId: criada.id, pecaId: 'inexistente', quantidade: 1 }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontrado);
  });
});
