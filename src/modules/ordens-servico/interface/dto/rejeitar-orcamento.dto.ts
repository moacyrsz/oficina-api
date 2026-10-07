import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejeitarOrcamentoDto {
  @ApiPropertyOptional({ description: 'Motivo da rejeicao informado pelo cliente' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'motivo deve ter no maximo 500 caracteres.' })
  motivo?: string;
}
