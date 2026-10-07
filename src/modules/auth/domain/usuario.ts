import { RaizDeAgregado } from '../../../shared/domain/raiz-de-agregado';
import { gerarId } from '../../../shared/domain/identificador';
import { ErroDeValidacao } from '../../../shared/domain/excecoes';

interface PropsUsuario {
  nome: string;
  email: string;
  senhaHash: string;
}

/**
 * Usuario administrativo da oficina. Autentica-se para operar as APIs
 * protegidas. A senha nunca e armazenada em texto puro: o agregado guarda
 * apenas o hash gerado pela infraestrutura.
 */
export class Usuario extends RaizDeAgregado<PropsUsuario> {
  private constructor(props: PropsUsuario, id: string) {
    super(props, id);
  }

  public static criar(dados: { nome: string; email: string; senhaHash: string }, id?: string): Usuario {
    const nome = dados.nome?.trim();
    const email = dados.email?.trim().toLowerCase();

    if (!nome) {
      throw new ErroDeValidacao('Nome do usuario e obrigatorio.');
    }
    if (!email) {
      throw new ErroDeValidacao('Email do usuario e obrigatorio.');
    }
    if (!dados.senhaHash) {
      throw new ErroDeValidacao('Hash da senha e obrigatorio.');
    }

    return new Usuario({ nome, email, senhaHash: dados.senhaHash }, id ?? gerarId());
  }

  public static restaurar(props: PropsUsuario, id: string): Usuario {
    return new Usuario(props, id);
  }

  get nome(): string {
    return this.props.nome;
  }

  get email(): string {
    return this.props.email;
  }

  get senhaHash(): string {
    return this.props.senhaHash;
  }
}
