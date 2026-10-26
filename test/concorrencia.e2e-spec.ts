import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { criarAppDeTeste, CREDENCIAIS_ADMIN, usandoPostgres } from './suporte/app-de-teste';

/**
 * Concorrencia sobre o PostgreSQL real. O banco em memoria (sql.js) executa uma
 * operacao por vez e nao suporta bloqueio pessimista, por isso estes testes so
 * rodam com TESTE_BANCO=postgres (npm run test:e2e:pg).
 *
 * Para que a disputa aconteca sempre, uma conexao externa trava a linha
 * disputada, o teste espera todas as requisicoes ficarem bloqueadas no banco e
 * so entao libera a linha.
 */
const descrever = usandoPostgres ? describe : describe.skip;

descrever('Concorrencia no PostgreSQL (e2e)', () => {
  const SIMULTANEAS = 5;
  let app: INestApplication;
  let banco: DataSource;
  let token: string;
  let servicoId: string;

  const http = () => request(app.getHttpServer());
  const autenticado = (req: request.Test): request.Test =>
    req.set('Authorization', `Bearer ${token}`);

  async function aguardarSessoesBloqueadas(quantidade: number): Promise<void> {
    for (let tentativa = 0; tentativa < 250; tentativa += 1) {
      const [{ total }] = await banco.query(
        `SELECT count(*)::int AS total FROM pg_stat_activity
          WHERE datname = current_database() AND wait_event_type = 'Lock'`,
      );
      if (total >= quantidade) {
        return;
      }
      await new Promise((resolver) => setTimeout(resolver, 20));
    }
    throw new Error(`As ${quantidade} requisicoes nao ficaram bloqueadas no banco.`);
  }

  async function disputarLinha(
    tabela: 'ordens_servico' | 'pecas',
    id: string,
    requisicao: () => request.Test,
  ): Promise<request.Response[]> {
    const trava = banco.createQueryRunner();
    await trava.connect();
    await trava.startTransaction();
    try {
      await trava.query(`SELECT id FROM ${tabela} WHERE id = $1 FOR UPDATE`, [id]);
      const respostas = Promise.all(Array.from({ length: SIMULTANEAS }, requisicao));
      await aguardarSessoesBloqueadas(SIMULTANEAS);
      await trava.commitTransaction();
      return await respostas;
    } finally {
      if (trava.isTransactionActive) {
        await trava.rollbackTransaction();
      }
      await trava.release();
    }
  }

  beforeAll(async () => {
    app = await criarAppDeTeste();
    // Servidor ja escutando: as requisicoes simultaneas compartilham a mesma porta.
    await app.listen(0);
    banco = app.get(DataSource);
    const login = await http().post('/api/auth/login').send(CREDENCIAIS_ADMIN).expect(200);
    token = login.body.accessToken;

    const cliente = await autenticado(http().post('/api/clientes'))
      .send({
        nome: 'Ana Lima',
        documento: '52998224725',
        email: 'ana@email.com',
        telefone: '11955554444',
      })
      .expect(201);
    await autenticado(http().post('/api/veiculos'))
      .send({
        placa: 'CON1C23',
        marca: 'Fiat',
        modelo: 'Argo',
        ano: 2021,
        clienteId: cliente.body.id,
      })
      .expect(201);
    const servico = await autenticado(http().post('/api/servicos'))
      .send({ nome: 'Alinhamento', valor: 80 })
      .expect(201);
    servicoId = servico.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  async function criarPeca(quantidadeEmEstoque: number): Promise<string> {
    const peca = await autenticado(http().post('/api/pecas'))
      .send({ nome: 'Pastilha de freio', precoUnitario: 50, quantidadeEmEstoque })
      .expect(201);
    return peca.body.id;
  }

  async function abrirOrdemEmDiagnostico(): Promise<string> {
    const ordem = await autenticado(http().post('/api/ordens-servico'))
      .send({ documento: '52998224725', placa: 'CON1C23' })
      .expect(201);
    await autenticado(http().post(`/api/ordens-servico/${ordem.body.id}/diagnostico`)).expect(200);
    return ordem.body.id;
  }

  it('aprova uma unica vez quando a mesma OS recebe aprovacoes simultaneas', async () => {
    const pecaId = await criarPeca(10);
    const ordemId = await abrirOrdemEmDiagnostico();
    await autenticado(http().post(`/api/ordens-servico/${ordemId}/itens-peca`))
      .send({ pecaId, quantidade: 3 })
      .expect(201);
    await autenticado(http().post(`/api/ordens-servico/${ordemId}/orcamento/enviar`)).expect(200);

    const respostas = await disputarLinha('pecas', pecaId, () =>
      autenticado(http().post(`/api/ordens-servico/${ordemId}/orcamento/aprovar`)),
    );

    const status = respostas.map((resposta) => resposta.status);
    expect(status.filter((codigo) => codigo === 200)).toHaveLength(1);
    expect(status.filter((codigo) => codigo === 422)).toHaveLength(SIMULTANEAS - 1);
    const peca = await autenticado(http().get(`/api/pecas/${pecaId}`)).expect(200);
    expect(peca.body.quantidadeEmEstoque).toBe(7);
  });

  it('mantem todos os itens incluidos ao mesmo tempo na mesma OS', async () => {
    const ordemId = await abrirOrdemEmDiagnostico();

    const respostas = await disputarLinha('ordens_servico', ordemId, () =>
      autenticado(http().post(`/api/ordens-servico/${ordemId}/itens-servico`)).send({
        servicoId,
        quantidade: 1,
      }),
    );

    expect(respostas.map((resposta) => resposta.status)).toEqual(Array(SIMULTANEAS).fill(201));
    const ordem = await autenticado(http().get(`/api/ordens-servico/${ordemId}`)).expect(200);
    expect(ordem.body.itensServico).toHaveLength(SIMULTANEAS);
  });

  it('soma todas as reposicoes de estoque feitas ao mesmo tempo', async () => {
    const pecaId = await criarPeca(10);

    const respostas = await disputarLinha('pecas', pecaId, () =>
      autenticado(http().post(`/api/pecas/${pecaId}/estoque/repor`)).send({ quantidade: 2 }),
    );

    expect(respostas.map((resposta) => resposta.status)).toEqual(Array(SIMULTANEAS).fill(200));
    const peca = await autenticado(http().get(`/api/pecas/${pecaId}`)).expect(200);
    expect(peca.body.quantidadeEmEstoque).toBe(10 + 2 * SIMULTANEAS);
  });
});
