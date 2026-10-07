import { OrdemDeServico } from '../domain/ordem-de-servico';
import { StatusOrdemServico } from '../domain/status-ordem-servico';
import { DecisaoOrcamento } from '../domain/aprovacao';

export interface ItemSaida {
  descricao: string;
  referenciaId: string;
  valorUnitario: number;
  quantidade: number;
  subtotal: number;
}

export interface OrcamentoSaida {
  valorServicos: number;
  valorPecas: number;
  valorTotal: number;
}

export interface AprovacaoSaida {
  decisao: DecisaoOrcamento;
  registradoEm: string;
  motivo?: string;
}

export interface RegistroStatusSaida {
  status: StatusOrdemServico;
  em: string;
}

export interface OrdemDeServicoSaida {
  id: string;
  codigo: string;
  clienteId: string;
  veiculoId: string;
  status: StatusOrdemServico;
  itensServico: ItemSaida[];
  itensPeca: ItemSaida[];
  orcamento: OrcamentoSaida;
  aprovacao: AprovacaoSaida | null;
  historico: RegistroStatusSaida[];
  criadaEm: string;
  iniciadaExecucaoEm: string | null;
  finalizadaEm: string | null;
  entregueEm: string | null;
}

/**
 * Converte o agregado para uma estrutura simples de saida, com valores
 * monetarios em reais e datas em ISO 8601. Mantem os controllers isolados do
 * modelo de dominio.
 */
export function paraSaida(ordem: OrdemDeServico): OrdemDeServicoSaida {
  const orcamento = ordem.calcularOrcamento();
  return {
    id: ordem.id,
    codigo: ordem.codigo,
    clienteId: ordem.clienteId,
    veiculoId: ordem.veiculoId,
    status: ordem.status,
    itensServico: ordem.itensServico.map((item) => ({
      descricao: item.descricao,
      referenciaId: item.servicoId,
      valorUnitario: item.valorUnitario.reais,
      quantidade: item.quantidade,
      subtotal: item.subtotal.reais,
    })),
    itensPeca: ordem.itensPeca.map((item) => ({
      descricao: item.descricao,
      referenciaId: item.pecaId,
      valorUnitario: item.valorUnitario.reais,
      quantidade: item.quantidade,
      subtotal: item.subtotal.reais,
    })),
    orcamento: {
      valorServicos: orcamento.valorServicos.reais,
      valorPecas: orcamento.valorPecas.reais,
      valorTotal: orcamento.valorTotal.reais,
    },
    aprovacao: ordem.aprovacao
      ? {
          decisao: ordem.aprovacao.decisao,
          registradoEm: ordem.aprovacao.registradoEm.toISOString(),
          motivo: ordem.aprovacao.motivo,
        }
      : null,
    historico: ordem.historico.map((registro) => ({
      status: registro.status,
      em: registro.em.toISOString(),
    })),
    criadaEm: ordem.criadaEm.toISOString(),
    iniciadaExecucaoEm: ordem.iniciadaExecucaoEm ? ordem.iniciadaExecucaoEm.toISOString() : null,
    finalizadaEm: ordem.finalizadaEm ? ordem.finalizadaEm.toISOString() : null,
    entregueEm: ordem.entregueEm ? ordem.entregueEm.toISOString() : null,
  };
}
