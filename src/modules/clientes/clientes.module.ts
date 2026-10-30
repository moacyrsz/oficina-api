import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AtualizarClienteUseCase } from './application/atualizar-cliente.use-case';
import { BuscarClienteUseCase } from './application/buscar-cliente.use-case';
import { CriarClienteUseCase } from './application/criar-cliente.use-case';
import { ListarClientesUseCase } from './application/listar-clientes.use-case';
import { VINCULOS_DO_CLIENTE } from './application/ports/vinculos-do-cliente';
import { RemoverClienteUseCase } from './application/remover-cliente.use-case';
import { CLIENTE_REPOSITORY } from './domain/cliente.repository';
import { ClienteOrmEntity } from './infrastructure/cliente.orm-entity';
import { ClienteRepositoryTypeorm } from './infrastructure/cliente.repository.typeorm';
import { VinculosDoClienteTypeorm } from './infrastructure/vinculos-do-cliente.typeorm';
import { ClientesController } from './interface/clientes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClienteOrmEntity])],
  controllers: [ClientesController],
  providers: [
    CriarClienteUseCase,
    ListarClientesUseCase,
    BuscarClienteUseCase,
    AtualizarClienteUseCase,
    RemoverClienteUseCase,
    { provide: CLIENTE_REPOSITORY, useClass: ClienteRepositoryTypeorm },
    { provide: VINCULOS_DO_CLIENTE, useClass: VinculosDoClienteTypeorm },
  ],
  exports: [CLIENTE_REPOSITORY],
})
export class ClientesModule {}
