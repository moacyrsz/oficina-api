import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ReporEstoqueDto {
  @ApiProperty({ example: 5, description: 'Quantidade a somar ao estoque atual' })
  @IsInt({ message: 'quantidade deve ser um inteiro.' })
  @Min(1, { message: 'quantidade deve ser no minimo 1.' })
  quantidade: number;
}
