import { Dinheiro } from '../../../shared/domain/dinheiro';
import { ErroDeValidacao, RegraDeNegocioViolada } from '../../../shared/domain/excecoes';
import { Aprovacao, DecisaoOrcamento } from './aprovacao';
import { ItemPeca } from './item-peca';
import { ItemServico } from './item-servico';
import { OrdemDeServico } from './ordem-de-servico';
import { StatusOrdemServico } from './status-ordem-servico';
import { OrdemDeServicoCriada } from './eventos';

function novoServico(valorReais: number, quantidade = 1): ItemServico {
  return ItemServico.criar({
    servicoId: '11111111-1111-1111-1111-111111111111',
    descricao: 'Troca de oleo',
    valorUnitario: Dinheiro.deReais(valorReais),
    quantidade,
  });
}

function novaPeca(valorReais: number, quantidade = 1): ItemPeca {
  return ItemPeca.criar({
    pecaId: '22222222-2222-2222-2222-222222222222',
    descricao: 'Filtro de oleo',
    valorUnitario: Dinheiro.deReais(valorReais),
    quantidade,
  });
}

function ordemNova(): OrdemDeServico {
  return OrdemDeServico.criar({ clienteId: 'cliente-1', veiculoId: 'veiculo-1' });
}

describe('OrdemDeServico', () => {
  describe('criacao', () => {
    it('abre a ordem no status Recebida com codigo e historico', () => {
      const ordem = ordemNova();
      expect(ordem.status).toBe(StatusOrdemServico.RECEBIDA);
      expect(ordem.codigo).toMatch(/^OS-[0-9A-F]{8}$/);
      expect(ordem.historico).toHaveLength(1);
      expect(ordem.historico[0].status).toBe(StatusOrdemServico.RECEBIDA);
    });

    it('registra o evento OrdemDeServicoCriada', () => {
      const ordem = ordemNova();
      expect(ordem.eventos.some((evento) => evento instanceof OrdemDeServicoCriada)).toBe(true);
    });

    it('exige cliente e veiculo', () => {
      expect(() => OrdemDeServico.criar({ clienteId: '', veiculoId: 'v' })).toThrow(ErroDeValidacao);
      expect(() => OrdemDeServico.criar({ clienteId: 'c', veiculoId: '' })).toThrow(ErroDeValidacao);
    });
  });

  describe('inclusao de itens', () => {
    it('permite incluir servicos e pecas em Recebida e Em diagnostico', () => {
      const ordem = ordemNova();
      ordem.adicionarServico(novoServico(100));
      ordem.iniciarDiagnostico();
      ordem.adicionarPeca(novaPeca(50, 2));
      expect(ordem.itensServico).toHaveLength(1);
      expect(ordem.itensPeca).toHaveLength(1);
    });

    it('bloqueia a inclusao apos o envio do orcamento', () => {
      const ordem = ordemNova();
      ordem.adicionarServico(novoServico(100));
      ordem.iniciarDiagnostico();
      ordem.enviarParaAprovacao();
      expect(() => ordem.adicionarServico(novoServico(10))).toThrow(RegraDeNegocioViolada);
    });
  });

  describe('orcamento', () => {
    it('soma servicos e pecas no valor total', () => {
      const ordem = ordemNova();
      ordem.adicionarServico(novoServico(100, 2)); // 200
      ordem.adicionarPeca(novaPeca(30, 3)); // 90
      const orcamento = ordem.calcularOrcamento();
      expect(orcamento.valorServicos.reais).toBe(200);
      expect(orcamento.valorPecas.reais).toBe(90);
      expect(orcamento.valorTotal.reais).toBe(290);
    });

    it('nao envia orcamento sem itens', () => {
      const ordem = ordemNova();
      ordem.iniciarDiagnostico();
      expect(() => ordem.enviarParaAprovacao()).toThrow(RegraDeNegocioViolada);
    });
  });

  describe('ciclo de vida completo', () => {
    it('percorre todos os status ate a entrega', () => {
      const ordem = ordemNova();
      ordem.iniciarDiagnostico();
      ordem.adicionarServico(novoServico(100));
      ordem.enviarParaAprovacao();
      expect(ordem.status).toBe(StatusOrdemServico.AGUARDANDO_APROVACAO);

      ordem.aprovarOrcamento();
      expect(ordem.status).toBe(StatusOrdemServico.EM_EXECUCAO);
      expect(ordem.iniciadaExecucaoEm).not.toBeNull();
      expect(ordem.aprovacao?.decisao).toBe(DecisaoOrcamento.APROVADO);

      ordem.finalizar();
      expect(ordem.status).toBe(StatusOrdemServico.FINALIZADA);
      expect(ordem.finalizadaEm).not.toBeNull();

      ordem.entregar();
      expect(ordem.status).toBe(StatusOrdemServico.ENTREGUE);
      expect(ordem.entregueEm).not.toBeNull();
      expect(ordem.duracaoExecucaoEmMs).not.toBeNull();
    });

    it('registra o historico de cada transicao', () => {
      const ordem = ordemNova();
      ordem.iniciarDiagnostico();
      ordem.adicionarServico(novoServico(100));
      ordem.enviarParaAprovacao();
      ordem.aprovarOrcamento();
      const statusDoHistorico = ordem.historico.map((registro) => registro.status);
      expect(statusDoHistorico).toEqual([
        StatusOrdemServico.RECEBIDA,
        StatusOrdemServico.EM_DIAGNOSTICO,
        StatusOrdemServico.AGUARDANDO_APROVACAO,
        StatusOrdemServico.EM_EXECUCAO,
      ]);
    });
  });

  describe('rejeicao do orcamento', () => {
    it('retorna a ordem para Em diagnostico e registra o motivo', () => {
      const ordem = ordemNova();
      ordem.iniciarDiagnostico();
      ordem.adicionarServico(novoServico(100));
      ordem.enviarParaAprovacao();
      ordem.rejeitarOrcamento('Valor acima do esperado');
      expect(ordem.status).toBe(StatusOrdemServico.EM_DIAGNOSTICO);
      expect(ordem.aprovacao?.decisao).toBe(DecisaoOrcamento.REJEITADO);
      expect(ordem.aprovacao?.motivo).toBe('Valor acima do esperado');
    });
  });

  describe('transicoes invalidas', () => {
    it('nao aprova uma ordem recem recebida', () => {
      const ordem = ordemNova();
      expect(() => ordem.aprovarOrcamento()).toThrow(RegraDeNegocioViolada);
    });

    it('nao finaliza antes da execucao', () => {
      const ordem = ordemNova();
      expect(() => ordem.finalizar()).toThrow(RegraDeNegocioViolada);
    });

    it('nao entrega antes de finalizar', () => {
      const ordem = ordemNova();
      expect(() => ordem.entregar()).toThrow(RegraDeNegocioViolada);
    });

    it('nao inicia diagnostico duas vezes', () => {
      const ordem = ordemNova();
      ordem.iniciarDiagnostico();
      expect(() => ordem.iniciarDiagnostico()).toThrow(RegraDeNegocioViolada);
    });
  });

  describe('restauracao', () => {
    it('reconstroi a ordem a partir das propriedades persistidas', () => {
      const ordem = OrdemDeServico.restaurar(
        {
          codigo: 'OS-ABCD1234',
          clienteId: 'cliente-1',
          veiculoId: 'veiculo-1',
          status: StatusOrdemServico.EM_EXECUCAO,
          itensServico: [novoServico(100)],
          itensPeca: [novaPeca(50)],
          aprovacao: Aprovacao.aprovar(new Date()),
          historico: [{ status: StatusOrdemServico.RECEBIDA, em: new Date() }],
          criadaEm: new Date(),
          iniciadaExecucaoEm: new Date(),
          finalizadaEm: null,
          entregueEm: null,
        },
        'ordem-1',
      );
      expect(ordem.id).toBe('ordem-1');
      expect(ordem.status).toBe(StatusOrdemServico.EM_EXECUCAO);
      expect(ordem.calcularOrcamento().valorTotal.reais).toBe(150);
    });
  });
});
