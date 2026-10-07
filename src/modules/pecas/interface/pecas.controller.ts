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
import { AtualizarPecaUseCase } from '../application/atualizar-peca.use-case';
import { BuscarPecaUseCase } from '../application/buscar-peca.use-case';
import { CriarPecaUseCase } from '../application/criar-peca.use-case';
import { ListarPecasUseCase } from '../application/listar-pecas.use-case';
import { RemoverPecaUseCase } from '../application/remover-peca.use-case';
import { ReporEstoqueUseCase } from '../application/repor-estoque.use-case';
import { AtualizarPecaDto } from './dto/atualizar-peca.dto';
import { CriarPecaDto } from './dto/criar-peca.dto';
import { PecaResponse } from './dto/peca.response';
import { ReporEstoqueDto } from './dto/repor-estoque.dto';

@ApiTags('Pecas e Insumos')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('pecas')
export class PecasController {
  constructor(
    private readonly criarPeca: CriarPecaUseCase,
    private readonly listarPecas: ListarPecasUseCase,
    private readonly buscarPeca: BuscarPecaUseCase,
    private readonly atualizarPeca: AtualizarPecaUseCase,
    private readonly removerPeca: RemoverPecaUseCase,
    private readonly reporEstoque: ReporEstoqueUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra uma nova peca ou insumo' })
  @ApiResponse({ status: 201, type: PecaResponse })
  public criar(@Body() dto: CriarPecaDto): Promise<PecaResponse> {
    return this.criarPeca.executar({
      nome: dto.nome,
      descricao: dto.descricao,
      precoUnitario: dto.precoUnitario,
      quantidadeEmEstoque: dto.quantidadeEmEstoque,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as pecas cadastradas' })
  @ApiResponse({ status: 200, type: [PecaResponse] })
  public listar(): Promise<PecaResponse[]> {
    return this.listarPecas.executar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha uma peca pelo id' })
  @ApiResponse({ status: 200, type: PecaResponse })
  public detalhar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<PecaResponse> {
    return this.buscarPeca.executar(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza os dados cadastrais de uma peca' })
  @ApiResponse({ status: 200, type: PecaResponse })
  public atualizar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AtualizarPecaDto,
  ): Promise<PecaResponse> {
    return this.atualizarPeca.executar({
      id,
      nome: dto.nome,
      descricao: dto.descricao,
      precoUnitario: dto.precoUnitario,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma peca do catalogo' })
  @ApiResponse({ status: 204, description: 'Peca removida com sucesso' })
  public remover(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.removerPeca.executar(id);
  }

  @Post(':id/estoque/repor')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Repoe o estoque de uma peca' })
  @ApiResponse({ status: 200, type: PecaResponse })
  public repor(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: ReporEstoqueDto,
  ): Promise<PecaResponse> {
    return this.reporEstoque.executar({ id, quantidade: dto.quantidade });
  }
}
