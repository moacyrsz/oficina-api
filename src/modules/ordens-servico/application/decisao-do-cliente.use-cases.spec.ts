import { RecursoNaoEncontrado, RegraDeNegocioViolada } from '../../../shared/domain/excecoes';
import { DecisaoOrcamento } from '../domain/aprovacao';
import { StatusOrdemServico } from '../domain/status-ordem-servico';
import { AdicionarPecaUseCase } from './adicionar-peca.use-case';
import { AprovarOrcamentoPeloClienteUseCase } from './aprovar-orcamento-pelo-cliente.use-case';
import { AprovarOrcamentoUseCase } from './aprovar-orcamento.use-case';
import { ConsultarAndamentoUseCase } from './consultar-andamento.use-case';
import { CriarOrdemDeServicoUseCase } from './criar-ordem-de-servico.use-case';
import { DetalharOrdemUseCase } from './detalhar-ordem.use-case';
import { EnviarOrcamentoUseCase } from './enviar-orcamento.use-case';
import { IniciarDiagnosticoUseCase } from './iniciar-diagnostico.use-case';
import { LocalizadorDeOrdemDoCliente } from './localizador-de-ordem-do-cliente';
import { RejeitarOrcamentoPeloClienteUseCase } from './rejeitar-orcamento-pelo-cliente.use-case';
import { RejeitarOrcamentoUseCase } from './rejeitar-orcamento.use-case';
import {
  ConsultaDeClienteFake,
  ConsultaDeVeiculoFake,
  GestaoDeEstoqueFake,
  RepositorioDeOrdensEmMemoria,
  UnidadeDeTrabalhoFake,
} from './__support__/fakes';

const DOCUMENTO = '529.982.247-25';
const PECA_ID = '00000000-0000-0000-0000-0000000000f1';

async function ordemAguardandoAprovacao() {
  const uow = new UnidadeDeTrabalhoFake();
  const ordens = new RepositorioDeOrdensEmMemoria(uow);
  const clientes = new ConsultaDeClienteFake([
    { id: 'c1', nome: 'Maria', documento: '52998224725' },
  ]);
  const veiculos = new ConsultaDeVeiculoFake([
    { id: 'v1', clienteId: 'c1', placa: 'ABC1D23', marca: 'Fiat', modelo: 'Uno', ano: 2020 },
  ]);
  const estoque = new GestaoDeEstoqueFake([
    { id: PECA_ID, nome: 'Filtro', valorCentavos: 5000, quantidadeDisponivel: 10 },
  ]);

  const criada = await new CriarOrdemDeServicoUseCase(ordens, clientes, veiculos, uow).executar({
    documento: DOCUMENTO,
    placa: 'ABC1D23',
  });
  await new IniciarDiagnosticoUseCase(ordens, uow).executar(criada.id);
  await new AdicionarPecaUseCase(ordens, estoque, uow).executar({
    ordemId: criada.id,
    pecaId: PECA_ID,
    quantidade: 3,
  });
  const enviar = () => new EnviarOrcamentoUseCase(ordens, uow).executar(criada.id);

  const localizador = new LocalizadorDeOrdemDoCliente(ordens, clientes);
  const consultar = new ConsultarAndamentoUseCase(localizador, veiculos);
  return {
    ordem: criada,
    estoque,
    enviar,
    detalhar: new DetalharOrdemUseCase(ordens),
    aprovarPeloCliente: new AprovarOrcamentoPeloClienteUseCase(
      localizador,
      new AprovarOrcamentoUseCase(ordens, estoque, uow),
      consultar,
    ),
    rejeitarPeloCliente: new RejeitarOrcamentoPeloClienteUseCase(
      localizador,
      new RejeitarOrcamentoUseCase(ordens, uow),
      consultar,
    ),
  };
}

describe('Decisao do orcamento pelo cliente', () => {
  it('aprova com o codigo da OS e o documento, inicia a execucao e baixa o estoque', async () => {
    const c = await ordemAguardandoAprovacao();
    await c.enviar();

    const andamento = await c.aprovarPeloCliente.executar({
      codigo: c.ordem.codigo,
      documento: DOCUMENTO,
    });

    expect(andamento.status).toBe(StatusOrdemServico.EM_EXECUCAO);
    expect(andamento.decisaoOrcamento).toBe(DecisaoOrcamento.APROVADO);
    expect(c.estoque.pecas[0].quantidadeDisponivel).toBe(7);
  });

  it('rejeita informando o motivo e devolve a OS para diagnostico', async () => {
    const c = await ordemAguardandoAprovacao();
    await c.enviar();

    const andamento = await c.rejeitarPeloCliente.executar({
      codigo: c.ordem.codigo.toLowerCase(),
      documento: '52998224725',
      motivo: 'Vou fazer em outro momento',
    });

    expect(andamento.status).toBe(StatusOrdemServico.EM_DIAGNOSTICO);
    expect(andamento.decisaoOrcamento).toBe(DecisaoOrcamento.REJEITADO);
    const detalhe = await c.detalhar.executar(c.ordem.id);
    expect(detalhe.aprovacao?.motivo).toBe('Vou fazer em outro momento');
  });

  it('nao aceita a decisao com o documento de outra pessoa e mantem a OS aguardando', async () => {
    const c = await ordemAguardandoAprovacao();
    await c.enviar();

    await expect(
      c.aprovarPeloCliente.executar({ codigo: c.ordem.codigo, documento: '111.444.777-35' }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontrado);

    const detalhe = await c.detalhar.executar(c.ordem.id);
    expect(detalhe.status).toBe(StatusOrdemServico.AGUARDANDO_APROVACAO);
    expect(c.estoque.pecas[0].quantidadeDisponivel).toBe(10);
  });

  it('recusa a decisao quando o orcamento ainda nao foi enviado', async () => {
    const c = await ordemAguardandoAprovacao();

    await expect(
      c.aprovarPeloCliente.executar({ codigo: c.ordem.codigo, documento: DOCUMENTO }),
    ).rejects.toBeInstanceOf(RegraDeNegocioViolada);
  });
});
