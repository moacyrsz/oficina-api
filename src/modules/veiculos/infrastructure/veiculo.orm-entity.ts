import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Mapeamento de persistencia do agregado Veiculo. A placa possui indice unico
 * para garantir, tambem no banco, que nao existam dois veiculos com a mesma
 * placa.
 */
@Entity('veiculos')
export class VeiculoOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar' })
  placa: string;

  @Column({ type: 'varchar' })
  marca: string;

  @Column({ type: 'varchar' })
  modelo: string;

  @Column({ type: 'integer' })
  ano: number;

  @Column({ name: 'cliente_id', type: 'varchar' })
  clienteId: string;
}
