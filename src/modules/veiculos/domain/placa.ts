import { ObjetoDeValor } from '../../../shared/domain/objeto-de-valor';
import { ErroDeValidacao } from '../../../shared/domain/excecoes';

interface PropsPlaca {
  valor: string;
}

/** Padrao antigo de placa brasileira: tres letras seguidas de quatro digitos. */
const FORMATO_ANTIGO = /^[A-Z]{3}[0-9]{4}$/;
/** Padrao Mercosul: tres letras, um digito, uma letra e dois digitos. */
const FORMATO_MERCOSUL = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

/**
 * Objeto de valor que representa a placa de um veiculo. Aceita tanto o padrao
 * antigo (ABC1234) quanto o padrao Mercosul (ABC1D23). O valor e sempre
 * normalizado para letras maiusculas e sem hifen ou espacos, o que mantem
 * comparacoes e buscas consistentes independentemente de como foi digitado.
 */
export class Placa extends ObjetoDeValor<PropsPlaca> {
  private constructor(valor: string) {
    super({ valor });
  }

  public static criar(valor: string): Placa {
    if (typeof valor !== 'string') {
      throw new ErroDeValidacao('Placa e obrigatoria.');
    }

    const normalizado = valor.toUpperCase().replace(/[\s-]/g, '');

    if (!FORMATO_ANTIGO.test(normalizado) && !FORMATO_MERCOSUL.test(normalizado)) {
      throw new ErroDeValidacao(
        'Placa invalida. Use o padrao antigo (ABC1234) ou o padrao Mercosul (ABC1D23).',
      );
    }

    return new Placa(normalizado);
  }

  get valor(): string {
    return this.props.valor;
  }

  /**
   * Representacao amigavel da placa. No padrao antigo aplica o hifen
   * (ABC-1234); no padrao Mercosul mantem o formato continuo (ABC1D23).
   */
  get formatado(): string {
    if (FORMATO_ANTIGO.test(this.props.valor)) {
      return `${this.props.valor.slice(0, 3)}-${this.props.valor.slice(3)}`;
    }
    return this.props.valor;
  }
}
