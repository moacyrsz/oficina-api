import { Cliente } from '../domain/cliente';
import { Documento } from '../domain/documento';
import { ClienteOrmEntity } from './cliente.orm-entity';

/**
 * Converte entre o agregado Cliente e sua representacao de persistencia. Na
 * volta do banco o documento e reconstruido pelo objeto de valor a partir dos
 * digitos guardados.
 */
export class ClienteMapper {
  public static paraDominio(registro: ClienteOrmEntity): Cliente {
    return Cliente.restaurar(
      {
        nome: registro.nome,
        documento: Documento.criar(registro.documento),
        email: registro.email,
        telefone: registro.telefone,
      },
      registro.id,
    );
  }

  public static paraPersistencia(cliente: Cliente): ClienteOrmEntity {
    const registro = new ClienteOrmEntity();
    registro.id = cliente.id;
    registro.nome = cliente.nome;
    registro.documento = cliente.documento.valor;
    registro.tipoDocumento = cliente.documento.tipo;
    registro.email = cliente.email;
    registro.telefone = cliente.telefone;
    return registro;
  }
}
