import { Global, Module } from '@nestjs/common';
import { ContextoDeTransacao } from './infrastructure/database/contexto-de-transacao';
import { UnidadeDeTrabalhoTypeorm } from './infrastructure/database/unidade-de-trabalho.typeorm';
import { UNIDADE_DE_TRABALHO } from './application/unidade-de-trabalho';

/**
 * Modulo compartilhado (shared kernel na camada de infraestrutura). Disponibiliza
 * de forma global o controle de transacoes e a Unidade de Trabalho para todos os
 * modulos de negocio.
 */
@Global()
@Module({
  providers: [
    ContextoDeTransacao,
    {
      provide: UNIDADE_DE_TRABALHO,
      useClass: UnidadeDeTrabalhoTypeorm,
    },
  ],
  exports: [ContextoDeTransacao, UNIDADE_DE_TRABALHO],
})
export class SharedModule {}
