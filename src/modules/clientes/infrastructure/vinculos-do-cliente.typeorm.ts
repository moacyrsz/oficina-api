import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ContextoDeTransacao } from '../../../shared/infrastructure/database/contexto-de-transacao';
import { RepositorioTypeorm } from '../../../shared/infrastructure/database/repositorio-typeorm.base';
import { VinculosDoCliente } from '../application/ports/vinculos-do-cliente';

/**
 * Consulta de leitura nas tabelas de veiculos e de ordens de servico. Usa os
 * nomes das tabelas em vez das entidades de outros modulos, para que o
 * cadastro de clientes nao dependa dos modulos que dependem dele.
 */
@Injectable()
export class VinculosDoClienteTypeorm extends RepositorioTypeorm implements VinculosDoCliente {
  constructor(dataSource: DataSource, contexto: ContextoDeTransacao) {
    super(dataSource, contexto);
  }

  public possuiVeiculos(clienteId: string): Promise<boolean> {
    return this.existeRegistro('veiculos', 'cliente_id', clienteId);
  }

  public possuiOrdensDeServico(clienteId: string): Promise<boolean> {
    return this.existeRegistro('ordens_servico', 'cliente_id', clienteId);
  }
}
