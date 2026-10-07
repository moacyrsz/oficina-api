import { RaizDeAgregado } from '../../../shared/domain/raiz-de-agregado';
import { gerarId } from '../../../shared/domain/identificador';
import { ErroDeValidacao } from '../../../shared/domain/excecoes';
import { Documento } from './documento';
import { ClienteCadastrado } from './eventos';

interface PropsCliente {
  nome: string;
  documento: Documento;
  email: string;
  telefone: string;
}

interface DadosCriarCliente {
  nome: string;
  documento: Documento;
  email: string;
  telefone: string;
}

interface DadosAtualizarCliente {
  nome?: string;
  email?: string;
  telefone?: string;
}

/**
 * Agregado Cliente da oficina. Guarda os dados cadastrais e o documento fiscal
 * (CPF ou CNPJ) ja validado. O documento e imutavel apos o cadastro: eventuais
 * correcoes implicam em um novo cliente, preservando a integridade das ordens
 * de servico ja vinculadas.
 */
export class Cliente extends RaizDeAgregado<PropsCliente> {
  private constructor(props: PropsCliente, id: string) {
    super(props, id);
  }

  public static criar(dados: DadosCriarCliente, id?: string): Cliente {
    const nome = Cliente.validarNome(dados.nome);
    const email = Cliente.validarEmail(dados.email);
    const telefone = Cliente.validarTelefone(dados.telefone);

    if (!(dados.documento instanceof Documento)) {
      throw new ErroDeValidacao('Documento do cliente e obrigatorio.');
    }

    const cliente = new Cliente(
      { nome, documento: dados.documento, email, telefone },
      id ?? gerarId(),
    );
    cliente.registrarEvento(new ClienteCadastrado(cliente.id, dados.documento.valor));
    return cliente;
  }

  public static restaurar(props: PropsCliente, id: string): Cliente {
    return new Cliente(props, id);
  }

  get nome(): string {
    return this.props.nome;
  }

  get documento(): Documento {
    return this.props.documento;
  }

  get email(): string {
    return this.props.email;
  }

  get telefone(): string {
    return this.props.telefone;
  }

  /**
   * Atualiza os dados cadastrais mutaveis do cliente. Campos ausentes sao
   * mantidos como estao; os informados passam pelas mesmas validacoes do
   * cadastro.
   */
  public atualizar(dados: DadosAtualizarCliente): void {
    const nome = dados.nome !== undefined ? Cliente.validarNome(dados.nome) : this.props.nome;
    const email = dados.email !== undefined ? Cliente.validarEmail(dados.email) : this.props.email;
    const telefone =
      dados.telefone !== undefined ? Cliente.validarTelefone(dados.telefone) : this.props.telefone;

    this.props = { ...this.props, nome, email, telefone };
  }

  private static validarNome(nome: string): string {
    const normalizado = nome?.trim();
    if (!normalizado) {
      throw new ErroDeValidacao('Nome do cliente e obrigatorio.');
    }
    return normalizado;
  }

  private static validarEmail(email: string): string {
    const normalizado = email?.trim().toLowerCase();
    if (!normalizado) {
      throw new ErroDeValidacao('Email do cliente e obrigatorio.');
    }
    if (!normalizado.includes('@')) {
      throw new ErroDeValidacao('Email do cliente e invalido.');
    }
    return normalizado;
  }

  private static validarTelefone(telefone: string): string {
    const normalizado = telefone?.trim();
    if (!normalizado) {
      throw new ErroDeValidacao('Telefone do cliente e obrigatorio.');
    }
    return normalizado;
  }
}
