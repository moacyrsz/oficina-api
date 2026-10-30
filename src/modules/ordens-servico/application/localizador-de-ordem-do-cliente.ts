import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { OrdemDeServico } from '../domain/ordem-de-servico';
import {
  ORDEM_DE_SERVICO_REPOSITORY,
  OrdemDeServicoRepository,
} from '../domain/ordem-de-servico.repository';
import { CONSULTA_DE_CLIENTE, ConsultaDeCliente } from './ports/consulta-de-cliente';

function apenasDigitos(valor: string): string {
  return (valor ?? '').replace(/\D/g, '');
}

/**
 * Localiza a ordem para as rotas publicas do cliente. O cliente informa o
 * codigo da ordem e o seu documento (CPF ou CNPJ), que funciona como fator de
 * verificacao: a ordem so e devolvida se o documento for o do cliente dela.
 */
@Injectable()
export class LocalizadorDeOrdemDoCliente {
  constructor(
    @Inject(ORDEM_DE_SERVICO_REPOSITORY) private readonly ordens: OrdemDeServicoRepository,
    @Inject(CONSULTA_DE_CLIENTE) private readonly clientes: ConsultaDeCliente,
  ) {}

  public async localizar(codigo: string, documento: string): Promise<OrdemDeServico> {
    // Resposta unica para "nao encontrada" e "documento invalido". Diferenciar
    // os dois casos permitiria enumerar codigos de ordens validos (oraculo).
    const naoEncontradaOuInvalida = () =>
      new RecursoNaoEncontrado('Ordem de servico nao encontrada ou documento invalido.');

    const ordem = await this.ordens.buscarPorCodigo((codigo ?? '').trim().toUpperCase());
    if (!ordem) {
      throw naoEncontradaOuInvalida();
    }

    const cliente = await this.clientes.buscarPorId(ordem.clienteId);
    if (!cliente || apenasDigitos(cliente.documento) !== apenasDigitos(documento)) {
      throw naoEncontradaOuInvalida();
    }

    return ordem;
  }
}
