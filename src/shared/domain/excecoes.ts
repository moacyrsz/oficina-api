/**
 * Hierarquia de excecoes de dominio. Cada tipo carrega a intencao de negocio e
 * e traduzido para um codigo HTTP apropriado pelo filtro global de excecoes,
 * mantendo a camada de dominio livre de qualquer dependencia de transporte.
 */
export abstract class ExcecaoDeDominio extends Error {
  protected constructor(mensagem: string) {
    super(mensagem);
    this.name = new.target.name;
  }
}

/** Dados invalidos de entrada ou objeto de valor malformado. Mapeado para 400. */
export class ErroDeValidacao extends ExcecaoDeDominio {
  constructor(mensagem: string) {
    super(mensagem);
  }
}

/** Recurso inexistente. Mapeado para 404. */
export class RecursoNaoEncontrado extends ExcecaoDeDominio {
  constructor(mensagem: string) {
    super(mensagem);
  }
}

/** Violacao de unicidade ou estado conflitante. Mapeado para 409. */
export class ConflitoDeRecurso extends ExcecaoDeDominio {
  constructor(mensagem: string) {
    super(mensagem);
  }
}

/** Operacao proibida pelas regras de negocio. Mapeado para 422. */
export class RegraDeNegocioViolada extends ExcecaoDeDominio {
  constructor(mensagem: string) {
    super(mensagem);
  }
}

/** Credenciais ausentes ou invalidas na autenticacao. Mapeado para 401. */
export class FalhaDeAutenticacao extends ExcecaoDeDominio {
  constructor(mensagem = 'Credenciais invalidas.') {
    super(mensagem);
  }
}
