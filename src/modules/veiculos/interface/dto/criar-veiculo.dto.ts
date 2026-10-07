import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class CriarVeiculoDto {
  @ApiProperty({ example: 'ABC1D23', description: 'Placa no padrao antigo (ABC1234) ou Mercosul (ABC1D23)' })
  @IsString()
  @IsNotEmpty({ message: 'Placa e obrigatoria.' })
  placa: string;

  @ApiProperty({ example: 'Volkswagen', description: 'Marca do veiculo' })
  @IsString()
  @IsNotEmpty({ message: 'Marca e obrigatoria.' })
  marca: string;

  @ApiProperty({ example: 'Gol', description: 'Modelo do veiculo' })
  @IsString()
  @IsNotEmpty({ message: 'Modelo e obrigatorio.' })
  modelo: string;

  @ApiProperty({ example: 2022, description: 'Ano de fabricacao' })
  @IsInt({ message: 'Ano deve ser um numero inteiro.' })
  @Min(1900, { message: 'Ano deve ser igual ou superior a 1900.' })
  ano: number;

  @ApiProperty({ format: 'uuid', description: 'Identificador do cliente proprietario' })
  @IsUUID('4', { message: 'clienteId deve ser um UUID valido.' })
  clienteId: string;
}
