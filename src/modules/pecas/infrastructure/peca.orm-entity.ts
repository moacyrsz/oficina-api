import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Mapeamento de persistencia da peca. O preco e guardado como inteiro de
 * centavos (preco_centavos) para fidelidade ao objeto de valor monetario, e a
 * quantidade em estoque como inteiro.
 */
@Entity('pecas')
export class PecaOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  nome: string;

  @Column('varchar')
  descricao: string;

  @Column({ name: 'preco_centavos', type: 'integer' })
  precoCentavos: number;

  @Column({ name: 'quantidade_em_estoque', type: 'integer' })
  quantidadeEmEstoque: number;
}
