import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AtualizarPecaDto {
  @ApiProperty({ required: false, example: 'Filtro de oleo', description: 'Nome da peca' })
  @IsOptional()
  @IsString({ message: 'nome deve ser um texto.' })
  @IsNotEmpty({ message: 'nome nao pode ser vazio.' })
  nome?: string;

  @ApiProperty({ required: false, description: 'Descricao detalhada da peca' })
  @IsOptional()
  @IsString({ message: 'descricao deve ser um texto.' })
  descricao?: string;

  @ApiProperty({ required: false, example: 49.9, description: 'Preco unitario em reais' })
  @IsOptional()
  @IsNumber({}, { message: 'precoUnitario deve ser um numero.' })
  @Min(0, { message: 'precoUnitario nao pode ser negativo.' })
  precoUnitario?: number;
}
