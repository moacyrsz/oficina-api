import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('usuarios')
export class UsuarioOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  nome: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'senha_hash', type: 'varchar' })
  senhaHash: string;
}
