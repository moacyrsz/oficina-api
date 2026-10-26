import { ConflitoDeRecurso, RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { Placa } from '../domain/placa';
import { Veiculo } from '../domain/veiculo';
import { VeiculoRepository } from '../domain/veiculo.repository';
import { VinculosDoVeiculo } from './ports/vinculos-do-veiculo';
import { RemoverVeiculoUseCase } from './remover-veiculo.use-case';

class RepositorioDeVeiculosEmMemoria implements VeiculoRepository {
  public readonly dados = new Map<string, Veiculo>();

  public async salvar(veiculo: Veiculo): Promise<void> {
    this.dados.set(veiculo.id, veiculo);
  }

  public async buscarPorId(id: string): Promise<Veiculo | null> {
    return this.dados.get(id) ?? null;
  }

  public async buscarPorPlaca(placa: string): Promise<Veiculo | null> {
    return [...this.dados.values()].find((veiculo) => veiculo.placa.valor === placa) ?? null;
  }

  public async listar(): Promise<Veiculo[]> {
    return [...this.dados.values()];
  }

  public async remover(id: string): Promise<void> {
    this.dados.delete(id);
  }
}

class VinculosDoVeiculoFake implements VinculosDoVeiculo {
  constructor(private readonly comOrdens: string[] = []) {}

  public async possuiOrdensDeServico(veiculoId: string): Promise<boolean> {
    return this.comOrdens.includes(veiculoId);
  }
}

async function montarCenario(possuiOrdens = false) {
  const veiculos = new RepositorioDeVeiculosEmMemoria();
  const veiculo = Veiculo.criar({
    placa: Placa.criar('ABC1D23'),
    marca: 'Fiat',
    modelo: 'Uno',
    ano: 2020,
    clienteId: 'cliente-1',
  });
  await veiculos.salvar(veiculo);
  const vinculos = new VinculosDoVeiculoFake(possuiOrdens ? [veiculo.id] : []);
  return { veiculos, veiculo, remover: new RemoverVeiculoUseCase(veiculos, vinculos) };
}

describe('Remocao de veiculo', () => {
  it('remove o veiculo que nunca teve ordem de servico', async () => {
    const { veiculos, veiculo, remover } = await montarCenario();

    await remover.executar(veiculo.id);

    expect(veiculos.dados.has(veiculo.id)).toBe(false);
  });

  it('impede remover o veiculo que possui ordens de servico, preservando o historico', async () => {
    const { veiculos, veiculo, remover } = await montarCenario(true);

    await expect(remover.executar(veiculo.id)).rejects.toBeInstanceOf(ConflitoDeRecurso);
    expect(veiculos.dados.has(veiculo.id)).toBe(true);
  });

  it('retorna 404 ao remover veiculo inexistente', async () => {
    const { remover } = await montarCenario();

    await expect(remover.executar('inexistente')).rejects.toBeInstanceOf(RecursoNaoEncontrado);
  });
});
