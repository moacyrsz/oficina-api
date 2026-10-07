import { ApiProperty } from '@nestjs/swagger';

export class VeiculoResponse {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ example: 'ABC-1234', description: 'Placa formatada para leitura' }) placa: string;
  @ApiProperty({ example: 'Volkswagen' }) marca: string;
  @ApiProperty({ example: 'Gol' }) modelo: string;
  @ApiProperty({ example: 2022 }) ano: number;
  @ApiProperty({ format: 'uuid' }) clienteId: string;
}
