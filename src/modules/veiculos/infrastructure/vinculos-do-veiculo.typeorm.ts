import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ContextoDeTransacao } from '../../../shared/infrastructure/database/contexto-de-transacao';
import { RepositorioTypeorm } from '../../../shared/infrastructure/database/repositorio-typeorm.base';
import { VinculosDoVeiculo } from '../application/ports/vinculos-do-veiculo';

/**
 * Consulta de leitura na tabela de ordens de servico. Usa o nome da tabela em
 * vez da entidade do modulo de ordens, que depende do modulo de veiculos.
 */
@Injectable()
export class VinculosDoVeiculoTypeorm extends RepositorioTypeorm implements VinculosDoVeiculo {
  constructor(dataSource: DataSource, contexto: ContextoDeTransacao) {
    super(dataSource, contexto);
  }

  public possuiOrdensDeServico(veiculoId: string): Promise<boolean> {
    return this.existeRegistro('ordens_servico', 'veiculo_id', veiculoId);
  }
}
