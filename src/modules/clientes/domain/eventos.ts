import { EventoDeDominioBase } from '../../../shared/domain/evento-de-dominio';

/**
 * Eventos de dominio do agregado Cliente. Representam fatos de negocio ja
 * ocorridos e sao acumulados na raiz do agregado durante as operacoes.
 */
export class ClienteCadastrado extends EventoDeDominioBase {
  constructor(idDoCliente: string, public readonly documento: string) {
    super('ClienteCadastrado', idDoCliente);
  }
}
