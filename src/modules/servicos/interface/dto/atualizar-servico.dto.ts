import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AtualizarServicoDto {
  @ApiProperty({ required: false, example: 'Troca de oleo', description: 'Nome do servico' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'nome nao pode ser vazio.' })
  nome?: string;

  @ApiProperty({
    required: false,
    example: 'Substituicao do oleo do motor e do filtro',
    description: 'Descricao do servico',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ required: false, example: 150.0, description: 'Valor do servico em reais' })
  @IsOptional()
  @IsNumber({}, { message: 'valor deve ser um numero.' })
  @Min(0, { message: 'valor nao pode ser negativo.' })
  valor?: number;
}
