import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Mapeamento do agregado Servico. O valor monetario e guardado como um inteiro
 * de centavos na coluna valor_centavos, preservando a precisao evitada pela
 * aritmetica de ponto flutuante.
 */
@Entity('servicos')
export class ServicoOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  nome: string;

  @Column('varchar')
  descricao: string;

  @Column({ name: 'valor_centavos', type: 'integer' })
  valorCentavos: number;
}
