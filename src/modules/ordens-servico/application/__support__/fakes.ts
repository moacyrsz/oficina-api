import { UnidadeDeTrabalho } from '../../../../shared/application/unidade-de-trabalho';
import { RegraDeNegocioViolada } from '../../../../shared/domain/excecoes';
import { OrdemDeServico } from '../../domain/ordem-de-servico';
import {
  FiltroDeOrdens,
  OrdemDeServicoRepository,
} from '../../domain/ordem-de-servico.repository';
import { CatalogoDeServicos, ServicoDoCatalogo } from '../ports/catalogo-de-servicos';
import { ClienteConsultado, ConsultaDeCliente } from '../ports/consulta-de-cliente';
import { ConsultaDeVeiculo, VeiculoConsultado } from '../ports/consulta-de-veiculo';
import { GestaoDeEstoque, ItemParaBaixa, PecaDoEstoque } from '../ports/gestao-de-estoque';

/**
 * Unidade de trabalho que apenas executa a operacao (sem transacao real), mas
 * registra se ha uma transacao em andamento.
 */
export class UnidadeDeTrabalhoFake implements UnidadeDeTrabalho {
  public emTransacao = false;

  public async executar<T>(operacao: () => Promise<T>): Promise<T> {
    this.emTransacao = true;
    try {
      return await operacao();
    } finally {
      this.emTransacao = false;
    }
  }
}

/** Repositorio de ordens em memoria para os testes de caso de uso. */
export class RepositorioDeOrdensEmMemoria implements OrdemDeServicoRepository {
  public readonly dados = new Map<string, OrdemDeServico>();
  public readonly leiturasComBloqueio: string[] = [];

  constructor(private readonly unidadeDeTrabalho?: UnidadeDeTrabalhoFake) {}

  public async salvar(ordem: OrdemDeServico): Promise<void> {
    this.dados.set(ordem.id, ordem);
  }

  public async buscarPorId(id: string): Promise<OrdemDeServico | null> {
    return this.dados.get(id) ?? null;
  }

  public async buscarPorIdParaAtualizar(id: string): Promise<OrdemDeServico | null> {
    if (this.unidadeDeTrabalho && !this.unidadeDeTrabalho.emTransacao) {
      throw new Error('O bloqueio da ordem exige uma transacao ativa.');
    }
    this.leiturasComBloqueio.push(id);
    return this.dados.get(id) ?? null;
  }

  public async buscarPorCodigo(codigo: string): Promise<OrdemDeServico | null> {
    return [...this.dados.values()].find((ordem) => ordem.codigo === codigo) ?? null;
  }

  public async listar(filtro?: FiltroDeOrdens): Promise<OrdemDeServico[]> {
    const todas = [...this.dados.values()];
    return filtro?.status ? todas.filter((ordem) => ordem.status === filtro.status) : todas;
  }
}

export class CatalogoDeServicosFake implements CatalogoDeServicos {
  constructor(private readonly servicos: ServicoDoCatalogo[] = []) {}

  public async buscarServico(id: string): Promise<ServicoDoCatalogo | null> {
    return this.servicos.find((servico) => servico.id === id) ?? null;
  }
}

export class GestaoDeEstoqueFake implements GestaoDeEstoque {
  public readonly baixasRealizadas: ItemParaBaixa[] = [];

  constructor(public pecas: PecaDoEstoque[] = []) {}

  public async buscarPeca(id: string): Promise<PecaDoEstoque | null> {
    return this.pecas.find((peca) => peca.id === id) ?? null;
  }

  public async baixar(itens: ItemParaBaixa[]): Promise<void> {
    for (const item of itens) {
      const peca = this.pecas.find((candidata) => candidata.id === item.pecaId);
      if (!peca || peca.quantidadeDisponivel < item.quantidade) {
        throw new RegraDeNegocioViolada('Estoque insuficiente.');
      }
    }
    for (const item of itens) {
      const peca = this.pecas.find((candidata) => candidata.id === item.pecaId);
      if (peca) {
        peca.quantidadeDisponivel -= item.quantidade;
        this.baixasRealizadas.push(item);
      }
    }
  }
}

export class ConsultaDeClienteFake implements ConsultaDeCliente {
  constructor(private readonly clientes: ClienteConsultado[] = []) {}

  public async buscarPorId(id: string): Promise<ClienteConsultado | null> {
    return this.clientes.find((cliente) => cliente.id === id) ?? null;
  }

  public async buscarPorDocumento(documento: string): Promise<ClienteConsultado | null> {
    const digitos = documento.replace(/\D/g, '');
    return this.clientes.find((cliente) => cliente.documento === digitos) ?? null;
  }
}

export class ConsultaDeVeiculoFake implements ConsultaDeVeiculo {
  constructor(private readonly veiculos: VeiculoConsultado[] = []) {}

  public async buscarPorId(id: string): Promise<VeiculoConsultado | null> {
    return this.veiculos.find((veiculo) => veiculo.id === id) ?? null;
  }

  public async buscarPorPlaca(placa: string): Promise<VeiculoConsultado | null> {
    const normalizada = placa.toUpperCase().replace(/[\s-]/g, '');
    return this.veiculos.find((veiculo) => veiculo.placa === normalizada) ?? null;
  }
}
