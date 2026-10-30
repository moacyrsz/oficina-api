import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AprovarOrcamentoPeloClienteUseCase } from '../application/aprovar-orcamento-pelo-cliente.use-case';
import { ConsultarAndamentoUseCase } from '../application/consultar-andamento.use-case';
import { RejeitarOrcamentoPeloClienteUseCase } from '../application/rejeitar-orcamento-pelo-cliente.use-case';
import { AndamentoResponse } from './dto/andamento.response';
import { DecisaoDoClienteDto, RejeicaoDoClienteDto } from './dto/decisao-do-cliente.dto';

/**
 * API publica do cliente. Nao exige autenticacao administrativa: o cliente se
 * identifica informando o codigo da ordem e o seu documento.
 */
@ApiTags('Acompanhamento (Cliente)')
@Controller('acompanhamento')
export class ConsultaPublicaController {
  constructor(
    private readonly consultarAndamento: ConsultarAndamentoUseCase,
    private readonly aprovarPeloCliente: AprovarOrcamentoPeloClienteUseCase,
    private readonly rejeitarPeloCliente: RejeitarOrcamentoPeloClienteUseCase,
  ) {}

  @Get(':codigo')
  @ApiOperation({ summary: 'Consulta o andamento de uma ordem de servico' })
  @ApiQuery({ name: 'documento', required: true, description: 'CPF ou CNPJ do cliente da ordem' })
  @ApiResponse({ status: 200, type: AndamentoResponse })
  @ApiResponse({ status: 404, description: 'Ordem nao encontrada ou documento invalido' })
  public consultar(
    @Param('codigo') codigo: string,
    @Query('documento') documento: string,
  ): Promise<AndamentoResponse> {
    return this.consultarAndamento.executar({ codigo, documento });
  }

  @Post(':codigo/orcamento/aprovar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'O cliente aprova o orcamento e autoriza a execucao' })
  @ApiResponse({ status: 200, type: AndamentoResponse })
  @ApiResponse({ status: 404, description: 'Ordem nao encontrada ou documento invalido' })
  @ApiResponse({ status: 422, description: 'Ordem nao esta aguardando aprovacao ou falta estoque' })
  public aprovar(
    @Param('codigo') codigo: string,
    @Body() dto: DecisaoDoClienteDto,
  ): Promise<AndamentoResponse> {
    return this.aprovarPeloCliente.executar({ codigo, documento: dto.documento });
  }

  @Post(':codigo/orcamento/rejeitar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'O cliente rejeita o orcamento' })
  @ApiResponse({ status: 200, type: AndamentoResponse })
  @ApiResponse({ status: 404, description: 'Ordem nao encontrada ou documento invalido' })
  @ApiResponse({ status: 422, description: 'Ordem nao esta aguardando aprovacao' })
  public rejeitar(
    @Param('codigo') codigo: string,
    @Body() dto: RejeicaoDoClienteDto,
  ): Promise<AndamentoResponse> {
    return this.rejeitarPeloCliente.executar({
      codigo,
      documento: dto.documento,
      motivo: dto.motivo,
    });
  }
}
