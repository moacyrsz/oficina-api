import { ApiProperty } from '@nestjs/swagger';

export class ClienteResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Maria Oliveira' })
  nome: string;

  @ApiProperty({ example: '529.982.247-25', description: 'Documento formatado com mascara' })
  documento: string;

  @ApiProperty({ example: 'CPF', enum: ['CPF', 'CNPJ'] })
  tipoDocumento: 'CPF' | 'CNPJ';

  @ApiProperty({ example: 'maria@email.com' })
  email: string;

  @ApiProperty({ example: '(11) 98888-7777' })
  telefone: string;
}
