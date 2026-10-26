import { ConflitoDeRecurso, RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { Cliente } from '../domain/cliente';
import { ClienteRepository } from '../domain/cliente.repository';
import { Documento } from '../domain/documento';
import { VinculosDoCliente } from './ports/vinculos-do-cliente';
import { RemoverClienteUseCase } from './remover-cliente.use-case';

class RepositorioDeClientesEmMemoria implements ClienteRepository {
  public readonly dados = new Map<string, Cliente>();

  public async salvar(cliente: Cliente): Promise<void> {
    this.dados.set(cliente.id, cliente);
  }

  public async buscarPorId(id: string): Promise<Cliente | null> {
    return this.dados.get(id) ?? null;
  }

  public async buscarPorDocumento(documento: string): Promise<Cliente | null> {
    const digitos = documento.replace(/\D/g, '');
    return [...this.dados.values()].find((cliente) => cliente.documento.valor === digitos) ?? null;
  }

  public async listar(): Promise<Cliente[]> {
    return [...this.dados.values()];
  }

  public async remover(id: string): Promise<void> {
    this.dados.delete(id);
  }
}

class VinculosDoClienteFake implements VinculosDoCliente {
  constructor(
    private readonly comVeiculos: string[] = [],
    private readonly comOrdens: string[] = [],
  ) {}

  public async possuiVeiculos(clienteId: string): Promise<boolean> {
    return this.comVeiculos.includes(clienteId);
  }

  public async possuiOrdensDeServico(clienteId: string): Promise<boolean> {
    return this.comOrdens.includes(clienteId);
  }
}

async function montarCenario(vinculos: { veiculos?: boolean; ordens?: boolean } = {}) {
  const clientes = new RepositorioDeClientesEmMemoria();
  const cliente = Cliente.criar({
    nome: 'Maria Oliveira',
    documento: Documento.criar('52998224725'),
    email: 'maria@email.com',
    telefone: '11988887777',
  });
  await clientes.salvar(cliente);
  const fake = new VinculosDoClienteFake(
    vinculos.veiculos ? [cliente.id] : [],
    vinculos.ordens ? [cliente.id] : [],
  );
  return { clientes, cliente, remover: new RemoverClienteUseCase(clientes, fake) };
}

describe('Remocao de cliente', () => {
  it('remove o cliente sem veiculos nem ordens de servico', async () => {
    const { clientes, cliente, remover } = await montarCenario();

    await remover.executar(cliente.id);

    expect(clientes.dados.has(cliente.id)).toBe(false);
  });

  it('impede remover o cliente que possui veiculos cadastrados', async () => {
    const { clientes, cliente, remover } = await montarCenario({ veiculos: true });

    await expect(remover.executar(cliente.id)).rejects.toBeInstanceOf(ConflitoDeRecurso);
    expect(clientes.dados.has(cliente.id)).toBe(true);
  });

  it('impede remover o cliente que possui ordens de servico, preservando o historico', async () => {
    const { clientes, cliente, remover } = await montarCenario({ ordens: true });

    await expect(remover.executar(cliente.id)).rejects.toBeInstanceOf(ConflitoDeRecurso);
    expect(clientes.dados.has(cliente.id)).toBe(true);
  });

  it('retorna 404 ao remover cliente inexistente', async () => {
    const { remover } = await montarCenario();

    await expect(remover.executar('inexistente')).rejects.toBeInstanceOf(RecursoNaoEncontrado);
  });
});
