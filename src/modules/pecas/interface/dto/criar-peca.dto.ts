import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CriarPecaDto {
  @ApiProperty({ example: 'Filtro de oleo', description: 'Nome da peca ou insumo' })
  @IsString({ message: 'nome deve ser um texto.' })
  @IsNotEmpty({ message: 'nome e obrigatorio.' })
  nome: string;

  @ApiProperty({ required: false, description: 'Descricao detalhada da peca' })
  @IsOptional()
  @IsString({ message: 'descricao deve ser um texto.' })
  descricao?: string;

  @ApiProperty({ example: 49.9, description: 'Preco unitario em reais' })
  @IsNumber({}, { message: 'precoUnitario deve ser um numero.' })
  @Min(0, { message: 'precoUnitario nao pode ser negativo.' })
  precoUnitario: number;

  @ApiProperty({ example: 10, description: 'Quantidade inicial em estoque' })
  @IsInt({ message: 'quantidadeEmEstoque deve ser um inteiro.' })
  @Min(0, { message: 'quantidadeEmEstoque nao pode ser negativa.' })
  quantidadeEmEstoque: number;
}
