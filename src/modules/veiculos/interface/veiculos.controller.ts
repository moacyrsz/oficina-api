import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/infrastructure/jwt-auth.guard';
import { AtualizarVeiculoUseCase } from '../application/atualizar-veiculo.use-case';
import { BuscarVeiculoUseCase } from '../application/buscar-veiculo.use-case';
import { CriarVeiculoUseCase } from '../application/criar-veiculo.use-case';
import { ListarVeiculosUseCase } from '../application/listar-veiculos.use-case';
import { RemoverVeiculoUseCase } from '../application/remover-veiculo.use-case';
import { Placa } from '../domain/placa';
import { AtualizarVeiculoDto } from './dto/atualizar-veiculo.dto';
import { CriarVeiculoDto } from './dto/criar-veiculo.dto';
import { VeiculoResponse } from './dto/veiculo.response';

@ApiTags('Veiculos')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('veiculos')
export class VeiculosController {
  constructor(
    private readonly criarVeiculo: CriarVeiculoUseCase,
    private readonly listarVeiculos: ListarVeiculosUseCase,
    private readonly buscarVeiculo: BuscarVeiculoUseCase,
    private readonly atualizarVeiculo: AtualizarVeiculoUseCase,
    private readonly removerVeiculo: RemoverVeiculoUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo veiculo' })
  @ApiResponse({ status: 201, type: VeiculoResponse })
  public criar(@Body() dto: CriarVeiculoDto): Promise<VeiculoResponse> {
    return this.criarVeiculo.executar({
      placa: Placa.criar(dto.placa),
      marca: dto.marca,
      modelo: dto.modelo,
      ano: dto.ano,
      clienteId: dto.clienteId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lista os veiculos cadastrados' })
  @ApiResponse({ status: 200, type: [VeiculoResponse] })
  public listar(): Promise<VeiculoResponse[]> {
    return this.listarVeiculos.executar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha um veiculo pelo id' })
  @ApiResponse({ status: 200, type: VeiculoResponse })
  public buscar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<VeiculoResponse> {
    return this.buscarVeiculo.executar(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um veiculo' })
  @ApiResponse({ status: 200, type: VeiculoResponse })
  public atualizar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AtualizarVeiculoDto,
  ): Promise<VeiculoResponse> {
    return this.atualizarVeiculo.executar(id, {
      marca: dto.marca,
      modelo: dto.modelo,
      ano: dto.ano,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um veiculo' })
  @ApiResponse({ status: 204, description: 'Veiculo removido' })
  @ApiResponse({ status: 404, description: 'Veiculo nao encontrado' })
  @ApiResponse({ status: 409, description: 'Veiculo possui ordens de servico' })
  public remover(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.removerVeiculo.executar(id);
  }
}
