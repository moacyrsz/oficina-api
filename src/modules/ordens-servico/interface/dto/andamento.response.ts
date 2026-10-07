import { ApiProperty } from '@nestjs/swagger';
import { StatusOrdemServico } from '../../domain/status-ordem-servico';
import { DecisaoOrcamento } from '../../domain/aprovacao';
import { RegistroStatusResponse } from './ordem-de-servico.response';

export class AndamentoResponse {
  @ApiProperty({ example: 'OS-1A2B3C4D' }) codigo: string;
  @ApiProperty({ enum: StatusOrdemServico }) status: StatusOrdemServico;
  @ApiProperty({ nullable: true, example: 'Fiat Uno - ABC1D23' }) veiculo: string | null;
  @ApiProperty({ example: 420.0 }) valorTotalOrcamento: number;
  @ApiProperty({ enum: DecisaoOrcamento, nullable: true }) decisaoOrcamento: DecisaoOrcamento | null;
  @ApiProperty({ type: [RegistroStatusResponse] }) historico: RegistroStatusResponse[];
  @ApiProperty() criadaEm: string;
  @ApiProperty({ nullable: true }) finalizadaEm: string | null;
  @ApiProperty({ nullable: true }) entregueEm: string | null;
}
