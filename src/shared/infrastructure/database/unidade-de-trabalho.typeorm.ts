import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UnidadeDeTrabalho } from '../../application/unidade-de-trabalho';
import { ContextoDeTransacao } from './contexto-de-transacao';

/**
 * Implementacao da Unidade de Trabalho sobre transacoes do TypeORM. Abre uma
 * transacao, publica o EntityManager transacional no contexto e executa a
 * operacao. Qualquer excecao provoca rollback automatico; o sucesso provoca
 * commit. Repositorios que leem o contexto participam da mesma transacao.
 */
@Injectable()
export class UnidadeDeTrabalhoTypeorm implements UnidadeDeTrabalho {
  constructor(
    private readonly dataSource: DataSource,
    private readonly contexto: ContextoDeTransacao,
  ) {}

  public executar<T>(operacao: () => Promise<T>): Promise<T> {
    return this.dataSource.transaction((manager) =>
      this.contexto.executarCom(manager, operacao),
    );
  }
}
