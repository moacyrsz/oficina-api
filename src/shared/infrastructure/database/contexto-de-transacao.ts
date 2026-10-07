import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from 'typeorm';

/**
 * Mantem o EntityManager da transacao em curso usando AsyncLocalStorage. Com
 * isso os repositorios conseguem participar da mesma transacao aberta pela
 * Unidade de Trabalho sem precisar receber o manager explicitamente em cada
 * chamada, preservando a assinatura das portas de repositorio.
 */
@Injectable()
export class ContextoDeTransacao {
  private readonly armazenamento = new AsyncLocalStorage<EntityManager>();

  public executarCom<T>(manager: EntityManager, operacao: () => Promise<T>): Promise<T> {
    return this.armazenamento.run(manager, operacao);
  }

  public obterManager(): EntityManager | undefined {
    return this.armazenamento.getStore();
  }
}
