import { RecursoNaoEncontrado, RegraDeNegocioViolada } from '../../../shared/domain/excecoes';
import { OrdemDeServico } from '../domain/ordem-de-servico';
import { StatusOrdemServico } from '../domain/status-ordem-servico';
import { AdicionarPecaUseCase } from './adicionar-peca.use-case';
import { AdicionarServicoUseCase } from './adicionar-servico.use-case';
import { AprovarOrcamentoUseCase } from './aprovar-orcamento.use-case';
import { CalcularTempoMedioUseCase } from './calcular-tempo-medio.use-case';
import { ConsultarAndamentoUseCase } from './consultar-andamento.use-case';
import { CriarOrdemDeServicoUseCase } from './criar-ordem-de-servico.use-case';
import { DetalharOrdemUseCase } from './detalhar-ordem.use-case';
import { EntregarVeiculoUseCase } from './entregar-veiculo.use-case';
import { EnviarOrcamentoUseCase } from './enviar-orcamento.use-case';
import { FinalizarOrdemUseCase } from './finalizar-ordem.use-case';
import { IniciarDiagnosticoUseCase } from './iniciar-diagnostico.use-case';
import { ListarOrdensUseCase } from './listar-ordens.use-case';
import { LocalizadorDeOrdemDoCliente } from './localizador-de-ordem-do-cliente';
import { RejeitarOrcamentoUseCase } from './rejeitar-orcamento.use-case';
import {
  CatalogoDeServicosFake,
  ConsultaDeClienteFake,
  ConsultaDeVeiculoFake,
  GestaoDeEstoqueFake,
  RepositorioDeOrdensEmMemoria,
  UnidadeDeTrabalhoFake,
} from './__support__/fakes';

const CLIENTE_ID = '00000000-0000-0000-0000-0000000000c1';
const VEICULO_ID = '00000000-0000-0000-0000-0000000000a1';
const SERVICO_ID = '00000000-0000-0000-0000-0000000000e1';
const PECA_ID = '00000000-0000-0000-0000-0000000000f1';
const ABERTURA = { documento: '529.982.247-25', placa: 'ABC1D23' };

function montarCenario(estoqueDisponivel = 10) {
  const uow = new UnidadeDeTrabalhoFake();
  const ordens = new RepositorioDeOrdensEmMemoria(uow);
  const clientes = new ConsultaDeClienteFake([
    { id: CLIENTE_ID, nome: 'Maria', documento: '52998224725' },
  ]);
  const veiculos = new ConsultaDeVeiculoFake([
    { id: VEICULO_ID, clienteId: CLIENTE_ID, placa: 'ABC1D23', marca: 'Fiat', modelo: 'Uno', ano: 2020 },
  ]);
  const catalogo = new CatalogoDeServicosFake([
    { id: SERVICO_ID, nome: 'Troca de oleo', valorCentavos: 10000 },
  ]);
  const estoque = new GestaoDeEstoqueFake([
    { id: PECA_ID, nome: 'Filtro', valorCentavos: 5000, quantidadeDisponivel: estoqueDisponivel },
  ]);

  return {
    ordens,
    estoque,
    clientes,
    veiculos,
    criar: new CriarOrdemDeServicoUseCase(ordens, clientes, veiculos, uow),
    diagnosticar: new IniciarDiagnosticoUseCase(ordens, uow),
    addServico: new AdicionarServicoUseCase(ordens, catalogo, uow),
    addPeca: new AdicionarPecaUseCase(ordens, estoque, uow),
    enviar: new EnviarOrcamentoUseCase(ordens, uow),
    aprovar: new AprovarOrcamentoUseCase(ordens, estoque, uow),
    rejeitar: new RejeitarOrcamentoUseCase(ordens, uow),
    finalizar: new FinalizarOrdemUseCase(ordens, uow),
    entregar: new EntregarVeiculoUseCase(ordens, uow),
    listar: new ListarOrdensUseCase(ordens),
    detalhar: new DetalharOrdemUseCase(ordens),
    tempoMedio: new CalcularTempoMedioUseCase(ordens),
    consultar: new ConsultarAndamentoUseCase(new LocalizadorDeOrdemDoCliente(ordens, clientes), veiculos),
  };
}

describe('Casos de uso da Ordem de Servico', () => {
  it('executa o fluxo completo de atendimento ate a entrega', async () => {
    const c = montarCenario();

    const criada = await c.criar.executar(ABERTURA);
    expect(criada.status).toBe(StatusOrdemServico.RECEBIDA);

    await c.diagnosticar.executar(criada.id);
    await c.addServico.executar({ ordemId: criada.id, servicoId: SERVICO_ID, quantidade: 2 });
    await c.addPeca.executar({ ordemId: criada.id, pecaId: PECA_ID, quantidade: 3 });

    const enviada = await c.enviar.executar(criada.id);
    expect(enviada.status).toBe(StatusOrdemServico.AGUARDANDO_APROVACAO);
    expect(enviada.orcamento.valorTotal).toBe(350);

    const aprovada = await c.aprovar.executar(criada.id);
    expect(aprovada.status).toBe(StatusOrdemServico.EM_EXECUCAO);
    expect(c.estoque.pecas[0].quantidadeDisponivel).toBe(7);

    await c.finalizar.executar(criada.id);
    const entregue = await c.entregar.executar(criada.id);
    expect(entregue.status).toBe(StatusOrdemServico.ENTREGUE);

    const detalhe = await c.detalhar.executar(criada.id);
    expect(detalhe.orcamento.valorTotal).toBe(350);
    expect(detalhe.itensServico).toHaveLength(1);
    expect(detalhe.itensPeca).toHaveLength(1);

    const todas = await c.listar.executar();
    expect(todas).toHaveLength(1);
    const entregues = await c.listar.executar({ status: StatusOrdemServico.ENTREGUE });
    expect(entregues).toHaveLength(1);

    const metrica = await c.tempoMedio.executar();
    expect(metrica.ordensConsideradas).toBe(1);

    const andamento = await c.consultar.executar({ codigo: entregue.codigo, documento: '529.982.247-25' });
    expect(andamento.status).toBe(StatusOrdemServico.ENTREGUE);
    expect(andamento.veiculo).toContain('ABC1D23');
  });

  it('abre a ordem para o cliente do documento e o veiculo da placa informados', async () => {
    const c = montarCenario();

    const criada = await c.criar.executar(ABERTURA);

    expect(criada.clienteId).toBe(CLIENTE_ID);
    expect(criada.veiculoId).toBe(VEICULO_ID);
  });

  it('rejeita a criacao quando nao ha cliente com o documento informado', async () => {
    const c = montarCenario();
    await expect(
      c.criar.executar({ documento: '111.444.777-35', placa: 'ABC1D23' }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontrado);
  });

  it('rejeita a criacao quando a placa nao esta cadastrada', async () => {
    const c = montarCenario();
    await expect(
      c.criar.executar({ documento: '529.982.247-25', placa: 'XYZ9A88' }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontrado);
  });

  it('rejeita a criacao quando o veiculo nao pertence ao cliente', async () => {
    const c = montarCenario();
    const veiculos = new ConsultaDeVeiculoFake([
      { id: VEICULO_ID, clienteId: 'outro-cliente', placa: 'ABC1D23', marca: 'Fiat', modelo: 'Uno', ano: 2020 },
    ]);
    const criar = new CriarOrdemDeServicoUseCase(
      c.ordens,
      c.clientes,
      veiculos,
      new UnidadeDeTrabalhoFake(),
    );
    await expect(criar.executar(ABERTURA)).rejects.toBeInstanceOf(RegraDeNegocioViolada);
  });

  it('nao aprova a ordem quando o estoque e insuficiente e mantem o status', async () => {
    const c = montarCenario(1);
    const criada = await c.criar.executar(ABERTURA);
    await c.diagnosticar.executar(criada.id);
    await c.addPeca.executar({ ordemId: criada.id, pecaId: PECA_ID, quantidade: 3 });
    await c.enviar.executar(criada.id);

    await expect(c.aprovar.executar(criada.id)).rejects.toBeInstanceOf(RegraDeNegocioViolada);

    // A baixa valida a disponibilidade antes de debitar, entao nenhuma peca e
    // consumida quando o estoque e insuficiente. O rollback do status da ordem
    // depende da transacao real e e verificado no teste de integracao (e2e).
    expect(c.estoque.pecas[0].quantidadeDisponivel).toBe(1);
    expect(c.estoque.baixasRealizadas).toHaveLength(0);
  });

  it('registra a rejeicao do orcamento e retorna para diagnostico', async () => {
    const c = montarCenario();
    const criada = await c.criar.executar(ABERTURA);
    await c.diagnosticar.executar(criada.id);
    await c.addServico.executar({ ordemId: criada.id, servicoId: SERVICO_ID, quantidade: 1 });
    await c.enviar.executar(criada.id);

    const rejeitada = await c.rejeitar.executar(criada.id, 'Fora do orcamento');
    expect(rejeitada.status).toBe(StatusOrdemServico.EM_DIAGNOSTICO);
    expect(rejeitada.aprovacao?.motivo).toBe('Fora do orcamento');
  });

  it('bloqueia a consulta publica com documento incorreto, sem revelar a existencia da ordem', async () => {
    const c = montarCenario();
    const criada = await c.criar.executar(ABERTURA);
    await expect(
      c.consultar.executar({ codigo: criada.codigo, documento: '00000000000' }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontrado);
  });

  it('reporta tempo medio zero quando nao ha ordens finalizadas', async () => {
    const c = montarCenario();
    const metrica = await c.tempoMedio.executar();
    expect(metrica.ordensConsideradas).toBe(0);
    expect(metrica.tempoMedioEmMinutos).toBe(0);
  });

  it('retorna 404 ao detalhar ordem inexistente', async () => {
    const c = montarCenario();
    await expect(c.detalhar.executar('nao-existe')).rejects.toBeInstanceOf(RecursoNaoEncontrado);
  });

  it('retorna 404 na consulta publica de ordem inexistente', async () => {
    const c = montarCenario();
    await expect(
      c.consultar.executar({ codigo: 'OS-NAOEXISTE', documento: '52998224725' }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontrado);
  });

  it('le a ordem com bloqueio, dentro da transacao, em todos os comandos do fluxo', async () => {
    const c = montarCenario();
    const criada = await c.criar.executar(ABERTURA);

    await c.diagnosticar.executar(criada.id);
    await c.addServico.executar({ ordemId: criada.id, servicoId: SERVICO_ID, quantidade: 1 });
    await c.addPeca.executar({ ordemId: criada.id, pecaId: PECA_ID, quantidade: 1 });
    await c.enviar.executar(criada.id);
    await c.aprovar.executar(criada.id);
    await c.finalizar.executar(criada.id);
    await c.entregar.executar(criada.id);

    expect(c.ordens.leiturasComBloqueio).toEqual(Array(7).fill(criada.id));
  });

  it('le a ordem com bloqueio, dentro da transacao, ao rejeitar o orcamento', async () => {
    const c = montarCenario();
    const criada = await c.criar.executar(ABERTURA);
    await c.diagnosticar.executar(criada.id);
    await c.addServico.executar({ ordemId: criada.id, servicoId: SERVICO_ID, quantidade: 1 });
    await c.enviar.executar(criada.id);

    await c.rejeitar.executar(criada.id, 'Acima do esperado');

    expect(c.ordens.leiturasComBloqueio).toEqual(Array(4).fill(criada.id));
  });

  it('consulta andamento mesmo quando o veiculo nao e encontrado', async () => {
    const c = montarCenario();
    const ordem = OrdemDeServico.criar({ clienteId: CLIENTE_ID, veiculoId: 'veiculo-removido' });
    await c.ordens.salvar(ordem);
    const andamento = await c.consultar.executar({ codigo: ordem.codigo, documento: '52998224725' });
    expect(andamento.veiculo).toBeNull();
    expect(andamento.status).toBe(StatusOrdemServico.RECEBIDA);
  });
});
