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
import { AtualizarClienteUseCase } from '../application/atualizar-cliente.use-case';
import { BuscarClienteUseCase } from '../application/buscar-cliente.use-case';
import { ClienteSaida } from '../application/cliente.saida';
import { CriarClienteUseCase } from '../application/criar-cliente.use-case';
import { ListarClientesUseCase } from '../application/listar-clientes.use-case';
import { RemoverClienteUseCase } from '../application/remover-cliente.use-case';
import { AtualizarClienteDto } from './dto/atualizar-cliente.dto';
import { ClienteResponse } from './dto/cliente.response';
import { CriarClienteDto } from './dto/criar-cliente.dto';

@ApiTags('Clientes')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly criarCliente: CriarClienteUseCase,
    private readonly listarClientes: ListarClientesUseCase,
    private readonly buscarCliente: BuscarClienteUseCase,
    private readonly atualizarCliente: AtualizarClienteUseCase,
    private readonly removerCliente: RemoverClienteUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo cliente' })
  @ApiResponse({ status: 201, type: ClienteResponse })
  @ApiResponse({ status: 409, description: 'Documento ja cadastrado' })
  public criar(@Body() dto: CriarClienteDto): Promise<ClienteSaida> {
    return this.criarCliente.executar({
      nome: dto.nome,
      documento: dto.documento,
      email: dto.email,
      telefone: dto.telefone,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lista os clientes cadastrados' })
  @ApiResponse({ status: 200, type: [ClienteResponse] })
  public listar(): Promise<ClienteSaida[]> {
    return this.listarClientes.executar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um cliente pelo id' })
  @ApiResponse({ status: 200, type: ClienteResponse })
  @ApiResponse({ status: 404, description: 'Cliente nao encontrado' })
  public buscar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ClienteSaida> {
    return this.buscarCliente.executar(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um cliente' })
  @ApiResponse({ status: 200, type: ClienteResponse })
  @ApiResponse({ status: 404, description: 'Cliente nao encontrado' })
  public atualizar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AtualizarClienteDto,
  ): Promise<ClienteSaida> {
    return this.atualizarCliente.executar(id, {
      nome: dto.nome,
      email: dto.email,
      telefone: dto.telefone,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um cliente' })
  @ApiResponse({ status: 204, description: 'Cliente removido' })
  @ApiResponse({ status: 404, description: 'Cliente nao encontrado' })
  public remover(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.removerCliente.executar(id);
  }
}
