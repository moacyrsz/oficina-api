import { ObjetoDeValor } from './objeto-de-valor';
import { ErroDeValidacao } from './excecoes';

interface PropsDinheiro {
  centavos: number;
}

/**
 * Objeto de valor que representa um valor monetario em reais. Internamente o
 * valor e guardado em centavos (inteiro) para evitar os erros de arredondamento
 * tipicos da aritmetica de ponto flutuante. Nao sao permitidos valores
 * negativos no contexto da oficina (precos, orcamentos e totais).
 */
export class Dinheiro extends ObjetoDeValor<PropsDinheiro> {
  private constructor(centavos: number) {
    super({ centavos });
  }

  public static deReais(valor: number): Dinheiro {
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      throw new ErroDeValidacao('Valor monetario invalido.');
    }
    if (valor < 0) {
      throw new ErroDeValidacao('Valor monetario nao pode ser negativo.');
    }
    return new Dinheiro(Math.round(valor * 100));
  }

  public static deCentavos(centavos: number): Dinheiro {
    if (!Number.isInteger(centavos)) {
      throw new ErroDeValidacao('Centavos devem ser um numero inteiro.');
    }
    if (centavos < 0) {
      throw new ErroDeValidacao('Valor monetario nao pode ser negativo.');
    }
    return new Dinheiro(centavos);
  }

  public static zero(): Dinheiro {
    return new Dinheiro(0);
  }

  get centavos(): number {
    return this.props.centavos;
  }

  get reais(): number {
    return this.props.centavos / 100;
  }

  public somar(outro: Dinheiro): Dinheiro {
    return new Dinheiro(this.props.centavos + outro.props.centavos);
  }

  public multiplicarPor(quantidade: number): Dinheiro {
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      throw new ErroDeValidacao('Quantidade deve ser um inteiro nao negativo.');
    }
    return new Dinheiro(this.props.centavos * quantidade);
  }

  public formatar(): string {
    return this.reais.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
