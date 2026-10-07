import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CriarOrdemDto {
  @ApiProperty({ format: 'uuid', description: 'Identificador do cliente' })
  @IsUUID('4', { message: 'clienteId deve ser um UUID valido.' })
  clienteId: string;

  @ApiProperty({ format: 'uuid', description: 'Identificador do veiculo' })
  @IsUUID('4', { message: 'veiculoId deve ser um UUID valido.' })
  veiculoId: string;
}
