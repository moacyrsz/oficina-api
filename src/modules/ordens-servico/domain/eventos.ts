import { EventoDeDominioBase } from '../../../shared/domain/evento-de-dominio';

/**
 * Eventos de dominio da Ordem de Servico. Representam fatos de negocio ja
 * ocorridos e sao acumulados na raiz do agregado durante as operacoes. Mapeiam
 * diretamente os post-its laranja do Event Storming documentado em docs/ddd.
 */
export class OrdemDeServicoCriada extends EventoDeDominioBase {
  constructor(idDaOrdem: string, public readonly codigo: string) {
    super('OrdemDeServicoCriada', idDaOrdem);
  }
}

export class DiagnosticoIniciado extends EventoDeDominioBase {
  constructor(idDaOrdem: string) {
    super('DiagnosticoIniciado', idDaOrdem);
  }
}

export class ItemServicoAdicionado extends EventoDeDominioBase {
  constructor(idDaOrdem: string, public readonly servicoId: string) {
    super('ItemServicoAdicionado', idDaOrdem);
  }
}

export class ItemPecaAdicionado extends EventoDeDominioBase {
  constructor(idDaOrdem: string, public readonly pecaId: string) {
    super('ItemPecaAdicionado', idDaOrdem);
  }
}

export class OrcamentoEnviadoParaAprovacao extends EventoDeDominioBase {
  constructor(idDaOrdem: string, public readonly valorTotalCentavos: number) {
    super('OrcamentoEnviadoParaAprovacao', idDaOrdem);
  }
}

export class OrcamentoAprovado extends EventoDeDominioBase {
  constructor(idDaOrdem: string) {
    super('OrcamentoAprovado', idDaOrdem);
  }
}

export class OrcamentoRejeitado extends EventoDeDominioBase {
  constructor(idDaOrdem: string, public readonly motivo?: string) {
    super('OrcamentoRejeitado', idDaOrdem);
  }
}

export class OrdemFinalizada extends EventoDeDominioBase {
  constructor(idDaOrdem: string) {
    super('OrdemFinalizada', idDaOrdem);
  }
}

export class VeiculoEntregue extends EventoDeDominioBase {
  constructor(idDaOrdem: string) {
    super('VeiculoEntregue', idDaOrdem);
  }
}
