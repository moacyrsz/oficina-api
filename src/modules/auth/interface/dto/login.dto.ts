import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@oficina.com.br', description: 'Email do usuario administrativo' })
  @IsEmail({}, { message: 'Email invalido.' })
  email: string;

  @ApiProperty({ example: 'Admin@123', description: 'Senha do usuario' })
  @IsString()
  @IsNotEmpty({ message: 'Senha e obrigatoria.' })
  @MinLength(6, { message: 'Senha deve ter ao menos 6 caracteres.' })
  senha: string;
}
