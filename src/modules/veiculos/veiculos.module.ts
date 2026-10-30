import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from '../clientes/clientes.module';
import { AtualizarVeiculoUseCase } from './application/atualizar-veiculo.use-case';
import { BuscarVeiculoUseCase } from './application/buscar-veiculo.use-case';
import { CriarVeiculoUseCase } from './application/criar-veiculo.use-case';
import { ListarVeiculosUseCase } from './application/listar-veiculos.use-case';
import { VINCULOS_DO_VEICULO } from './application/ports/vinculos-do-veiculo';
import { RemoverVeiculoUseCase } from './application/remover-veiculo.use-case';
import { VEICULO_REPOSITORY } from './domain/veiculo.repository';
import { VeiculoOrmEntity } from './infrastructure/veiculo.orm-entity';
import { VeiculoRepositoryTypeorm } from './infrastructure/veiculo.repository.typeorm';
import { VinculosDoVeiculoTypeorm } from './infrastructure/vinculos-do-veiculo.typeorm';
import { VeiculosController } from './interface/veiculos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VeiculoOrmEntity]), ClientesModule],
  controllers: [VeiculosController],
  providers: [
    CriarVeiculoUseCase,
    ListarVeiculosUseCase,
    BuscarVeiculoUseCase,
    AtualizarVeiculoUseCase,
    RemoverVeiculoUseCase,
    { provide: VEICULO_REPOSITORY, useClass: VeiculoRepositoryTypeorm },
    { provide: VINCULOS_DO_VEICULO, useClass: VinculosDoVeiculoTypeorm },
  ],
  exports: [VEICULO_REPOSITORY],
})
export class VeiculosModule {}
