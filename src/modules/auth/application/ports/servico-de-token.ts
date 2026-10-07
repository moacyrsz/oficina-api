/**
 * Porta de emissao de token de acesso. Isola a aplicacao da biblioteca de JWT.
 */
export interface TokenEmitido {
  accessToken: string;
  tipo: string;
  expiraEm: string;
}

export interface ServicoDeToken {
  gerar(sujeito: { id: string; email: string }): Promise<TokenEmitido>;
}

export const SERVICO_DE_TOKEN = Symbol('ServicoDeToken');
