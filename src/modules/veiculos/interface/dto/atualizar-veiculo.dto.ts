import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AtualizarVeiculoDto {
  @ApiPropertyOptional({ example: 'Volkswagen', description: 'Marca do veiculo' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Marca nao pode ser vazia.' })
  marca?: string;

  @ApiPropertyOptional({ example: 'Gol', description: 'Modelo do veiculo' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Modelo nao pode ser vazio.' })
  modelo?: string;

  @ApiPropertyOptional({ example: 2022, description: 'Ano de fabricacao' })
  @IsOptional()
  @IsInt({ message: 'Ano deve ser um numero inteiro.' })
  @Min(1900, { message: 'Ano deve ser igual ou superior a 1900.' })
  ano?: number;
}
