/**
 * Base para Objetos de Valor. Objetos de valor nao possuem identidade propria:
 * sua igualdade e definida pelo conjunto de atributos que os compoem. As
 * instancias sao imutaveis apos a criacao.
 */
export abstract class ObjetoDeValor<T extends object> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = Object.freeze({ ...props });
  }

  public igualA(outro?: ObjetoDeValor<T>): boolean {
    if (outro === null || outro === undefined) {
      return false;
    }
    if (outro.props === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(outro.props);
  }
}
