import { ApiProperty } from '@nestjs/swagger';

export class ServicoResponse {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ example: 'Troca de oleo' }) nome: string;
  @ApiProperty({ example: 'Substituicao do oleo do motor e do filtro' }) descricao: string;
  @ApiProperty({ example: 150.0, description: 'Valor em reais' }) valor: number;
}
