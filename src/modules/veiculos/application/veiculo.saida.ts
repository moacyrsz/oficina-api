import { Veiculo } from '../domain/veiculo';

/**
 * Estrutura simples de saida do veiculo. Mantem os controllers isolados do
 * modelo de dominio e expoe a placa ja formatada para leitura.
 */
export interface VeiculoSaida {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  clienteId: string;
}

export function paraSaida(veiculo: Veiculo): VeiculoSaida {
  return {
    id: veiculo.id,
    placa: veiculo.placa.formatado,
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    ano: veiculo.ano,
    clienteId: veiculo.clienteId,
  };
}
