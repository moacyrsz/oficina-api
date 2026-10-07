import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from '../clientes/clientes.module';
import { PecasModule } from '../pecas/pecas.module';
import { ServicosModule } from '../servicos/servicos.module';
import { VeiculosModule } from '../veiculos/veiculos.module';
import { AdicionarPecaUseCase } from './application/adicionar-peca.use-case';
import { AdicionarServicoUseCase } from './application/adicionar-servico.use-case';
import { AprovarOrcamentoUseCase } from './application/aprovar-orcamento.use-case';
import { CalcularTempoMedioUseCase } from './application/calcular-tempo-medio.use-case';
import { ConsultarAndamentoUseCase } from './application/consultar-andamento.use-case';
import { CriarOrdemDeServicoUseCase } from './application/criar-ordem-de-servico.use-case';
import { DetalharOrdemUseCase } from './application/detalhar-ordem.use-case';
import { EntregarVeiculoUseCase } from './application/entregar-veiculo.use-case';
import { EnviarOrcamentoUseCase } from './application/enviar-orcamento.use-case';
import { FinalizarOrdemUseCase } from './application/finalizar-ordem.use-case';
import { IniciarDiagnosticoUseCase } from './application/iniciar-diagnostico.use-case';
import { ListarOrdensUseCase } from './application/listar-ordens.use-case';
import { CATALOGO_DE_SERVICOS } from './application/ports/catalogo-de-servicos';
import { CONSULTA_DE_CLIENTE } from './application/ports/consulta-de-cliente';
import { CONSULTA_DE_VEICULO } from './application/ports/consulta-de-veiculo';
import { GESTAO_DE_ESTOQUE } from './application/ports/gestao-de-estoque';
import { RejeitarOrcamentoUseCase } from './application/rejeitar-orcamento.use-case';
import { ORDEM_DE_SERVICO_REPOSITORY } from './domain/ordem-de-servico.repository';
import { CatalogoDeServicosAdapter } from './infrastructure/catalogo-de-servicos.adapter';
import { ConsultaDeClienteAdapter } from './infrastructure/consulta-de-cliente.adapter';
import { ConsultaDeVeiculoAdapter } from './infrastructure/consulta-de-veiculo.adapter';
import { GestaoDeEstoqueAdapter } from './infrastructure/gestao-de-estoque.adapter';
import { OrdemDeServicoOrmEntity } from './infrastructure/ordem-de-servico.orm-entity';
import { OrdemDeServicoRepositoryTypeorm } from './infrastructure/ordem-de-servico.repository.typeorm';
import { ConsultaPublicaController } from './interface/consulta-publica.controller';
import { OrdensServicoController } from './interface/ordens-servico.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdemDeServicoOrmEntity]),
    ClientesModule,
    VeiculosModule,
    ServicosModule,
    PecasModule,
  ],
  controllers: [OrdensServicoController, ConsultaPublicaController],
  providers: [
    CriarOrdemDeServicoUseCase,
    IniciarDiagnosticoUseCase,
    AdicionarServicoUseCase,
    AdicionarPecaUseCase,
    EnviarOrcamentoUseCase,
    AprovarOrcamentoUseCase,
    RejeitarOrcamentoUseCase,
    FinalizarOrdemUseCase,
    EntregarVeiculoUseCase,
    ListarOrdensUseCase,
    DetalharOrdemUseCase,
    CalcularTempoMedioUseCase,
    ConsultarAndamentoUseCase,
    { provide: ORDEM_DE_SERVICO_REPOSITORY, useClass: OrdemDeServicoRepositoryTypeorm },
    { provide: CATALOGO_DE_SERVICOS, useClass: CatalogoDeServicosAdapter },
    { provide: GESTAO_DE_ESTOQUE, useClass: GestaoDeEstoqueAdapter },
    { provide: CONSULTA_DE_CLIENTE, useClass: ConsultaDeClienteAdapter },
    { provide: CONSULTA_DE_VEICULO, useClass: ConsultaDeVeiculoAdapter },
  ],
})
export class OrdensServicoModule {}
