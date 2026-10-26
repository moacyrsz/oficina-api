# Relação entre a documentação DDD e o código

Esta tabela liga cada elemento do modelo de domínio ao arquivo que o implementa. Serve como ponte entre o Event Storming, os diagramas e o código entregue.

## Agregados e raízes

| Elemento DDD | Arquivo |
|--------------|---------|
| Agregado Ordem de Serviço (raiz) | `src/modules/ordens-servico/domain/ordem-de-servico.ts` |
| Agregado Cliente | `src/modules/clientes/domain/cliente.ts` |
| Agregado Veículo | `src/modules/veiculos/domain/veiculo.ts` |
| Agregado Serviço | `src/modules/servicos/domain/servico.ts` |
| Agregado Peça | `src/modules/pecas/domain/peca.ts` |
| Agregado Usuário | `src/modules/auth/domain/usuario.ts` |

## Entidades internas

| Elemento DDD | Arquivo |
|--------------|---------|
| Item de Serviço | `src/modules/ordens-servico/domain/item-servico.ts` |
| Item de Peça | `src/modules/ordens-servico/domain/item-peca.ts` |

## Objetos de valor

| Elemento DDD | Arquivo |
|--------------|---------|
| Documento (CPF ou CNPJ) | `src/modules/clientes/domain/documento.ts` |
| Placa | `src/modules/veiculos/domain/placa.ts` |
| Dinheiro | `src/shared/domain/dinheiro.ts` |
| Orçamento | `src/modules/ordens-servico/domain/orcamento.ts` |
| Aprovação | `src/modules/ordens-servico/domain/aprovacao.ts` |
| Status da Ordem de Serviço | `src/modules/ordens-servico/domain/status-ordem-servico.ts` |

## Eventos de domínio

| Elemento DDD | Arquivo |
|--------------|---------|
| Eventos da Ordem de Serviço | `src/modules/ordens-servico/domain/eventos.ts` |
| Evento ClienteCadastrado | `src/modules/clientes/domain/eventos.ts` |
| Base de evento de domínio | `src/shared/domain/evento-de-dominio.ts` |

## Comandos (casos de uso)

| Comando de negócio | Caso de uso |
|--------------------|-------------|
| Criar Ordem de Serviço (pelo CPF/CNPJ e pela placa) | `application/criar-ordem-de-servico.use-case.ts` |
| Iniciar Diagnóstico | `application/iniciar-diagnostico.use-case.ts` |
| Adicionar Serviço | `application/adicionar-servico.use-case.ts` |
| Adicionar Peça | `application/adicionar-peca.use-case.ts` |
| Enviar Orçamento | `application/enviar-orcamento.use-case.ts` |
| Aprovar Orçamento (equipe, em nome do cliente) | `application/aprovar-orcamento.use-case.ts` |
| Rejeitar Orçamento (equipe, em nome do cliente) | `application/rejeitar-orcamento.use-case.ts` |
| Aprovar Orçamento (cliente, API pública) | `application/aprovar-orcamento-pelo-cliente.use-case.ts` |
| Rejeitar Orçamento (cliente, API pública) | `application/rejeitar-orcamento-pelo-cliente.use-case.ts` |
| Finalizar Ordem | `application/finalizar-ordem.use-case.ts` |
| Entregar Veículo | `application/entregar-veiculo.use-case.ts` |
| Consultar Andamento (público) | `application/consultar-andamento.use-case.ts` |
| Calcular Tempo Médio | `application/calcular-tempo-medio.use-case.ts` |

Todos sob `src/modules/ordens-servico/`. As rotas públicas usam o `LocalizadorDeOrdemDoCliente` (`application/localizador-de-ordem-do-cliente.ts`), que confere o código da OS e o documento do cliente.

| Comando de cadastro e estoque | Caso de uso |
|-------------------------------|-------------|
| Remover Cliente | `src/modules/clientes/application/remover-cliente.use-case.ts` |
| Remover Veículo | `src/modules/veiculos/application/remover-veiculo.use-case.ts` |
| Repor Estoque | `src/modules/pecas/application/repor-estoque.use-case.ts` |

## Políticas e regras de negócio

| Regra | Onde está |
|-------|-----------|
| Orçamento calculado pela soma dos itens | `calcularOrcamento` em `ordem-de-servico.ts` e `orcamento.ts` |
| Máquina de estados e transições válidas | `status-ordem-servico.ts` e `transicionarPara` em `ordem-de-servico.ts` |
| Inclusão de itens só antes do envio do orçamento | `garantirEditavel` em `ordem-de-servico.ts` |
| Baixa de estoque atômica na aprovação | `aprovar-orcamento.use-case.ts` + `gestao-de-estoque.adapter.ts` + `baixarEstoque` em `peca.ts` |
| Estoque nunca negativo | `baixarEstoque` em `peca.ts` |
| CPF ou CNPJ válido | `documento.ts` |
| Placa válida | `placa.ts` |
| OS aberta pelo CPF/CNPJ do cliente e pela placa do veículo | `criar-ordem-de-servico.use-case.ts` + `consulta-de-cliente.adapter.ts` e `consulta-de-veiculo.adapter.ts` |
| Veículo precisa pertencer ao cliente na abertura da OS | `criar-ordem-de-servico.use-case.ts` |
| Decisão do cliente só com o código da OS e o documento dele | `localizador-de-ordem-do-cliente.ts` |
| Comandos simultâneos na mesma OS executados um de cada vez | `buscarPorIdParaAtualizar` em `ordem-de-servico.repository.typeorm.ts`, usado por todos os comandos |
| Reposição e atualização de peça sem sobrescrever o saldo | `repor-estoque.use-case.ts` e `atualizar-peca.use-case.ts` + `buscarParaAtualizar` em `peca.repository.typeorm.ts` |
| Cliente ou veículo com histórico não pode ser removido | `remover-cliente.use-case.ts` e `remover-veiculo.use-case.ts` |

## Portas e adaptadores entre contextos

| Porta (contexto Ordem de Serviço) | Adaptador |
|-----------------------------------|-----------|
| `application/ports/catalogo-de-servicos.ts` | `infrastructure/catalogo-de-servicos.adapter.ts` |
| `application/ports/gestao-de-estoque.ts` | `infrastructure/gestao-de-estoque.adapter.ts` |
| `application/ports/consulta-de-cliente.ts` | `infrastructure/consulta-de-cliente.adapter.ts` |
| `application/ports/consulta-de-veiculo.ts` | `infrastructure/consulta-de-veiculo.adapter.ts` |

| Porta (contextos de cadastro) | Adaptador |
|-------------------------------|-----------|
| `clientes/application/ports/vinculos-do-cliente.ts` | `clientes/infrastructure/vinculos-do-cliente.typeorm.ts` |
| `veiculos/application/ports/vinculos-do-veiculo.ts` | `veiculos/infrastructure/vinculos-do-veiculo.typeorm.ts` |

## Transações

A porta `UnidadeDeTrabalho` (`src/shared/application/unidade-de-trabalho.ts`) é implementada por `unidade-de-trabalho.typeorm.ts`, que abre a transação do PostgreSQL. O `ContextoDeTransacao` (AsyncLocalStorage) garante que os repositórios participem da mesma transação. É o que torna atômica a aprovação do orçamento com a baixa de estoque. Dentro da transação, a ordem e as peças são lidas com bloqueio de linha (`SELECT ... FOR UPDATE`), o que serializa operações simultâneas sobre os mesmos registros.
