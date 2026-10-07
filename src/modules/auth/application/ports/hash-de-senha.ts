/**
 * Porta de hashing de senha. Isola a aplicacao do algoritmo concreto usado
 * (a implementacao de producao utiliza bcrypt).
 */
export interface HashDeSenha {
  gerar(senhaEmTexto: string): Promise<string>;
  comparar(senhaEmTexto: string, hash: string): Promise<boolean>;
}

export const HASH_DE_SENHA = Symbol('HashDeSenha');
