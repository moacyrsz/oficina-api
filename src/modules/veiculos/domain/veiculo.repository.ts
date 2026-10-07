import { Veiculo } from './veiculo';

export interface VeiculoRepository {
  salvar(veiculo: Veiculo): Promise<void>;
  buscarPorId(id: string): Promise<Veiculo | null>;
  buscarPorPlaca(placa: string): Promise<Veiculo | null>;
  listar(): Promise<Veiculo[]>;
  remover(id: string): Promise<void>;
}

export const VEICULO_REPOSITORY = Symbol('VeiculoRepository');
