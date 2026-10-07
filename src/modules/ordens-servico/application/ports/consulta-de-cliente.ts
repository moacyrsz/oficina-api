/**
 * Porta de leitura de clientes consumida pela Ordem de Servico, usada para
 * validar a existencia do cliente e para conferir o documento na consulta
 * publica de acompanhamento.
 */
export interface ClienteConsultado {
  id: string;
  nome: string;
  documento: string;
}

export interface ConsultaDeCliente {
  buscarPorId(id: string): Promise<ClienteConsultado | null>;
}

export const CONSULTA_DE_CLIENTE = Symbol('ConsultaDeCliente');
