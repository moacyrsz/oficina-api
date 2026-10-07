import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ConflitoDeRecurso,
  ErroDeValidacao,
  FalhaDeAutenticacao,
  RecursoNaoEncontrado,
  RegraDeNegocioViolada,
} from '../../domain/excecoes';

/**
 * Filtro global que traduz excecoes de dominio e do framework para respostas
 * HTTP consistentes. A camada de dominio lanca excecoes de negocio sem conhecer
 * HTTP; aqui elas ganham o codigo de status adequado.
 */
@Catch()
export class FiltroDeExcecoes implements ExceptionFilter {
  private readonly logger = new Logger(FiltroDeExcecoes.name);

  public catch(excecao: unknown, host: ArgumentsHost): void {
    const contexto = host.switchToHttp();
    const resposta = contexto.getResponse<Response>();
    const requisicao = contexto.getRequest<Request>();

    const { status, mensagem } = this.resolver(excecao);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Erro nao tratado em ${requisicao.method} ${requisicao.url}`,
        excecao instanceof Error ? excecao.stack : String(excecao),
      );
    }

    resposta.status(status).json({
      statusCode: status,
      mensagem,
      caminho: requisicao.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolver(excecao: unknown): { status: number; mensagem: string | string[] } {
    if (excecao instanceof HttpException) {
      const corpo = excecao.getResponse();
      const mensagem =
        typeof corpo === 'string'
          ? corpo
          : ((corpo as Record<string, unknown>).message as string | string[]) ?? excecao.message;
      return { status: excecao.getStatus(), mensagem };
    }
    if (excecao instanceof FalhaDeAutenticacao) {
      return { status: HttpStatus.UNAUTHORIZED, mensagem: excecao.message };
    }
    if (excecao instanceof ErroDeValidacao) {
      return { status: HttpStatus.BAD_REQUEST, mensagem: excecao.message };
    }
    if (excecao instanceof RecursoNaoEncontrado) {
      return { status: HttpStatus.NOT_FOUND, mensagem: excecao.message };
    }
    if (excecao instanceof ConflitoDeRecurso) {
      return { status: HttpStatus.CONFLICT, mensagem: excecao.message };
    }
    if (excecao instanceof RegraDeNegocioViolada) {
      return { status: HttpStatus.UNPROCESSABLE_ENTITY, mensagem: excecao.message };
    }
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      mensagem: 'Erro interno do servidor.',
    };
  }
}
