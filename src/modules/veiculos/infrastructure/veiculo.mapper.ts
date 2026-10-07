import { Placa } from '../domain/placa';
import { Veiculo } from '../domain/veiculo';
import { VeiculoOrmEntity } from './veiculo.orm-entity';

/**
 * Converte entre o agregado Veiculo e sua representacao de persistencia. A placa
 * guardada em texto e reconstruida como objeto de valor via Placa.criar.
 */
export class VeiculoMapper {
  public static paraDominio(registro: VeiculoOrmEntity): Veiculo {
    return Veiculo.restaurar(
      {
        placa: Placa.criar(registro.placa),
        marca: registro.marca,
        modelo: registro.modelo,
        ano: registro.ano,
        clienteId: registro.clienteId,
      },
      registro.id,
    );
  }

  public static paraPersistencia(veiculo: Veiculo): VeiculoOrmEntity {
    const registro = new VeiculoOrmEntity();
    registro.id = veiculo.id;
    registro.placa = veiculo.placa.valor;
    registro.marca = veiculo.marca;
    registro.modelo = veiculo.modelo;
    registro.ano = veiculo.ano;
    registro.clienteId = veiculo.clienteId;
    return registro;
  }
}
