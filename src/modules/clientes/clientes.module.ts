import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AtualizarClienteUseCase } from './application/atualizar-cliente.use-case';
import { BuscarClienteUseCase } from './application/buscar-cliente.use-case';
import { CriarClienteUseCase } from './application/criar-cliente.use-case';
import { ListarClientesUseCase } from './application/listar-clientes.use-case';
import { RemoverClienteUseCase } from './application/remover-cliente.use-case';
import { CLIENTE_REPOSITORY } from './domain/cliente.repository';
import { ClienteOrmEntity } from './infrastructure/cliente.orm-entity';
import { ClienteRepositoryTypeorm } from './infrastructure/cliente.repository.typeorm';
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
  ],
  exports: [CLIENTE_REPOSITORY],
})
export class ClientesModule {}
