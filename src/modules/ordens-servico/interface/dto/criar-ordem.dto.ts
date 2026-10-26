import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CriarOrdemDto {
  @ApiProperty({
    example: '529.982.247-25',
    description: 'CPF ou CNPJ do cliente, com ou sem mascara',
  })
  @IsString()
  @IsNotEmpty({ message: 'Documento do cliente e obrigatorio.' })
  documento: string;

  @ApiProperty({
    example: 'ABC1D23',
    description: 'Placa do veiculo do cliente (padrao antigo ou Mercosul)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Placa do veiculo e obrigatoria.' })
  placa: string;
}
