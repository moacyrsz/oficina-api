import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AtualizarClienteDto {
  @ApiPropertyOptional({ example: 'Maria Oliveira', description: 'Nome do cliente' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Nome nao pode ser vazio.' })
  nome?: string;

  @ApiPropertyOptional({ example: 'maria@email.com', description: 'Email do cliente' })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalido.' })
  email?: string;

  @ApiPropertyOptional({ example: '(11) 98888-7777', description: 'Telefone de contato' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Telefone nao pode ser vazio.' })
  telefone?: string;
}
