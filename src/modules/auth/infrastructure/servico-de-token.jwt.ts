import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { carregarConfiguracao } from '../../../shared/infrastructure/config/configuracao';
import { ServicoDeToken, TokenEmitido } from '../application/ports/servico-de-token';

@Injectable()
export class ServicoDeTokenJwt implements ServicoDeToken {
  constructor(private readonly jwtService: JwtService) {}

  public async gerar(sujeito: { id: string; email: string }): Promise<TokenEmitido> {
    const configuracao = carregarConfiguracao();
    const accessToken = await this.jwtService.signAsync({
      sub: sujeito.id,
      email: sujeito.email,
    });

    return {
      accessToken,
      tipo: 'Bearer',
      expiraEm: configuracao.jwt.expiresIn,
    };
  }
}
