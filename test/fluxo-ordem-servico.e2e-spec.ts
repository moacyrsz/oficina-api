import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { criarAppDeTeste, CREDENCIAIS_ADMIN } from './suporte/app-de-teste';

/**
 * Teste de integracao dos fluxos principais, exercitando a stack completa:
 * HTTP, validacao, autenticacao JWT, casos de uso, dominio e persistencia
 * (TypeORM sobre PostgreSQL em memoria).
 */
describe('Fluxo da Ordem de Servico (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let http: () => request.SuperTest<request.Test>;

  beforeAll(async () => {
    app = await criarAppDeTeste();
    http = () => request(app.getHttpServer());

    const login = await http()
      .post('/api/auth/login')
      .send(CREDENCIAIS_ADMIN)
      .expect(200);
    token = login.body.accessToken;
    expect(token).toBeTruthy();
  });

  afterAll(async () => {
    await app.close();
  });

  const comToken = (req: request.Test): request.Test =>
    req.set('Authorization', `Bearer ${token}`);

  it('bloqueia o acesso administrativo sem token', async () => {
    await http().get('/api/clientes').expect(401);
  });

  it('rejeita CPF invalido ao cadastrar cliente', async () => {
    await comToken(http().post('/api/clientes'))
      .send({ nome: 'Teste', documento: '12345678900', email: 't@e.com', telefone: '11999999999' })
      .expect(400);
  });

  it('executa o fluxo completo de atendimento e baixa o estoque na aprovacao', async () => {
    const cliente = await comToken(http().post('/api/clientes'))
      .send({ nome: 'Maria Oliveira', documento: '529.982.247-25', email: 'maria@email.com', telefone: '11988887777' })
      .expect(201);
    const clienteId = cliente.body.id;

    const veiculo = await comToken(http().post('/api/veiculos'))
      .send({ placa: 'ABC1D23', marca: 'Fiat', modelo: 'Uno', ano: 2020, clienteId })
      .expect(201);
    const veiculoId = veiculo.body.id;

    const servico = await comToken(http().post('/api/servicos'))
      .send({ nome: 'Troca de oleo', descricao: 'Troca completa', valor: 120 })
      .expect(201);
    const servicoId = servico.body.id;

    const peca = await comToken(http().post('/api/pecas'))
      .send({ nome: 'Filtro de oleo', descricao: 'Filtro', precoUnitario: 40, quantidadeEmEstoque: 10 })
      .expect(201);
    const pecaId = peca.body.id;

    const ordem = await comToken(http().post('/api/ordens-servico'))
      .send({ clienteId, veiculoId })
      .expect(201);
    const ordemId = ordem.body.id;
    const codigo = ordem.body.codigo;
    expect(ordem.body.status).toBe('RECEBIDA');

    await comToken(http().post(`/api/ordens-servico/${ordemId}/diagnostico`)).expect(200);
    await comToken(http().post(`/api/ordens-servico/${ordemId}/itens-servico`))
      .send({ servicoId, quantidade: 2 })
      .expect(201);
    await comToken(http().post(`/api/ordens-servico/${ordemId}/itens-peca`))
      .send({ pecaId, quantidade: 3 })
      .expect(201);

    const enviada = await comToken(http().post(`/api/ordens-servico/${ordemId}/orcamento/enviar`)).expect(200);
    expect(enviada.body.status).toBe('AGUARDANDO_APROVACAO');
    expect(enviada.body.orcamento.valorTotal).toBe(360);

    const aprovada = await comToken(http().post(`/api/ordens-servico/${ordemId}/orcamento/aprovar`)).expect(200);
    expect(aprovada.body.status).toBe('EM_EXECUCAO');

    const pecaAposBaixa = await comToken(http().get(`/api/pecas/${pecaId}`)).expect(200);
    expect(pecaAposBaixa.body.quantidadeEmEstoque).toBe(7);

    await comToken(http().post(`/api/ordens-servico/${ordemId}/finalizar`)).expect(200);
    const entregue = await comToken(http().post(`/api/ordens-servico/${ordemId}/entregar`)).expect(200);
    expect(entregue.body.status).toBe('ENTREGUE');

    const andamento = await http()
      .get(`/api/acompanhamento/${codigo}`)
      .query({ documento: '52998224725' })
      .expect(200);
    expect(andamento.body.status).toBe('ENTREGUE');
    expect(andamento.body.veiculo).toContain('ABC1D23');

    // Documento incorreto retorna 404 generico (mesma resposta de ordem
    // inexistente), evitando enumeracao de codigos validos.
    await http()
      .get(`/api/acompanhamento/${codigo}`)
      .query({ documento: '00000000000' })
      .expect(404);
  });

  it('desfaz a aprovacao quando o estoque e insuficiente (transacao)', async () => {
    const cliente = await comToken(http().post('/api/clientes'))
      .send({ nome: 'Joao Souza', documento: '11222333000181', email: 'joao@email.com', telefone: '11977776666' })
      .expect(201);
    const veiculo = await comToken(http().post('/api/veiculos'))
      .send({ placa: 'XYZ9A88', marca: 'VW', modelo: 'Gol', ano: 2019, clienteId: cliente.body.id })
      .expect(201);
    const peca = await comToken(http().post('/api/pecas'))
      .send({ nome: 'Pastilha', precoUnitario: 90, quantidadeEmEstoque: 1 })
      .expect(201);

    const ordem = await comToken(http().post('/api/ordens-servico'))
      .send({ clienteId: cliente.body.id, veiculoId: veiculo.body.id })
      .expect(201);
    const ordemId = ordem.body.id;

    await comToken(http().post(`/api/ordens-servico/${ordemId}/diagnostico`)).expect(200);
    await comToken(http().post(`/api/ordens-servico/${ordemId}/itens-peca`))
      .send({ pecaId: peca.body.id, quantidade: 5 })
      .expect(201);
    await comToken(http().post(`/api/ordens-servico/${ordemId}/orcamento/enviar`)).expect(200);

    // Estoque insuficiente: a aprovacao deve falhar com 422
    await comToken(http().post(`/api/ordens-servico/${ordemId}/orcamento/aprovar`)).expect(422);

    // A transacao foi desfeita: estoque intacto e ordem ainda aguardando aprovacao
    const pecaDepois = await comToken(http().get(`/api/pecas/${peca.body.id}`)).expect(200);
    expect(pecaDepois.body.quantidadeEmEstoque).toBe(1);

    const ordemDepois = await comToken(http().get(`/api/ordens-servico/${ordemId}`)).expect(200);
    expect(ordemDepois.body.status).toBe('AGUARDANDO_APROVACAO');
  });
});
