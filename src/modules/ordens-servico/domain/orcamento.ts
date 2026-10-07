import { ObjetoDeValor } from '../../../shared/domain/objeto-de-valor';
import { Dinheiro } from '../../../shared/domain/dinheiro';

interface PropsOrcamento {
  valorServicos: Dinheiro;
  valorPecas: Dinheiro;
}

/**
 * Objeto de valor que representa o orcamento de uma Ordem de Servico. O valor
 * total e sempre a soma dos servicos com as pecas, garantindo que o orcamento
 * reflita exatamente os itens incluidos.
 */
export class Orcamento extends ObjetoDeValor<PropsOrcamento> {
  private constructor(valorServicos: Dinheiro, valorPecas: Dinheiro) {
    super({ valorServicos, valorPecas });
  }

  public static criar(valorServicos: Dinheiro, valorPecas: Dinheiro): Orcamento {
    return new Orcamento(valorServicos, valorPecas);
  }

  get valorServicos(): Dinheiro {
    return this.props.valorServicos;
  }

  get valorPecas(): Dinheiro {
    return this.props.valorPecas;
  }

  get valorTotal(): Dinheiro {
    return this.props.valorServicos.somar(this.props.valorPecas);
  }
}
