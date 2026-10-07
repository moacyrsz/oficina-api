import { Dinheiro } from '../../../shared/domain/dinheiro';
import { Peca } from '../domain/peca';
import { PecaOrmEntity } from './peca.orm-entity';

/**
 * Converte entre o agregado Peca e sua representacao de persistencia.
 */
export class PecaMapper {
  public static paraDominio(registro: PecaOrmEntity): Peca {
    return Peca.restaurar(
      {
        nome: registro.nome,
        descricao: registro.descricao,
        precoUnitario: Dinheiro.deCentavos(registro.precoCentavos),
        quantidadeEmEstoque: registro.quantidadeEmEstoque,
      },
      registro.id,
    );
  }

  public static paraPersistencia(peca: Peca): PecaOrmEntity {
    const registro = new PecaOrmEntity();
    registro.id = peca.id;
    registro.nome = peca.nome;
    registro.descricao = peca.descricao;
    registro.precoCentavos = peca.precoUnitario.centavos;
    registro.quantidadeEmEstoque = peca.quantidadeEmEstoque;
    return registro;
  }
}
