import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AdicionarServicoDto {
  @ApiProperty({ format: 'uuid', description: 'Identificador do servico do catalogo' })
  @IsUUID('4', { message: 'servicoId deve ser um UUID valido.' })
  servicoId: string;

  @ApiProperty({ example: 1, minimum: 1, description: 'Quantidade do servico' })
  @IsInt({ message: 'quantidade deve ser um numero inteiro.' })
  @Min(1, { message: 'quantidade deve ser no minimo 1.' })
  quantidade: number;
}
