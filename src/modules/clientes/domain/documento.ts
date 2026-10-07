import { ObjetoDeValor } from '../../../shared/domain/objeto-de-valor';
import { ErroDeValidacao } from '../../../shared/domain/excecoes';

type TipoDocumento = 'CPF' | 'CNPJ';

interface PropsDocumento {
  valor: string;
  tipo: TipoDocumento;
}

/**
 * Objeto de valor que representa o documento fiscal de um cliente, podendo ser
 * um CPF (pessoa fisica) ou um CNPJ (pessoa juridica). Aceita a entrada com ou
 * sem mascara, guarda internamente apenas os digitos e valida os digitos
 * verificadores conforme as regras oficiais da Receita Federal.
 */
export class Documento extends ObjetoDeValor<PropsDocumento> {
  private constructor(props: PropsDocumento) {
    super(props);
  }

  public static criar(valor: string): Documento {
    if (typeof valor !== 'string' || valor.trim().length === 0) {
      throw new ErroDeValidacao('Documento e obrigatorio.');
    }

    const digitos = valor.replace(/\D/g, '');

    if (digitos.length === 11) {
      if (!Documento.cpfValido(digitos)) {
        throw new ErroDeValidacao('CPF invalido.');
      }
      return new Documento({ valor: digitos, tipo: 'CPF' });
    }

    if (digitos.length === 14) {
      if (!Documento.cnpjValido(digitos)) {
        throw new ErroDeValidacao('CNPJ invalido.');
      }
      return new Documento({ valor: digitos, tipo: 'CNPJ' });
    }

    throw new ErroDeValidacao(
      'Documento invalido: informe um CPF (11 digitos) ou um CNPJ (14 digitos).',
    );
  }

  get valor(): string {
    return this.props.valor;
  }

  get tipo(): TipoDocumento {
    return this.props.tipo;
  }

  get formatado(): string {
    const d = this.props.valor;
    if (this.props.tipo === 'CPF') {
      return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
    }
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
  }

  /** Verifica os dois digitos verificadores do CPF e rejeita sequencias repetidas. */
  private static cpfValido(cpf: string): boolean {
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    const primeiro = Documento.digitoVerificador(cpf, 9, 10);
    const segundo = Documento.digitoVerificador(cpf, 10, 11);

    return primeiro === Number(cpf[9]) && segundo === Number(cpf[10]);
  }

  /** Verifica os dois digitos verificadores do CNPJ e rejeita sequencias repetidas. */
  private static cnpjValido(cnpj: string): boolean {
    if (/^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }

    const pesosPrimeiro = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesosSegundo = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const primeiro = Documento.digitoPorPesos(cnpj, pesosPrimeiro);
    const segundo = Documento.digitoPorPesos(cnpj, pesosSegundo);

    return primeiro === Number(cnpj[12]) && segundo === Number(cnpj[13]);
  }

  /**
   * Calcula um digito verificador do CPF usando pesos decrescentes. O parametro
   * ate indica quantos digitos entram na soma e pesoInicial o peso do primeiro.
   */
  private static digitoVerificador(cpf: string, ate: number, pesoInicial: number): number {
    let soma = 0;
    for (let i = 0; i < ate; i += 1) {
      soma += Number(cpf[i]) * (pesoInicial - i);
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }

  /** Calcula um digito verificador do CNPJ aplicando a tabela de pesos informada. */
  private static digitoPorPesos(cnpj: string, pesos: number[]): number {
    let soma = 0;
    for (let i = 0; i < pesos.length; i += 1) {
      soma += Number(cnpj[i]) * pesos[i];
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }
}
