/**
 * Porta de leitura de clientes consumida pela Ordem de Servico, usada para
 * identificar o cliente pelo documento na abertura da ordem e para conferir o
 * documento nas rotas publicas de acompanhamento.
 */
export interface ClienteConsultado {
  id: string;
  nome: string;
  documento: string;
}

export interface ConsultaDeCliente {
  buscarPorId(id: string): Promise<ClienteConsultado | null>;
  /** Aceita CPF ou CNPJ com ou sem mascara. Documento malformado gera erro de validacao. */
  buscarPorDocumento(documento: string): Promise<ClienteConsultado | null>;
}

export const CONSULTA_DE_CLIENTE = Symbol('ConsultaDeCliente');
