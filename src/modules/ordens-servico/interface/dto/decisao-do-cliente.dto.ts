import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class DecisaoDoClienteDto {
  @ApiProperty({ example: '529.982.247-25', description: 'CPF ou CNPJ do cliente da ordem' })
  @IsString()
  @IsNotEmpty({ message: 'Documento e obrigatorio.' })
  documento: string;
}

export class RejeicaoDoClienteDto extends DecisaoDoClienteDto {
  @ApiPropertyOptional({ description: 'Motivo da rejeicao' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'motivo deve ter no maximo 500 caracteres.' })
  motivo?: string;
}
