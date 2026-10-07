import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { HashDeSenha } from '../application/ports/hash-de-senha';

const FATOR_DE_CUSTO = 10;

@Injectable()
export class HashDeSenhaBcrypt implements HashDeSenha {
  public gerar(senhaEmTexto: string): Promise<string> {
    return bcrypt.hash(senhaEmTexto, FATOR_DE_CUSTO);
  }

  public comparar(senhaEmTexto: string, hash: string): Promise<boolean> {
    return bcrypt.compare(senhaEmTexto, hash);
  }
}
