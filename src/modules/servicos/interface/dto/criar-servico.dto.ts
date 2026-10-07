import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CriarServicoDto {
  @ApiProperty({ example: 'Troca de oleo', description: 'Nome do servico' })
  @IsString()
  @IsNotEmpty({ message: 'nome e obrigatorio.' })
  nome: string;

  @ApiProperty({
    required: false,
    default: '',
    example: 'Substituicao do oleo do motor e do filtro',
    description: 'Descricao do servico',
  })
  @IsOptional()
  @IsString()
  descricao?: string = '';

  @ApiProperty({ example: 150.0, description: 'Valor do servico em reais' })
  @IsNumber({}, { message: 'valor deve ser um numero.' })
  @Min(0, { message: 'valor nao pode ser negativo.' })
  valor: number;
}
