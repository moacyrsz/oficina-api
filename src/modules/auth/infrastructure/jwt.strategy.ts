import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { carregarConfiguracao } from '../../../shared/infrastructure/config/configuracao';

export interface UsuarioAutenticado {
  id: string;
  email: string;
}

interface PayloadJwt {
  sub: string;
  email: string;
}

/**
 * Estrategia Passport que valida o token JWT recebido no cabecalho Authorization.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: carregarConfiguracao().jwt.secret,
    });
  }

  public validate(payload: PayloadJwt): UsuarioAutenticado {
    return { id: payload.sub, email: payload.email };
  }
}
