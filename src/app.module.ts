import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './shared/infrastructure/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { VeiculosModule } from './modules/veiculos/veiculos.module';
import { ServicosModule } from './modules/servicos/servicos.module';
import { PecasModule } from './modules/pecas/pecas.module';
import { OrdensServicoModule } from './modules/ordens-servico/ordens-servico.module';

/**
 * Modulo raiz. Compoe os contextos do monolito: identidade/acesso, cadastros
 * (clientes, veiculos), catalogo e estoque (servicos, pecas) e o nucleo de
 * ordens de servico.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    SharedModule,
    AuthModule,
    ClientesModule,
    VeiculosModule,
    ServicosModule,
    PecasModule,
    OrdensServicoModule,
  ],
})
export class AppModule {}
