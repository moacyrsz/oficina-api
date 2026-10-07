import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AutenticarUseCase } from '../application/autenticar.use-case';
import { LoginDto } from './dto/login.dto';
import { TokenResponse } from './dto/token.response';

@ApiTags('Autenticacao')
@Controller('auth')
export class AuthController {
  constructor(private readonly autenticar: AutenticarUseCase) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autentica um usuario administrativo e retorna um token JWT',
  })
  @ApiResponse({ status: 200, description: 'Autenticado com sucesso', type: TokenResponse })
  @ApiResponse({ status: 401, description: 'Credenciais invalidas' })
  public async login(@Body() dto: LoginDto): Promise<TokenResponse> {
    return this.autenticar.executar({ email: dto.email, senha: dto.senha });
  }
}
