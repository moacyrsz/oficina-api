# Análise de Vulnerabilidades

Data da análise: 30/10/2026 (substitui as análises de 07/10, 23/10 e 26/10/2026).
Ferramenta: `npm audit` (base de advisories do GitHub e do npm), complementada por revisão manual.

## Como reproduzir

```bash
# Vulnerabilidades que afetam o que vai para produção
npm audit --omit=dev

# Panorama completo, incluindo ferramentas de desenvolvimento
npm audit
```

## Resultado atual

| Severidade | Produção (`--omit=dev`) | Completo |
|------------|-------------------------|----------|
| Crítica | 0 | 0 |
| Alta | 0 | 0 |
| Moderada | 0 | 0 |
| Baixa | 0 | 9 |

As dependências de produção, que são as únicas instaladas na imagem Docker, não têm alertas:

```text
$ npm audit --omit=dev
found 0 vulnerabilities
```

Os 9 registros de severidade baixa do panorama completo vêm de uma única causa, em ferramentas de desenvolvimento:

```text
$ npm audit
deepmerge  >=4.2.0
deepmerge mergeObject() allows prototype poisoning of returned objects - https://github.com/advisories/GHSA-gcqx-w48m-w2h4
fix available via `npm audit fix --force`
Will install @nestjs/cli@7.2.0, which is a breaking change
...
9 low severity vulnerabilities
```

- **Causa**: o `deepmerge` 4.3.1 ([GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)), usado pelo `jest-config` (Jest) e pelo `fork-ts-checker-webpack-plugin` (`@nestjs/cli`). Os outros registros são esses pacotes, apontados por dependerem dele.
- **Risco**: baixo. O `deepmerge` é usado apenas para mesclar arquivos de configuração do próprio projeto, que são entradas confiáveis, durante os testes e o build. Ele não faz parte da imagem de produção (`npm ci --omit=dev`) e não recebe dados de requisições.
- **Por que não foi corrigido**: não existe versão corrigida publicada. A 4.3.1 é a mais recente e está dentro da faixa afetada. A sugestão do `npm audit fix --force` rebaixaria o Jest para a versão 25 e o `@nestjs/cli` para a 7, o que quebraria a suíte de testes e o build. A correção será aplicada quando uma versão corrigida do `deepmerge`, ou das ferramentas que o usam, for publicada.

## Correções aplicadas

| Pacote | Antes | Depois | Escopo | Advisory resolvido |
|--------|-------|--------|--------|--------------------|
| `body-parser` | 2.3.0 | 2.4.0 | produção | [GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828): DoS com bytes extras após um corpo de requisição comprimido |
| `multer` | 2.4.0 | 2.5.0 | produção | [GHSA-q7qp-rjg7-q26m](https://github.com/advisories/GHSA-q7qp-rjg7-q26m): DoS com `fileFilter` assíncrono pendente |
| `js-yaml` (usado pelo `@nestjs/swagger`) | 4.3.0 | 5.5.0 | produção | Consumo excessivo de CPU ao interpretar YAML com chaves de merge |
| `@nestjs/swagger` | 11.4.5 | 11.4.7 | produção | Versão mínima fixada em `^11.4.7` |
| `handlebars` | 4.7.9 | 4.7.10 | desenvolvimento | Injeção de JavaScript em templates (registro crítico) |

Como foram aplicadas:

- `body-parser` foi atualizado com `npm update body-parser`: a faixa `^2.2.1` declarada pelo `express` já aceita a versão corrigida.
- `multer` e `js-yaml` foram corrigidos com `overrides` no `package.json`. O `@nestjs/platform-express`, inclusive na versão mais recente, fixa o `multer` 2.4.0, e o `@nestjs/swagger` 11.4.7 fixa o `js-yaml` 5.3.0. O `overrides` aplica as versões corrigidas sem trocar a versão major desses pacotes. A aplicação não recebe upload de arquivos, então o `multer` sequer é executado.
- As versões corrigidas do `body-parser` e do `multer` foram publicadas em 22/10/2026 e só foram instaladas depois de 3 dias, conforme a política de idade mínima de publicação (`min-release-age`) usada no ambiente de desenvolvimento para evitar pacotes maliciosos recém-publicados.
- `npm audit fix` não foi usado sozinho porque, no período, ele alternava entre versões do `@nestjs/platform-express` e do `@nestjs/swagger` que trocavam um alerta por outro.

Validação após as atualizações: `npm run typecheck`, 177 testes unitários, testes de integração no banco em memória e no PostgreSQL 16 real (incluindo concorrência e migrations), build de produção a partir de `npm ci` e geração da documentação OpenAPI.

## Boas práticas de segurança aplicadas no código

- Autenticação JWT nas APIs administrativas, com guard nas rotas internas.
- Senhas armazenadas apenas como hash (bcrypt), nunca em texto puro.
- Validação de entrada na borda HTTP (class-validator) e no domínio (CPF, CNPJ e placa validam a si mesmos).
- Cabeçalhos de segurança HTTP com Helmet.
- `ValidationPipe` com `whitelist` e `forbidNonWhitelisted`, que rejeita propriedades não esperadas no corpo das requisições.
- Segredos e credenciais fora do código, lidos por variáveis de ambiente (`.env.example` documenta as chaves, sem valores reais).
- Rotas públicas do cliente (consulta do andamento e decisão sobre o orçamento) protegidas pela verificação conjunta do código da OS e do documento do cliente.
- Imagem Docker em dois estágios: o estágio final instala apenas dependências de produção (`npm ci --omit=dev`).

## Endurecimento aplicado após revisão de código

- **Fail-fast de segredos em produção**: com `NODE_ENV=production`, a aplicação recusa subir se `JWT_SECRET` ou `ADMIN_PASSWORD` não estiverem definidos, evitando o uso de valores padrão de desenvolvimento.
- **Schema por migrations**: a sincronização automática de schema do TypeORM fica desligada. O schema é criado e alterado apenas por migrations versionadas, aplicadas na subida.
- **Concorrência sem perda de atualização**: todo comando sobre uma OS e toda movimentação de estoque leem a linha com `SELECT ... FOR UPDATE`, dentro da transação. Duas aprovações simultâneas da mesma OS não baixam o estoque duas vezes, e reposições simultâneas são todas somadas. As peças são bloqueadas sempre na mesma ordem, evitando deadlock entre aprovações.
- **Preservação do histórico**: clientes e veículos com ordens de serviço não podem ser removidos.
- **Rotas públicas sem oráculo de enumeração**: ordem inexistente e documento inválido retornam a mesma resposta genérica, impedindo a descoberta de códigos de ordens válidos.

## Conclusão

Não há vulnerabilidades conhecidas nas dependências de produção nesta data. Nas ferramentas de desenvolvimento, resta um aviso de severidade baixa no `deepmerge`, sem correção publicada, que não chega à imagem de produção.
