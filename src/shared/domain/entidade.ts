/**
 * Base para Entidades. Uma entidade possui identidade propria e estavel: duas
 * entidades sao iguais quando possuem o mesmo identificador, independentemente
 * dos demais atributos.
 */
export abstract class Entidade<T> {
  protected readonly _id: string;
  protected props: T;

  protected constructor(props: T, id: string) {
    this.props = props;
    this._id = id;
  }

  get id(): string {
    return this._id;
  }

  public igualA(outra?: Entidade<T>): boolean {
    if (outra === null || outra === undefined) {
      return false;
    }
    if (this === outra) {
      return true;
    }
    return this._id === outra._id;
  }
}
