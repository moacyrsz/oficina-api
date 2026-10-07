import { RaizDeAgregado } from '../../../shared/domain/raiz-de-agregado';
import { Dinheiro } from '../../../shared/domain/dinheiro';
import { gerarId } from '../../../shared/domain/identificador';
import { ErroDeValidacao, RegraDeNegocioViolada } from '../../../shared/domain/excecoes';
import { StatusOrdemServico, transicaoPermitida } from './status-ordem-servico';
import { ItemServico } from './item-servico';
import { ItemPeca } from './item-peca';
import { Orcamento } from './orcamento';
import { Aprovacao } from './aprovacao';
import {
  DiagnosticoIniciado,
  ItemPecaAdicionado,
  ItemServicoAdicionado,
  OrcamentoAprovado,
  OrcamentoEnviadoParaAprovacao,
  OrcamentoRejeitado,
  OrdemDeServicoCriada,
  OrdemFinalizada,
  VeiculoEntregue,
} from './eventos';

export interface RegistroDeStatus {
  status: StatusOrdemServico;
  em: Date;
}

interface PropsOrdemDeServico {
  codigo: string;
  clienteId: string;
  veiculoId: string;
  status: StatusOrdemServico;
  itensServico: ItemServico[];
  itensPeca: ItemPeca[];
  aprovacao: Aprovacao | null;
  historico: RegistroDeStatus[];
  criadaEm: Date;
  iniciadaExecucaoEm: Date | null;
  finalizadaEm: Date | null;
  entregueEm: Date | null;
}

const STATUS_EDITAVEIS: ReadonlyArray<StatusOrdemServico> = [
  StatusOrdemServico.RECEBIDA,
  StatusOrdemServico.EM_DIAGNOSTICO,
];

/**
 * Agregado raiz da Ordem de Servico. Concentra as invariantes do fluxo de
 * atendimento: controle de itens, geracao do orcamento, registro da decisao do
 * cliente e a maquina de estados que rege o acompanhamento da OS.
 */
export class OrdemDeServico extends RaizDeAgregado<PropsOrdemDeServico> {
  private constructor(props: PropsOrdemDeServico, id: string) {
    super(props, id);
  }

  public static criar(dados: { clienteId: string; veiculoId: string }, id?: string): OrdemDeServico {
    if (!dados.clienteId) {
      throw new ErroDeValidacao('Cliente da ordem e obrigatorio.');
    }
    if (!dados.veiculoId) {
      throw new ErroDeValidacao('Veiculo da ordem e obrigatorio.');
    }

    const identificador = id ?? gerarId();
    const agora = new Date();
    const codigo = `OS-${identificador.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

    const ordem = new OrdemDeServico(
      {
        codigo,
        clienteId: dados.clienteId,
        veiculoId: dados.veiculoId,
        status: StatusOrdemServico.RECEBIDA,
        itensServico: [],
        itensPeca: [],
        aprovacao: null,
        historico: [{ status: StatusOrdemServico.RECEBIDA, em: agora }],
        criadaEm: agora,
        iniciadaExecucaoEm: null,
        finalizadaEm: null,
        entregueEm: null,
      },
      identificador,
    );

    ordem.registrarEvento(new OrdemDeServicoCriada(identificador, codigo));
    return ordem;
  }

  public static restaurar(props: PropsOrdemDeServico, id: string): OrdemDeServico {
    return new OrdemDeServico(props, id);
  }

  public iniciarDiagnostico(): void {
    this.transicionarPara(StatusOrdemServico.EM_DIAGNOSTICO);
    this.registrarEvento(new DiagnosticoIniciado(this.id));
  }

  public adicionarServico(item: ItemServico): void {
    this.garantirEditavel();
    this.props.itensServico.push(item);
    this.registrarEvento(new ItemServicoAdicionado(this.id, item.servicoId));
  }

  public adicionarPeca(item: ItemPeca): void {
    this.garantirEditavel();
    this.props.itensPeca.push(item);
    this.registrarEvento(new ItemPecaAdicionado(this.id, item.pecaId));
  }

  public enviarParaAprovacao(): void {
    if (this.props.itensServico.length === 0 && this.props.itensPeca.length === 0) {
      throw new RegraDeNegocioViolada('Nao e possivel enviar um orcamento sem itens.');
    }
    this.transicionarPara(StatusOrdemServico.AGUARDANDO_APROVACAO);
    this.registrarEvento(
      new OrcamentoEnviadoParaAprovacao(this.id, this.calcularOrcamento().valorTotal.centavos),
    );
  }

  public aprovarOrcamento(): void {
    this.props.aprovacao = Aprovacao.aprovar(new Date());
    this.transicionarPara(StatusOrdemServico.EM_EXECUCAO);
    this.props.iniciadaExecucaoEm = new Date();
    this.registrarEvento(new OrcamentoAprovado(this.id));
  }

  public rejeitarOrcamento(motivo?: string): void {
    this.props.aprovacao = Aprovacao.rejeitar(new Date(), motivo);
    this.transicionarPara(StatusOrdemServico.EM_DIAGNOSTICO);
    this.registrarEvento(new OrcamentoRejeitado(this.id, motivo));
  }

  public finalizar(): void {
    this.transicionarPara(StatusOrdemServico.FINALIZADA);
    this.props.finalizadaEm = new Date();
    this.registrarEvento(new OrdemFinalizada(this.id));
  }

  public entregar(): void {
    this.transicionarPara(StatusOrdemServico.ENTREGUE);
    this.props.entregueEm = new Date();
    this.registrarEvento(new VeiculoEntregue(this.id));
  }

  public calcularOrcamento(): Orcamento {
    const valorServicos = this.props.itensServico.reduce(
      (acumulado, item) => acumulado.somar(item.subtotal),
      Dinheiro.zero(),
    );
    const valorPecas = this.props.itensPeca.reduce(
      (acumulado, item) => acumulado.somar(item.subtotal),
      Dinheiro.zero(),
    );
    return Orcamento.criar(valorServicos, valorPecas);
  }

  private garantirEditavel(): void {
    if (!STATUS_EDITAVEIS.includes(this.props.status)) {
      throw new RegraDeNegocioViolada(
        `A ordem no status ${this.props.status} nao permite inclusao de itens.`,
      );
    }
  }

  private transicionarPara(destino: StatusOrdemServico): void {
    if (!transicaoPermitida(this.props.status, destino)) {
      throw new RegraDeNegocioViolada(
        `Transicao de status invalida: de ${this.props.status} para ${destino}.`,
      );
    }
    this.props.status = destino;
    this.props.historico.push({ status: destino, em: new Date() });
  }

  get codigo(): string {
    return this.props.codigo;
  }

  get clienteId(): string {
    return this.props.clienteId;
  }

  get veiculoId(): string {
    return this.props.veiculoId;
  }

  get status(): StatusOrdemServico {
    return this.props.status;
  }

  get itensServico(): ReadonlyArray<ItemServico> {
    return [...this.props.itensServico];
  }

  get itensPeca(): ReadonlyArray<ItemPeca> {
    return [...this.props.itensPeca];
  }

  get aprovacao(): Aprovacao | null {
    return this.props.aprovacao;
  }

  get historico(): ReadonlyArray<RegistroDeStatus> {
    return [...this.props.historico];
  }

  get orcamento(): Orcamento {
    return this.calcularOrcamento();
  }

  get criadaEm(): Date {
    return this.props.criadaEm;
  }

  get iniciadaExecucaoEm(): Date | null {
    return this.props.iniciadaExecucaoEm;
  }

  get finalizadaEm(): Date | null {
    return this.props.finalizadaEm;
  }

  get entregueEm(): Date | null {
    return this.props.entregueEm;
  }

  /**
   * Duracao da execucao em milissegundos (do inicio da execucao ate a
   * finalizacao). Retorna null enquanto a ordem nao tiver sido finalizada.
   * Usado no calculo do tempo medio de execucao dos servicos.
   */
  get duracaoExecucaoEmMs(): number | null {
    if (!this.props.iniciadaExecucaoEm || !this.props.finalizadaEm) {
      return null;
    }
    return this.props.finalizadaEm.getTime() - this.props.iniciadaExecucaoEm.getTime();
  }
}
