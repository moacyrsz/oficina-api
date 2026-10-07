import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { carregarConfiguracao } from './shared/infrastructure/config/configuracao';
import { FiltroDeExcecoes } from './shared/infrastructure/http/filtro-de-excecoes';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new FiltroDeExcecoes());

  const configuracaoSwagger = new DocumentBuilder()
    .setTitle('API da Oficina Mecanica')
    .setDescription(
      'Sistema Integrado de Atendimento e Execucao de Servicos. Gestao de ordens de servico, ' +
        'clientes, veiculos, servicos e pecas, com controle de estoque e acompanhamento de status.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'jwt',
    )
    .addTag('Autenticacao', 'Emissao de token JWT para as APIs administrativas')
    .addTag('Clientes', 'Cadastro de clientes identificados por CPF ou CNPJ')
    .addTag('Veiculos', 'Cadastro de veiculos')
    .addTag('Servicos', 'Catalogo de servicos oferecidos pela oficina')
    .addTag('Pecas e Insumos', 'Catalogo de pecas e insumos com controle de estoque')
    .addTag('Ordens de Servico', 'Criacao, orcamento, aprovacao e acompanhamento das ordens')
    .addTag('Acompanhamento (Cliente)', 'Consulta publica do andamento de uma ordem de servico')
    .build();

  const documento = SwaggerModule.createDocument(app, configuracaoSwagger);
  SwaggerModule.setup('api/docs', app, documento);

  const configuracao = carregarConfiguracao();
  await app.listen(configuracao.porta);
}

void bootstrap();
