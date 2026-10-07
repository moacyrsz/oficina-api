import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AtualizarServicoUseCase } from './application/atualizar-servico.use-case';
import { BuscarServicoUseCase } from './application/buscar-servico.use-case';
import { CriarServicoUseCase } from './application/criar-servico.use-case';
import { ListarServicosUseCase } from './application/listar-servicos.use-case';
import { RemoverServicoUseCase } from './application/remover-servico.use-case';
import { SERVICO_REPOSITORY } from './domain/servico.repository';
import { ServicoOrmEntity } from './infrastructure/servico.orm-entity';
import { ServicoRepositoryTypeorm } from './infrastructure/servico.repository.typeorm';
import { ServicosController } from './interface/servicos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServicoOrmEntity])],
  controllers: [ServicosController],
  providers: [
    CriarServicoUseCase,
    ListarServicosUseCase,
    BuscarServicoUseCase,
    AtualizarServicoUseCase,
    RemoverServicoUseCase,
    { provide: SERVICO_REPOSITORY, useClass: ServicoRepositoryTypeorm },
  ],
  exports: [SERVICO_REPOSITORY],
})
export class ServicosModule {}
