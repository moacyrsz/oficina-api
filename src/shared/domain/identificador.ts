import { randomUUID } from 'crypto';

/**
 * Gera um identificador unico universal (UUID v4) para novos agregados e
 * entidades. Centralizar a geracao facilita eventuais trocas de estrategia.
 */
export function gerarId(): string {
  return randomUUID();
}
