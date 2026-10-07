import { RaizDeAgregado } from '../../../shared/domain/raiz-de-agregado';
import { gerarId } from '../../../shared/domain/identificador';
import { ErroDeValidacao } from '../../../shared/domain/excecoes';
import { Placa } from './placa';

interface PropsVeiculo {
  placa: Placa;
  marca: string;
  modelo: string;
  ano: number;
  clienteId: string;
}

export interface DadosCriarVeiculo {
  placa: Placa;
  marca: string;
  modelo: string;
  ano: number;
  clienteId: string;
}

export interface DadosAtualizarVeiculo {
  marca?: string;
  modelo?: string;
  ano?: number;
}

/**
 * Agregado Veiculo. Pertence a um cliente e e identificado de forma unica pela
 * sua placa. Concentra as invariantes de marca, modelo e ano de fabricacao.
 */
export class Veiculo extends RaizDeAgregado<PropsVeiculo> {
  private constructor(props: PropsVeiculo, id: string) {
    super(props, id);
  }

  public static criar(dados: DadosCriarVeiculo, id?: string): Veiculo {
    if (!dados.placa) {
      throw new ErroDeValidacao('Placa do veiculo e obrigatoria.');
    }

    const marca = Veiculo.validarMarca(dados.marca);
    const modelo = Veiculo.validarModelo(dados.modelo);
    const ano = Veiculo.validarAno(dados.ano);
    const clienteId = Veiculo.validarClienteId(dados.clienteId);

    return new Veiculo({ placa: dados.placa, marca, modelo, ano, clienteId }, id ?? gerarId());
  }

  public static restaurar(props: PropsVeiculo, id: string): Veiculo {
    return new Veiculo(props, id);
  }

  get placa(): Placa {
    return this.props.placa;
  }

  get marca(): string {
    return this.props.marca;
  }

  get modelo(): string {
    return this.props.modelo;
  }

  get ano(): number {
    return this.props.ano;
  }

  get clienteId(): string {
    return this.props.clienteId;
  }

  /**
   * Atualiza os dados cadastrais do veiculo. A placa e o cliente proprietario
   * sao imutaveis apos o cadastro e por isso nao sao alterados aqui.
   */
  public atualizar(dados: DadosAtualizarVeiculo): void {
    const marca = dados.marca !== undefined ? Veiculo.validarMarca(dados.marca) : this.props.marca;
    const modelo =
      dados.modelo !== undefined ? Veiculo.validarModelo(dados.modelo) : this.props.modelo;
    const ano = dados.ano !== undefined ? Veiculo.validarAno(dados.ano) : this.props.ano;

    this.props = { ...this.props, marca, modelo, ano };
  }

  private static validarMarca(marca: string): string {
    const valor = marca?.trim();
    if (!valor) {
      throw new ErroDeValidacao('Marca do veiculo e obrigatoria.');
    }
    return valor;
  }

  private static validarModelo(modelo: string): string {
    const valor = modelo?.trim();
    if (!valor) {
      throw new ErroDeValidacao('Modelo do veiculo e obrigatorio.');
    }
    return valor;
  }

  private static validarAno(ano: number): number {
    const anoMaximo = new Date().getFullYear() + 1;
    if (!Number.isInteger(ano) || ano < 1900 || ano > anoMaximo) {
      throw new ErroDeValidacao(`Ano do veiculo deve ser um inteiro entre 1900 e ${anoMaximo}.`);
    }
    return ano;
  }

  private static validarClienteId(clienteId: string): string {
    const valor = clienteId?.trim();
    if (!valor) {
      throw new ErroDeValidacao('Cliente do veiculo e obrigatorio.');
    }
    return valor;
  }
}
