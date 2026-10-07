/**
 * Porta de leitura de veiculos consumida pela Ordem de Servico, usada para
 * validar a existencia do veiculo e sua vinculacao ao cliente informado.
 */
export interface VeiculoConsultado {
  id: string;
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
}

export interface ConsultaDeVeiculo {
  buscarPorId(id: string): Promise<VeiculoConsultado | null>;
}

export const CONSULTA_DE_VEICULO = Symbol('ConsultaDeVeiculo');
