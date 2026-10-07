import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AtualizarPecaUseCase } from './application/atualizar-peca.use-case';
import { BuscarPecaUseCase } from './application/buscar-peca.use-case';
import { CriarPecaUseCase } from './application/criar-peca.use-case';
import { ListarPecasUseCase } from './application/listar-pecas.use-case';
import { RemoverPecaUseCase } from './application/remover-peca.use-case';
import { ReporEstoqueUseCase } from './application/repor-estoque.use-case';
import { PECA_REPOSITORY } from './domain/peca.repository';
import { PecaOrmEntity } from './infrastructure/peca.orm-entity';
import { PecaRepositoryTypeorm } from './infrastructure/peca.repository.typeorm';
import { PecasController } from './interface/pecas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PecaOrmEntity])],
  controllers: [PecasController],
  providers: [
    CriarPecaUseCase,
    ListarPecasUseCase,
    BuscarPecaUseCase,
    AtualizarPecaUseCase,
    RemoverPecaUseCase,
    ReporEstoqueUseCase,
    { provide: PECA_REPOSITORY, useClass: PecaRepositoryTypeorm },
  ],
  exports: [PECA_REPOSITORY],
})
export class PecasModule {}
