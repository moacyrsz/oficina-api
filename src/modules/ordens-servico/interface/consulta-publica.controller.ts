import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConsultarAndamentoUseCase } from '../application/consultar-andamento.use-case';
import { AndamentoResponse } from './dto/andamento.response';

/**
 * API publica de acompanhamento. Nao exige autenticacao administrativa: o
 * cliente se identifica informando o codigo da ordem e o seu documento.
 */
@ApiTags('Acompanhamento (Cliente)')
@Controller('acompanhamento')
export class ConsultaPublicaController {
  constructor(private readonly consultarAndamento: ConsultarAndamentoUseCase) {}

  @Get(':codigo')
  @ApiOperation({ summary: 'Consulta o andamento de uma ordem de servico' })
  @ApiQuery({ name: 'documento', required: true, description: 'CPF ou CNPJ do cliente da ordem' })
  @ApiResponse({ status: 200, type: AndamentoResponse })
  public consultar(
    @Param('codigo') codigo: string,
    @Query('documento') documento: string,
  ): Promise<AndamentoResponse> {
    return this.consultarAndamento.executar({ codigo, documento });
  }
}
