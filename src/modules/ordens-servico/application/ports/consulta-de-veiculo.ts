/**
 * Porta de leitura de veiculos consumida pela Ordem de Servico, usada para
 * identificar o veiculo pela placa na abertura da ordem e conferir sua
 * vinculacao ao cliente.
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
  /** Aceita a placa com ou sem hifen. Placa malformada gera erro de validacao. */
  buscarPorPlaca(placa: string): Promise<VeiculoConsultado | null>;
}

export const CONSULTA_DE_VEICULO = Symbol('ConsultaDeVeiculo');
