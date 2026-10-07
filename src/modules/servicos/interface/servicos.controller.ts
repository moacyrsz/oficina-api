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
import { AtualizarServicoUseCase } from '../application/atualizar-servico.use-case';
import { BuscarServicoUseCase } from '../application/buscar-servico.use-case';
import { CriarServicoUseCase } from '../application/criar-servico.use-case';
import { ListarServicosUseCase } from '../application/listar-servicos.use-case';
import { RemoverServicoUseCase } from '../application/remover-servico.use-case';
import { AtualizarServicoDto } from './dto/atualizar-servico.dto';
import { CriarServicoDto } from './dto/criar-servico.dto';
import { ServicoResponse } from './dto/servico.response';

@ApiTags('Servicos')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('servicos')
export class ServicosController {
  constructor(
    private readonly criarServico: CriarServicoUseCase,
    private readonly listarServicos: ListarServicosUseCase,
    private readonly buscarServico: BuscarServicoUseCase,
    private readonly atualizarServico: AtualizarServicoUseCase,
    private readonly removerServico: RemoverServicoUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo servico no catalogo' })
  @ApiResponse({ status: 201, type: ServicoResponse })
  public criar(@Body() dto: CriarServicoDto): Promise<ServicoResponse> {
    return this.criarServico.executar({
      nome: dto.nome,
      descricao: dto.descricao,
      valor: dto.valor,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lista os servicos do catalogo' })
  @ApiResponse({ status: 200, type: [ServicoResponse] })
  public listar(): Promise<ServicoResponse[]> {
    return this.listarServicos.executar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha um servico pelo id' })
  @ApiResponse({ status: 200, type: ServicoResponse })
  public buscar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ServicoResponse> {
    return this.buscarServico.executar(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um servico' })
  @ApiResponse({ status: 200, type: ServicoResponse })
  public atualizar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AtualizarServicoDto,
  ): Promise<ServicoResponse> {
    return this.atualizarServico.executar({
      id,
      nome: dto.nome,
      descricao: dto.descricao,
      valor: dto.valor,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um servico do catalogo' })
  @ApiResponse({ status: 204 })
  public remover(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.removerServico.executar(id);
  }
}
