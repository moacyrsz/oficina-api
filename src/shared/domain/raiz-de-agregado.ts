import { Entidade } from './entidade';
import { EventoDeDominio } from './evento-de-dominio';

/**
 * Base para a Raiz de um Agregado. A raiz e o unico ponto de entrada para
 * alteracoes no agregado e garante as invariantes de todo o conjunto. Tambem
 * acumula os eventos de dominio produzidos durante as operacoes de negocio.
 */
export abstract class RaizDeAgregado<T> extends Entidade<T> {
  private _eventos: EventoDeDominio[] = [];

  get eventos(): ReadonlyArray<EventoDeDominio> {
    return [...this._eventos];
  }

  protected registrarEvento(evento: EventoDeDominio): void {
    this._eventos.push(evento);
  }

  public limparEventos(): void {
    this._eventos = [];
  }
}
