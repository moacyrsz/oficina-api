import { Dinheiro } from '../../../shared/domain/dinheiro';
import { Servico } from '../domain/servico';
import { ServicoOrmEntity } from './servico.orm-entity';

/**
 * Converte entre o agregado Servico e sua representacao de persistencia.
 */
export class ServicoMapper {
  public static paraDominio(registro: ServicoOrmEntity): Servico {
    return Servico.restaurar(
      {
        nome: registro.nome,
        descricao: registro.descricao,
        valor: Dinheiro.deCentavos(registro.valorCentavos),
      },
      registro.id,
    );
  }

  public static paraPersistencia(servico: Servico): ServicoOrmEntity {
    const registro = new ServicoOrmEntity();
    registro.id = servico.id;
    registro.nome = servico.nome;
    registro.descricao = servico.descricao;
    registro.valorCentavos = servico.valor.centavos;
    return registro;
  }
}
