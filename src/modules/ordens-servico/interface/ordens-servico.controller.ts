import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErroDeValidacao } from '../../../shared/domain/excecoes';
import { JwtAuthGuard } from '../../auth/infrastructure/jwt-auth.guard';
import { AdicionarPecaUseCase } from '../application/adicionar-peca.use-case';
import { AdicionarServicoUseCase } from '../application/adicionar-servico.use-case';
import { AprovarOrcamentoUseCase } from '../application/aprovar-orcamento.use-case';
import { CalcularTempoMedioUseCase } from '../application/calcular-tempo-medio.use-case';
import { CriarOrdemDeServicoUseCase } from '../application/criar-ordem-de-servico.use-case';
import { DetalharOrdemUseCase } from '../application/detalhar-ordem.use-case';
import { EntregarVeiculoUseCase } from '../application/entregar-veiculo.use-case';
import { EnviarOrcamentoUseCase } from '../application/enviar-orcamento.use-case';
import { FinalizarOrdemUseCase } from '../application/finalizar-ordem.use-case';
import { IniciarDiagnosticoUseCase } from '../application/iniciar-diagnostico.use-case';
import { ListarOrdensUseCase } from '../application/listar-ordens.use-case';
import { RejeitarOrcamentoUseCase } from '../application/rejeitar-orcamento.use-case';
import { StatusOrdemServico } from '../domain/status-ordem-servico';
import { AdicionarPecaDto } from './dto/adicionar-peca.dto';
import { AdicionarServicoDto } from './dto/adicionar-servico.dto';
import { CriarOrdemDto } from './dto/criar-ordem.dto';
import { OrdemDeServicoResponse } from './dto/ordem-de-servico.response';
import { RejeitarOrcamentoDto } from './dto/rejeitar-orcamento.dto';
import { TempoMedioResponse } from './dto/tempo-medio.response';

@ApiTags('Ordens de Servico')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('ordens-servico')
export class OrdensServicoController {
  constructor(
    private readonly criarOrdem: CriarOrdemDeServicoUseCase,
    private readonly iniciarDiagnostico: IniciarDiagnosticoUseCase,
    private readonly adicionarServico: AdicionarServicoUseCase,
    private readonly adicionarPeca: AdicionarPecaUseCase,
    private readonly enviarOrcamento: EnviarOrcamentoUseCase,
    private readonly aprovarOrcamento: AprovarOrcamentoUseCase,
    private readonly rejeitarOrcamento: RejeitarOrcamentoUseCase,
    private readonly finalizarOrdem: FinalizarOrdemUseCase,
    private readonly entregarVeiculo: EntregarVeiculoUseCase,
    private readonly listarOrdens: ListarOrdensUseCase,
    private readonly detalharOrdem: DetalharOrdemUseCase,
    private readonly calcularTempoMedio: CalcularTempoMedioUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Abre uma ordem de servico a partir do CPF/CNPJ do cliente e da placa do veiculo' })
  @ApiResponse({ status: 201, type: OrdemDeServicoResponse })
  @ApiResponse({ status: 400, description: 'Documento ou placa em formato invalido' })
  @ApiResponse({ status: 404, description: 'Cliente ou veiculo nao cadastrado' })
  @ApiResponse({ status: 422, description: 'O veiculo nao pertence ao cliente' })
  public criar(@Body() dto: CriarOrdemDto): Promise<OrdemDeServicoResponse> {
    return this.criarOrdem.executar({ documento: dto.documento, placa: dto.placa });
  }

  @Get()
  @ApiOperation({ summary: 'Lista as ordens de servico, com filtro opcional por status' })
  @ApiQuery({ name: 'status', enum: StatusOrdemServico, required: false })
  @ApiResponse({ status: 200, type: [OrdemDeServicoResponse] })
  public listar(@Query('status') status?: string): Promise<OrdemDeServicoResponse[]> {
    if (status && !Object.values(StatusOrdemServico).includes(status as StatusOrdemServico)) {
      throw new ErroDeValidacao('Status informado e invalido.');
    }
    return this.listarOrdens.executar(status ? { status: status as StatusOrdemServico } : undefined);
  }

  @Get('metricas/tempo-medio')
  @ApiOperation({ summary: 'Calcula o tempo medio de execucao dos servicos' })
  @ApiResponse({ status: 200, type: TempoMedioResponse })
  public tempoMedio(): Promise<TempoMedioResponse> {
    return this.calcularTempoMedio.executar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha uma ordem de servico pelo id' })
  @ApiResponse({ status: 200, type: OrdemDeServicoResponse })
  public detalhar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<OrdemDeServicoResponse> {
    return this.detalharOrdem.executar(id);
  }

  @Post(':id/diagnostico')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicia o diagnostico da ordem' })
  @ApiResponse({ status: 200, type: OrdemDeServicoResponse })
  public diagnosticar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<OrdemDeServicoResponse> {
    return this.iniciarDiagnostico.executar(id);
  }

  @Post(':id/itens-servico')
  @ApiOperation({ summary: 'Inclui um servico na ordem' })
  @ApiResponse({ status: 201, type: OrdemDeServicoResponse })
  public incluirServico(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AdicionarServicoDto,
  ): Promise<OrdemDeServicoResponse> {
    return this.adicionarServico.executar({
      ordemId: id,
      servicoId: dto.servicoId,
      quantidade: dto.quantidade,
    });
  }

  @Post(':id/itens-peca')
  @ApiOperation({ summary: 'Inclui uma peca ou insumo na ordem' })
  @ApiResponse({ status: 201, type: OrdemDeServicoResponse })
  public incluirPeca(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AdicionarPecaDto,
  ): Promise<OrdemDeServicoResponse> {
    return this.adicionarPeca.executar({
      ordemId: id,
      pecaId: dto.pecaId,
      quantidade: dto.quantidade,
    });
  }

  @Post(':id/orcamento/enviar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gera e envia o orcamento para aprovacao' })
  @ApiResponse({ status: 200, type: OrdemDeServicoResponse })
  public enviar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<OrdemDeServicoResponse> {
    return this.enviarOrcamento.executar(id);
  }

  @Post(':id/orcamento/aprovar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registra a aprovacao do orcamento e inicia a execucao' })
  @ApiResponse({ status: 200, type: OrdemDeServicoResponse })
  public aprovar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<OrdemDeServicoResponse> {
    return this.aprovarOrcamento.executar(id);
  }

  @Post(':id/orcamento/rejeitar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registra a rejeicao do orcamento' })
  @ApiResponse({ status: 200, type: OrdemDeServicoResponse })
  public rejeitar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: RejeitarOrcamentoDto,
  ): Promise<OrdemDeServicoResponse> {
    return this.rejeitarOrcamento.executar(id, dto.motivo);
  }

  @Post(':id/finalizar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finaliza a execucao da ordem' })
  @ApiResponse({ status: 200, type: OrdemDeServicoResponse })
  public finalizar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<OrdemDeServicoResponse> {
    return this.finalizarOrdem.executar(id);
  }

  @Post(':id/entregar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registra a entrega do veiculo ao cliente' })
  @ApiResponse({ status: 200, type: OrdemDeServicoResponse })
  public entregar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<OrdemDeServicoResponse> {
    return this.entregarVeiculo.executar(id);
  }
}
