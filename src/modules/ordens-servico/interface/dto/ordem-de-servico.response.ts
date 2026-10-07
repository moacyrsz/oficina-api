import { ApiProperty } from '@nestjs/swagger';
import { StatusOrdemServico } from '../../domain/status-ordem-servico';
import { DecisaoOrcamento } from '../../domain/aprovacao';

export class ItemResponse {
  @ApiProperty() descricao: string;
  @ApiProperty({ description: 'Id do servico ou peca de origem' }) referenciaId: string;
  @ApiProperty({ example: 150.0 }) valorUnitario: number;
  @ApiProperty({ example: 1 }) quantidade: number;
  @ApiProperty({ example: 150.0 }) subtotal: number;
}

export class OrcamentoResponse {
  @ApiProperty({ example: 300.0 }) valorServicos: number;
  @ApiProperty({ example: 120.0 }) valorPecas: number;
  @ApiProperty({ example: 420.0 }) valorTotal: number;
}

export class AprovacaoResponse {
  @ApiProperty({ enum: DecisaoOrcamento }) decisao: DecisaoOrcamento;
  @ApiProperty() registradoEm: string;
  @ApiProperty({ required: false }) motivo?: string;
}

export class RegistroStatusResponse {
  @ApiProperty({ enum: StatusOrdemServico }) status: StatusOrdemServico;
  @ApiProperty() em: string;
}

export class OrdemDeServicoResponse {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ example: 'OS-1A2B3C4D' }) codigo: string;
  @ApiProperty({ format: 'uuid' }) clienteId: string;
  @ApiProperty({ format: 'uuid' }) veiculoId: string;
  @ApiProperty({ enum: StatusOrdemServico }) status: StatusOrdemServico;
  @ApiProperty({ type: [ItemResponse] }) itensServico: ItemResponse[];
  @ApiProperty({ type: [ItemResponse] }) itensPeca: ItemResponse[];
  @ApiProperty({ type: OrcamentoResponse }) orcamento: OrcamentoResponse;
  @ApiProperty({ type: AprovacaoResponse, nullable: true }) aprovacao: AprovacaoResponse | null;
  @ApiProperty({ type: [RegistroStatusResponse] }) historico: RegistroStatusResponse[];
  @ApiProperty() criadaEm: string;
  @ApiProperty({ nullable: true }) iniciadaExecucaoEm: string | null;
  @ApiProperty({ nullable: true }) finalizadaEm: string | null;
  @ApiProperty({ nullable: true }) entregueEm: string | null;
}
