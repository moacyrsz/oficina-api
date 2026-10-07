import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CriarClienteDto {
  @ApiProperty({ example: 'Maria Oliveira', description: 'Nome do cliente' })
  @IsString()
  @IsNotEmpty({ message: 'Nome e obrigatorio.' })
  nome: string;

  @ApiProperty({
    example: '529.982.247-25',
    description: 'CPF ou CNPJ do cliente, com ou sem mascara',
  })
  @IsString()
  @IsNotEmpty({ message: 'Documento e obrigatorio.' })
  documento: string;

  @ApiProperty({ example: 'maria@email.com', description: 'Email do cliente' })
  @IsEmail({}, { message: 'Email invalido.' })
  email: string;

  @ApiProperty({ example: '(11) 98888-7777', description: 'Telefone de contato' })
  @IsString()
  @IsNotEmpty({ message: 'Telefone e obrigatorio.' })
  telefone: string;
}
