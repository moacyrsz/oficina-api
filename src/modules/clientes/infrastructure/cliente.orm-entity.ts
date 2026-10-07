import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Mapeamento de persistencia do agregado Cliente. O documento e guardado apenas
 * com os digitos e possui indice unico, garantindo a unicidade do cadastro no
 * nivel do banco. O tipo do documento (CPF ou CNPJ) e guardado como texto, sem
 * uso de enum nativo.
 */
@Entity('clientes')
export class ClienteOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  nome: string;

  @Index({ unique: true })
  @Column('varchar')
  documento: string;

  @Column({ name: 'tipo_documento', type: 'varchar' })
  tipoDocumento: string;

  @Column('varchar')
  email: string;

  @Column('varchar')
  telefone: string;
}
