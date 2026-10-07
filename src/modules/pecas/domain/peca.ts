import { RaizDeAgregado } from '../../../shared/domain/raiz-de-agregado';
import { Dinheiro } from '../../../shared/domain/dinheiro';
import { gerarId } from '../../../shared/domain/identificador';
import { ErroDeValidacao, RegraDeNegocioViolada } from '../../../shared/domain/excecoes';

interface PropsPeca {
  nome: string;
  descricao: string;
  precoUnitario: Dinheiro;
  quantidadeEmEstoque: number;
}

/**
 * Peca ou insumo comercializado pela oficina. O agregado e responsavel pelo
 * controle do proprio estoque: garante que a quantidade disponivel nunca fique
 * negativa e so permite baixas ate o saldo existente. O preco e guardado como
 * objeto de valor monetario para evitar erros de arredondamento.
 */
export class Peca extends RaizDeAgregado<PropsPeca> {
  private constructor(props: PropsPeca, id: string) {
    super(props, id);
  }

  public static criar(
    dados: {
      nome: string;
      descricao?: string;
      precoUnitario: Dinheiro;
      quantidadeEmEstoque: number;
    },
    id?: string,
  ): Peca {
    const nome = dados.nome?.trim();
    if (!nome) {
      throw new ErroDeValidacao('Nome da peca e obrigatorio.');
    }

    if (
      !Number.isInteger(dados.quantidadeEmEstoque) ||
      dados.quantidadeEmEstoque < 0
    ) {
      throw new ErroDeValidacao(
        'Quantidade em estoque deve ser um inteiro maior ou igual a zero.',
      );
    }

    return new Peca(
      {
        nome,
        descricao: dados.descricao?.trim() ?? '',
        precoUnitario: dados.precoUnitario,
        quantidadeEmEstoque: dados.quantidadeEmEstoque,
      },
      id ?? gerarId(),
    );
  }

  public static restaurar(props: PropsPeca, id: string): Peca {
    return new Peca(props, id);
  }

  get nome(): string {
    return this.props.nome;
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get precoUnitario(): Dinheiro {
    return this.props.precoUnitario;
  }

  get quantidadeEmEstoque(): number {
    return this.props.quantidadeEmEstoque;
  }

  /**
   * Reduz o estoque na quantidade informada. Usada na aprovacao da ordem de
   * servico, quando as pecas do orcamento sao efetivamente consumidas. Rejeita
   * quantidades invalidas e saldos insuficientes para proteger a invariante de
   * estoque nao negativo.
   */
  public baixarEstoque(quantidade: number): void {
    this.garantirQuantidadePositiva(quantidade, 'baixar');

    if (quantidade > this.props.quantidadeEmEstoque) {
      throw new RegraDeNegocioViolada(
        `Estoque insuficiente para a peca "${this.props.nome}": ` +
          `disponivel ${this.props.quantidadeEmEstoque}, solicitado ${quantidade}.`,
      );
    }

    this.props.quantidadeEmEstoque -= quantidade;
  }

  /**
   * Repoe o estoque na quantidade informada, somando ao saldo atual.
   */
  public reporEstoque(quantidade: number): void {
    this.garantirQuantidadePositiva(quantidade, 'repor');
    this.props.quantidadeEmEstoque += quantidade;
  }

  /**
   * Atualiza os dados cadastrais da peca. Nunca altera o estoque: entradas e
   * saidas de quantidade acontecem apenas pelos metodos de baixa e reposicao.
   */
  public atualizar(dados: {
    nome?: string;
    descricao?: string;
    precoUnitario?: Dinheiro;
  }): void {
    if (dados.nome !== undefined) {
      const nome = dados.nome.trim();
      if (!nome) {
        throw new ErroDeValidacao('Nome da peca e obrigatorio.');
      }
      this.props.nome = nome;
    }

    if (dados.descricao !== undefined) {
      this.props.descricao = dados.descricao.trim();
    }

    if (dados.precoUnitario !== undefined) {
      this.props.precoUnitario = dados.precoUnitario;
    }
  }

  private garantirQuantidadePositiva(quantidade: number, operacao: string): void {
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new ErroDeValidacao(
        `Quantidade para ${operacao} estoque deve ser um inteiro positivo.`,
      );
    }
  }
}
