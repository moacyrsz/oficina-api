import { ObjetoDeValor } from '../../../shared/domain/objeto-de-valor';

export enum DecisaoOrcamento {
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
}

interface PropsAprovacao {
  decisao: DecisaoOrcamento;
  registradoEm: Date;
  motivo?: string;
}

/**
 * Registro da decisao do cliente sobre o orcamento: aprovacao ou rejeicao,
 * com o instante do registro e um motivo opcional em caso de rejeicao.
 */
export class Aprovacao extends ObjetoDeValor<PropsAprovacao> {
  private constructor(props: PropsAprovacao) {
    super(props);
  }

  public static aprovar(registradoEm: Date): Aprovacao {
    return new Aprovacao({ decisao: DecisaoOrcamento.APROVADO, registradoEm });
  }

  public static rejeitar(registradoEm: Date, motivo?: string): Aprovacao {
    return new Aprovacao({ decisao: DecisaoOrcamento.REJEITADO, registradoEm, motivo });
  }

  public static restaurar(props: PropsAprovacao): Aprovacao {
    return new Aprovacao(props);
  }

  get decisao(): DecisaoOrcamento {
    return this.props.decisao;
  }

  get registradoEm(): Date {
    return this.props.registradoEm;
  }

  get motivo(): string | undefined {
    return this.props.motivo;
  }

  get aprovado(): boolean {
    return this.props.decisao === DecisaoOrcamento.APROVADO;
  }
}
