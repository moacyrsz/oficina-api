import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

export interface ItemServicoPersistido {
  itemId: string;
  servicoId: string;
  descricao: string;
  valorCentavos: number;
  quantidade: number;
}

export interface ItemPecaPersistido {
  itemId: string;
  pecaId: string;
  descricao: string;
  valorCentavos: number;
  quantidade: number;
}

export interface AprovacaoPersistida {
  decisao: string;
  registradoEm: string;
  motivo?: string;
}

export interface RegistroStatusPersistido {
  status: string;
  em: string;
}

/**
 * Mapeamento do agregado Ordem de Servico. O agregado e persistido como uma
 * unidade: os itens, o historico e a aprovacao sao guardados em colunas JSON,
 * pois so fazem sentido dentro do agregado e nunca sao consultados isoladamente.
 * Isso preserva o limite do agregado e simplifica a consistencia transacional.
 */
@Entity('ordens_servico')
export class OrdemDeServicoOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar' })
  codigo: string;

  @Column({ name: 'cliente_id', type: 'varchar' })
  clienteId: string;

  @Column({ name: 'veiculo_id', type: 'varchar' })
  veiculoId: string;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ name: 'itens_servico', type: 'simple-json' })
  itensServico: ItemServicoPersistido[];

  @Column({ name: 'itens_peca', type: 'simple-json' })
  itensPeca: ItemPecaPersistido[];

  @Column({ type: 'simple-json', nullable: true })
  aprovacao: AprovacaoPersistida | null;

  @Column({ type: 'simple-json' })
  historico: RegistroStatusPersistido[];

  // As datas sao guardadas como texto ISO 8601 (UTC). O agregado nunca e
  // consultado por intervalo de datas (o tempo medio e calculado em memoria a
  // partir dos agregados carregados), entao texto ISO atende e mantem o
  // mapeamento portavel entre bancos.
  @Column({ name: 'criada_em', type: 'varchar' })
  criadaEm: string;

  @Column({ name: 'iniciada_execucao_em', type: 'varchar', nullable: true })
  iniciadaExecucaoEm: string | null;

  @Column({ name: 'finalizada_em', type: 'varchar', nullable: true })
  finalizadaEm: string | null;

  @Column({ name: 'entregue_em', type: 'varchar', nullable: true })
  entregueEm: string | null;
}
