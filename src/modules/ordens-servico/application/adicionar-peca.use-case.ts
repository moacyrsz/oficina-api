import { Inject, Injectable } from '@nestjs/common';
import { Dinheiro } from '../../../shared/domain/dinheiro';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { UNIDADE_DE_TRABALHO, UnidadeDeTrabalho } from '../../../shared/application/unidade-de-trabalho';
import { ItemPeca } from '../domain/item-peca';
import {
  ORDEM_DE_SERVICO_REPOSITORY,
  OrdemDeServicoRepository,
} from '../domain/ordem-de-servico.repository';
import { GESTAO_DE_ESTOQUE, GestaoDeEstoque } from './ports/gestao-de-estoque';
import { OrdemDeServicoSaida, paraSaida } from './ordem-de-servico.saida';

export interface EntradaAdicionarPeca {
  ordemId: string;
  pecaId: string;
  quantidade: number;
}

/**
 * Inclui uma peca ou insumo na Ordem de Servico, capturando o preco atual como
 * snapshot. A baixa de estoque so ocorre na aprovacao do orcamento.
 */
@Injectable()
export class AdicionarPecaUseCase {
  constructor(
    @Inject(ORDEM_DE_SERVICO_REPOSITORY) private readonly ordens: OrdemDeServicoRepository,
    @Inject(GESTAO_DE_ESTOQUE) private readonly estoque: GestaoDeEstoque,
    @Inject(UNIDADE_DE_TRABALHO) private readonly unidadeDeTrabalho: UnidadeDeTrabalho,
  ) {}

  public async executar(entrada: EntradaAdicionarPeca): Promise<OrdemDeServicoSaida> {
    return this.unidadeDeTrabalho.executar(async () => {
      const ordem = await this.ordens.buscarPorId(entrada.ordemId);
      if (!ordem) {
        throw new RecursoNaoEncontrado('Ordem de servico nao encontrada.');
      }

      const peca = await this.estoque.buscarPeca(entrada.pecaId);
      if (!peca) {
        throw new RecursoNaoEncontrado('Peca nao encontrada.');
      }

      const item = ItemPeca.criar({
        pecaId: peca.id,
        descricao: peca.nome,
        valorUnitario: Dinheiro.deCentavos(peca.valorCentavos),
        quantidade: entrada.quantidade,
      });

      ordem.adicionarPeca(item);
      await this.ordens.salvar(ordem);
      return paraSaida(ordem);
    });
  }
}
