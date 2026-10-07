import { ApiProperty } from '@nestjs/swagger';

export class TempoMedioResponse {
  @ApiProperty({ example: 12, description: 'Quantidade de ordens finalizadas consideradas' })
  ordensConsideradas: number;

  @ApiProperty({ example: 185.5, description: 'Tempo medio de execucao em minutos' })
  tempoMedioEmMinutos: number;

  @ApiProperty({ example: 3.09, description: 'Tempo medio de execucao em horas' })
  tempoMedioEmHoras: number;
}
