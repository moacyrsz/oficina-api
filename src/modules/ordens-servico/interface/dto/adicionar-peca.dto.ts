import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AdicionarPecaDto {
  @ApiProperty({ format: 'uuid', description: 'Identificador da peca ou insumo' })
  @IsUUID('4', { message: 'pecaId deve ser um UUID valido.' })
  pecaId: string;

  @ApiProperty({ example: 2, minimum: 1, description: 'Quantidade da peca' })
  @IsInt({ message: 'quantidade deve ser um numero inteiro.' })
  @Min(1, { message: 'quantidade deve ser no minimo 1.' })
  quantidade: number;
}
