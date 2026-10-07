import { Inject, Injectable } from '@nestjs/common';
import { Dinheiro } from '../../../shared/domain/dinheiro';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { UNIDADE_DE_TRABALHO, UnidadeDeTrabalho } from '../../../shared/application/unidade-de-trabalho';
import { ItemServico } from '../domain/item-servico';
import {
  ORDEM_DE_SERVICO_REPOSITORY,
  OrdemDeServicoRepository,
} from '../domain/ordem-de-servico.repository';
import { CATALOGO_DE_SERVICOS, CatalogoDeServicos } from './ports/catalogo-de-servicos';
import { OrdemDeServicoSaida, paraSaida } from './ordem-de-servico.saida';

export interface EntradaAdicionarServico {
  ordemId: string;
  servicoId: string;
  quantidade: number;
}

/**
 * Inclui um servico na Ordem de Servico, capturando o preco atual do catalogo
 * como snapshot do item.
 */
@Injectable()
export class AdicionarServicoUseCase {
  constructor(
    @Inject(ORDEM_DE_SERVICO_REPOSITORY) private readonly ordens: OrdemDeServicoRepository,
    @Inject(CATALOGO_DE_SERVICOS) private readonly catalogo: CatalogoDeServicos,
    @Inject(UNIDADE_DE_TRABALHO) private readonly unidadeDeTrabalho: UnidadeDeTrabalho,
  ) {}

  public async executar(entrada: EntradaAdicionarServico): Promise<OrdemDeServicoSaida> {
    return this.unidadeDeTrabalho.executar(async () => {
      const ordem = await this.ordens.buscarPorId(entrada.ordemId);
      if (!ordem) {
        throw new RecursoNaoEncontrado('Ordem de servico nao encontrada.');
      }

      const servico = await this.catalogo.buscarServico(entrada.servicoId);
      if (!servico) {
        throw new RecursoNaoEncontrado('Servico nao encontrado.');
      }

      const item = ItemServico.criar({
        servicoId: servico.id,
        descricao: servico.nome,
        valorUnitario: Dinheiro.deCentavos(servico.valorCentavos),
        quantidade: entrada.quantidade,
      });

      ordem.adicionarServico(item);
      await this.ordens.salvar(ordem);
      return paraSaida(ordem);
    });
  }
}
