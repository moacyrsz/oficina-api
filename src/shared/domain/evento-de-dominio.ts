/**
 * Contrato de um Evento de Dominio. Eventos descrevem algo relevante que
 * ocorreu no dominio e ja aconteceu, por isso sao nomeados no passado
 * (ex.: OrdemDeServicoCriada, OrcamentoAprovado).
 */
export interface EventoDeDominio {
  readonly nome: string;
  readonly idDoAgregado: string;
  readonly ocorridoEm: Date;
}

/**
 * Base opcional para eventos, preenchendo o instante de ocorrencia.
 */
export abstract class EventoDeDominioBase implements EventoDeDominio {
  public readonly ocorridoEm: Date;

  protected constructor(
    public readonly nome: string,
    public readonly idDoAgregado: string,
  ) {
    this.ocorridoEm = new Date();
  }
}
