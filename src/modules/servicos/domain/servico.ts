import { RaizDeAgregado } from '../../../shared/domain/raiz-de-agregado';
import { gerarId } from '../../../shared/domain/identificador';
import { ErroDeValidacao } from '../../../shared/domain/excecoes';
import { Dinheiro } from '../../../shared/domain/dinheiro';

interface PropsServico {
  nome: string;
  descricao: string;
  valor: Dinheiro;
}

/**
 * Servico ofertado pela oficina (por exemplo troca de oleo ou alinhamento).
 * Compoe o catalogo consultado pelas ordens de servico. O preco e representado
 * pelo objeto de valor Dinheiro, que guarda o montante internamente em centavos
 * e impede valores negativos.
 */
export class Servico extends RaizDeAgregado<PropsServico> {
  private constructor(props: PropsServico, id: string) {
    super(props, id);
  }

  public static criar(
    dados: { nome: string; descricao?: string; valor: Dinheiro },
    id?: string,
  ): Servico {
    const nome = dados.nome?.trim();
    if (!nome) {
      throw new ErroDeValidacao('Nome do servico e obrigatorio.');
    }

    const descricao = dados.descricao?.trim() ?? '';

    return new Servico({ nome, descricao, valor: dados.valor }, id ?? gerarId());
  }

  public static restaurar(props: PropsServico, id: string): Servico {
    return new Servico(props, id);
  }

  get nome(): string {
    return this.props.nome;
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get valor(): Dinheiro {
    return this.props.valor;
  }

  /**
   * Atualiza os dados do servico. Apenas os campos informados sao alterados;
   * os demais permanecem como estao. O nome, quando informado, continua sendo
   * obrigatorio.
   */
  public atualizar(dados: { nome?: string; descricao?: string; valor?: Dinheiro }): void {
    if (dados.nome !== undefined) {
      const nome = dados.nome.trim();
      if (!nome) {
        throw new ErroDeValidacao('Nome do servico e obrigatorio.');
      }
      this.props.nome = nome;
    }

    if (dados.descricao !== undefined) {
      this.props.descricao = dados.descricao.trim();
    }

    if (dados.valor !== undefined) {
      this.props.valor = dados.valor;
    }
  }
}
