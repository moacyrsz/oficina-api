import { Dinheiro } from '../../../shared/domain/dinheiro';
import { Aprovacao, DecisaoOrcamento } from '../domain/aprovacao';
import { ItemPeca } from '../domain/item-peca';
import { ItemServico } from '../domain/item-servico';
import { OrdemDeServico } from '../domain/ordem-de-servico';
import { StatusOrdemServico } from '../domain/status-ordem-servico';
import { OrdemDeServicoOrmEntity } from './ordem-de-servico.orm-entity';

/**
 * Converte entre o agregado Ordem de Servico e sua representacao de persistencia.
 */
export class OrdemDeServicoMapper {
  public static paraDominio(registro: OrdemDeServicoOrmEntity): OrdemDeServico {
    const itensServico = registro.itensServico.map((item) =>
      ItemServico.restaurar(
        {
          servicoId: item.servicoId,
          descricao: item.descricao,
          valorUnitario: Dinheiro.deCentavos(item.valorCentavos),
          quantidade: item.quantidade,
        },
        item.itemId,
      ),
    );

    const itensPeca = registro.itensPeca.map((item) =>
      ItemPeca.restaurar(
        {
          pecaId: item.pecaId,
          descricao: item.descricao,
          valorUnitario: Dinheiro.deCentavos(item.valorCentavos),
          quantidade: item.quantidade,
        },
        item.itemId,
      ),
    );

    const aprovacao = registro.aprovacao
      ? Aprovacao.restaurar({
          decisao: registro.aprovacao.decisao as DecisaoOrcamento,
          registradoEm: new Date(registro.aprovacao.registradoEm),
          motivo: registro.aprovacao.motivo,
        })
      : null;

    const historico = registro.historico.map((entrada) => ({
      status: entrada.status as StatusOrdemServico,
      em: new Date(entrada.em),
    }));

    return OrdemDeServico.restaurar(
      {
        codigo: registro.codigo,
        clienteId: registro.clienteId,
        veiculoId: registro.veiculoId,
        status: registro.status as StatusOrdemServico,
        itensServico,
        itensPeca,
        aprovacao,
        historico,
        criadaEm: new Date(registro.criadaEm),
        iniciadaExecucaoEm: registro.iniciadaExecucaoEm ? new Date(registro.iniciadaExecucaoEm) : null,
        finalizadaEm: registro.finalizadaEm ? new Date(registro.finalizadaEm) : null,
        entregueEm: registro.entregueEm ? new Date(registro.entregueEm) : null,
      },
      registro.id,
    );
  }

  public static paraPersistencia(ordem: OrdemDeServico): OrdemDeServicoOrmEntity {
    const registro = new OrdemDeServicoOrmEntity();
    registro.id = ordem.id;
    registro.codigo = ordem.codigo;
    registro.clienteId = ordem.clienteId;
    registro.veiculoId = ordem.veiculoId;
    registro.status = ordem.status;
    registro.itensServico = ordem.itensServico.map((item) => ({
      itemId: item.id,
      servicoId: item.servicoId,
      descricao: item.descricao,
      valorCentavos: item.valorUnitario.centavos,
      quantidade: item.quantidade,
    }));
    registro.itensPeca = ordem.itensPeca.map((item) => ({
      itemId: item.id,
      pecaId: item.pecaId,
      descricao: item.descricao,
      valorCentavos: item.valorUnitario.centavos,
      quantidade: item.quantidade,
    }));
    registro.aprovacao = ordem.aprovacao
      ? {
          decisao: ordem.aprovacao.decisao,
          registradoEm: ordem.aprovacao.registradoEm.toISOString(),
          motivo: ordem.aprovacao.motivo,
        }
      : null;
    registro.historico = ordem.historico.map((entrada) => ({
      status: entrada.status,
      em: entrada.em.toISOString(),
    }));
    registro.criadaEm = ordem.criadaEm.toISOString();
    registro.iniciadaExecucaoEm = ordem.iniciadaExecucaoEm
      ? ordem.iniciadaExecucaoEm.toISOString()
      : null;
    registro.finalizadaEm = ordem.finalizadaEm ? ordem.finalizadaEm.toISOString() : null;
    registro.entregueEm = ordem.entregueEm ? ordem.entregueEm.toISOString() : null;
    return registro;
  }
}
