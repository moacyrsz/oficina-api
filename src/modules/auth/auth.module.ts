import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { carregarConfiguracao } from '../../shared/infrastructure/config/configuracao';
import { AutenticarUseCase } from './application/autenticar.use-case';
import { HASH_DE_SENHA } from './application/ports/hash-de-senha';
import { SERVICO_DE_TOKEN } from './application/ports/servico-de-token';
import { USUARIO_REPOSITORY } from './domain/usuario.repository';
import { HashDeSenhaBcrypt } from './infrastructure/hash-de-senha.bcrypt';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { ServicoDeTokenJwt } from './infrastructure/servico-de-token.jwt';
import { UsuarioOrmEntity } from './infrastructure/usuario.orm-entity';
import { UsuarioRepositoryTypeorm } from './infrastructure/usuario.repository.typeorm';
import { AuthController } from './interface/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioOrmEntity]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const configuracao = carregarConfiguracao();
        return {
          secret: configuracao.jwt.secret,
          // O tipo de expiresIn do @nestjs/jwt usa o template literal do pacote ms;
          // o valor vem de configuracao (ex.: '3600s') e o cast apenas satisfaz o tipo.
          signOptions: { expiresIn: configuracao.jwt.expiresIn as `${number}s` },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AutenticarUseCase,
    JwtStrategy,
    { provide: USUARIO_REPOSITORY, useClass: UsuarioRepositoryTypeorm },
    { provide: HASH_DE_SENHA, useClass: HashDeSenhaBcrypt },
    { provide: SERVICO_DE_TOKEN, useClass: ServicoDeTokenJwt },
  ],
  exports: [PassportModule, JwtModule, USUARIO_REPOSITORY, HASH_DE_SENHA],
})
export class AuthModule {}
