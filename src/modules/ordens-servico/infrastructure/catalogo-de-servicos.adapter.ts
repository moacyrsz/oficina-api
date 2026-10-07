import { Inject, Injectable } from '@nestjs/common';
import { SERVICO_REPOSITORY, ServicoRepository } from '../../servicos/domain/servico.repository';
import { CatalogoDeServicos, ServicoDoCatalogo } from '../application/ports/catalogo-de-servicos';

/**
 * Adaptador que satisfaz a porta CatalogoDeServicos delegando ao repositorio do
 * contexto de Servicos.
 */
@Injectable()
export class CatalogoDeServicosAdapter implements CatalogoDeServicos {
  constructor(@Inject(SERVICO_REPOSITORY) private readonly servicos: ServicoRepository) {}

  public async buscarServico(id: string): Promise<ServicoDoCatalogo | null> {
    const servico = await this.servicos.buscarPorId(id);
    if (!servico) {
      return null;
    }
    return { id: servico.id, nome: servico.nome, valorCentavos: servico.valor.centavos };
  }
}
