import { Entidade } from '../../../shared/domain/entidade';
import { Dinheiro } from '../../../shared/domain/dinheiro';
import { gerarId } from '../../../shared/domain/identificador';
import { ErroDeValidacao } from '../../../shared/domain/excecoes';

interface PropsItemServico {
  servicoId: string;
  descricao: string;
  valorUnitario: Dinheiro;
  quantidade: number;
}

/**
 * Item de servico de uma Ordem de Servico. Guarda o preco unitario no momento
 * da inclusao (snapshot), de modo que a OS nao e afetada por alteracoes futuras
 * no catalogo de servicos.
 */
export class ItemServico extends Entidade<PropsItemServico> {
  private constructor(props: PropsItemServico, id: string) {
    super(props, id);
  }

  public static criar(
    dados: { servicoId: string; descricao: string; valorUnitario: Dinheiro; quantidade: number },
    id?: string,
  ): ItemServico {
    if (!dados.servicoId) {
      throw new ErroDeValidacao('Servico do item e obrigatorio.');
    }
    if (!Number.isInteger(dados.quantidade) || dados.quantidade <= 0) {
      throw new ErroDeValidacao('Quantidade do servico deve ser um inteiro positivo.');
    }
    return new ItemServico(dados, id ?? gerarId());
  }

  public static restaurar(props: PropsItemServico, id: string): ItemServico {
    return new ItemServico(props, id);
  }

  get servicoId(): string {
    return this.props.servicoId;
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get valorUnitario(): Dinheiro {
    return this.props.valorUnitario;
  }

  get quantidade(): number {
    return this.props.quantidade;
  }

  get subtotal(): Dinheiro {
    return this.props.valorUnitario.multiplicarPor(this.props.quantidade);
  }
}
