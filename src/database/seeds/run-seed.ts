import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { carregarConfiguracao } from '../../shared/infrastructure/config/configuracao';
import { HASH_DE_SENHA, HashDeSenha } from '../../modules/auth/application/ports/hash-de-senha';
import { Usuario } from '../../modules/auth/domain/usuario';
import { USUARIO_REPOSITORY, UsuarioRepository } from '../../modules/auth/domain/usuario.repository';

/**
 * Semente de dados. Garante a existencia do usuario administrador usado para
 * autenticar nas APIs administrativas. Usa a propria injecao de dependencia da
 * aplicacao, respeitando as regras de dominio e o mapeamento de persistencia.
 */
async function executar(): Promise<void> {
  const aplicacao = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const usuarios = aplicacao.get<UsuarioRepository>(USUARIO_REPOSITORY);
    const hash = aplicacao.get<HashDeSenha>(HASH_DE_SENHA);
    const configuracao = carregarConfiguracao();

    const existente = await usuarios.buscarPorEmail(configuracao.admin.email);
    if (existente) {
      // eslint-disable-next-line no-console
      console.log(`Usuario administrador ja existe: ${configuracao.admin.email}`);
      return;
    }

    const senhaHash = await hash.gerar(configuracao.admin.password);
    const administrador = Usuario.criar({
      nome: 'Administrador',
      email: configuracao.admin.email,
      senhaHash,
    });
    await usuarios.salvar(administrador);

    // eslint-disable-next-line no-console
    console.log(`Usuario administrador criado: ${configuracao.admin.email}`);
  } finally {
    await aplicacao.close();
  }
}

executar().catch((erro) => {
  // eslint-disable-next-line no-console
  console.error('Falha ao executar o seed:', erro);
  process.exit(1);
});
