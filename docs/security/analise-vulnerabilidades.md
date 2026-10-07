# Análise de Vulnerabilidades

Data da análise: 07/10/2026.
Ferramenta: `npm audit` (base de advisories do npm), complementada por revisão manual.

## Como reproduzir

```bash
# Vulnerabilidades que afetam o que vai para produção
npm audit --omit=dev

# Panorama completo, incluindo ferramentas de desenvolvimento
npm audit
```

## Resultado

### Dependências de produção (o que roda no contêiner)

| Severidade | Quantidade |
|------------|-----------|
| Crítica | 0 |
| Alta | 2 |
| Moderada | 0 |
| Baixa | 0 |

As duas ocorrências de severidade alta vêm de uma dependência transitiva, o `js-yaml`, trazido pelo `@nestjs/swagger`. O aviso trata de consumo elevado de CPU ao interpretar um YAML construído com chaves de merge maliciosas.

Avaliação de risco: **baixa no contexto desta aplicação**. O `@nestjs/swagger` é usado para gerar a documentação da API a partir dos decorators do código, no momento da inicialização. A aplicação não interpreta YAML enviado por usuários em tempo de execução, que seria o vetor do problema. Mitigação acompanhada: atualizar o `@nestjs/swagger` quando a versão que remove essa dependência vulnerável estiver estável, pois a correção completa hoje exige uma mudança de major.

### Panorama completo (produção + desenvolvimento)

| Severidade | Quantidade |
|------------|-----------|
| Crítica | 0 |
| Alta | 31 |
| Moderada | 4 |
| Baixa | 0 |

As ocorrências adicionais estão concentradas na cadeia de ferramentas de teste (Jest, Istanbul e dependências como `braces`, `micromatch`, `sprintf-js`, `argparse`). Elas não são enviadas para produção: a imagem Docker é construída em dois estágios e o estágio final instala apenas dependências de produção (`npm ci --omit=dev`). A correção dessas ocorrências depende de uma atualização de major do Jest (versão 30), avaliada como melhoria futura por ser uma mudança de maior impacto na suíte de testes.

## Boas práticas de segurança já aplicadas no código

- Autenticação JWT nas APIs administrativas, com guard nas rotas internas.
- Senhas armazenadas apenas como hash (bcrypt), nunca em texto puro.
- Validação de entrada na borda HTTP (class-validator) e no domínio (CPF, CNPJ e placa validam a si mesmos).
- Cabeçalhos de segurança HTTP com Helmet.
- `ValidationPipe` com `whitelist` e `forbidNonWhitelisted`, que rejeita propriedades não esperadas no corpo das requisições.
- Segredos e credenciais fora do código, lidos por variáveis de ambiente (`.env.example` documenta as chaves, sem valores reais).
- Consulta pública protegida por verificação de documento, sem expor dados sensíveis.

## Endurecimento aplicado após revisão de código

Uma revisão interna do código apontou pontos de endurecimento, todos corrigidos:

- **Fail-fast de segredos em produção**: com `NODE_ENV=production`, a aplicação recusa subir se `JWT_SECRET` ou `ADMIN_PASSWORD` não estiverem definidos, evitando o uso de valores padrão de desenvolvimento. Os padrões continuam valendo apenas em desenvolvimento.
- **`synchronize` do TypeORM com padrão seguro (false)**: a sincronização automática de schema só é ligada explicitamente em desenvolvimento e no docker-compose do MVP, nunca por omissão.
- **Baixa de estoque com bloqueio pessimista**: a leitura da peça na baixa usa `SELECT ... FOR UPDATE` dentro da transação, serializando aprovações concorrentes do mesmo item e evitando overselling (lost update).
- **Consulta pública sem oráculo de enumeração**: ordem inexistente e documento inválido retornam a mesma resposta genérica, impedindo a descoberta de códigos de ordens válidos.

## Conclusão

Não há vulnerabilidades críticas. O que roda em produção tem apenas duas ocorrências de alta em uma dependência transitiva de documentação, com baixo risco real e mitigação acompanhada. As demais ocorrências ficam restritas ao ambiente de desenvolvimento e não compõem a imagem publicada.
