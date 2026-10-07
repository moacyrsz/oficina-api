import { ApiProperty } from '@nestjs/swagger';

export class PecaResponse {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ example: 'Filtro de oleo' }) nome: string;
  @ApiProperty({ example: 'Filtro de oleo compativel com motores 1.0 a 2.0' }) descricao: string;
  @ApiProperty({ example: 49.9, description: 'Preco unitario em reais' }) precoUnitario: number;
  @ApiProperty({ example: 10 }) quantidadeEmEstoque: number;
}
