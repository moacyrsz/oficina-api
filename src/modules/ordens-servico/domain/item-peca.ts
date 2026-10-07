import { Entidade } from '../../../shared/domain/entidade';
import { Dinheiro } from '../../../shared/domain/dinheiro';
import { gerarId } from '../../../shared/domain/identificador';
import { ErroDeValidacao } from '../../../shared/domain/excecoes';

interface PropsItemPeca {
  pecaId: string;
  descricao: string;
  valorUnitario: Dinheiro;
  quantidade: number;
}

/**
 * Item de peca ou insumo de uma Ordem de Servico. Assim como o item de servico,
 * guarda o preco unitario no momento da inclusao.
 */
export class ItemPeca extends Entidade<PropsItemPeca> {
  private constructor(props: PropsItemPeca, id: string) {
    super(props, id);
  }

  public static criar(
    dados: { pecaId: string; descricao: string; valorUnitario: Dinheiro; quantidade: number },
    id?: string,
  ): ItemPeca {
    if (!dados.pecaId) {
      throw new ErroDeValidacao('Peca do item e obrigatoria.');
    }
    if (!Number.isInteger(dados.quantidade) || dados.quantidade <= 0) {
      throw new ErroDeValidacao('Quantidade da peca deve ser um inteiro positivo.');
    }
    return new ItemPeca(dados, id ?? gerarId());
  }

  public static restaurar(props: PropsItemPeca, id: string): ItemPeca {
    return new ItemPeca(props, id);
  }

  get pecaId(): string {
    return this.props.pecaId;
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
