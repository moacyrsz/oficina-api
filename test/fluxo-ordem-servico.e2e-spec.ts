import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { criarAppDeTeste, CREDENCIAIS_ADMIN } from './suporte/app-de-teste';

/**
 * Teste de integracao dos fluxos principais, exercitando a stack completa:
 * HTTP, validacao, autenticacao JWT, casos de uso, dominio e persistencia
 * (TypeORM sobre um banco relacional em memoria, sql.js).
 */
describe('Fluxo da Ordem de Servico (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let http: () => request.Agent;

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

  it('valida o documento e a placa ao abrir a ordem de servico', async () => {
    await comToken(http().post('/api/ordens-servico'))
      .send({ documento: '12345678900', placa: 'ABC1D23' })
      .expect(400);
    await comToken(http().post('/api/ordens-servico'))
      .send({ documento: '529.982.247-25', placa: 'PLACA-INVALIDA' })
      .expect(400);
    await comToken(http().post('/api/ordens-servico'))
      .send({ documento: '529.982.247-25', placa: 'QQQ1Q11' })
      .expect(404);
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
      .send({ documento: '529.982.247-25', placa: 'abc-1d23' })
      .expect(201);
    const ordemId = ordem.body.id;
    const codigo = ordem.body.codigo;
    expect(ordem.body.status).toBe('RECEBIDA');
    expect(ordem.body.clienteId).toBe(clienteId);
    expect(ordem.body.veiculoId).toBe(veiculoId);

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

  it('o cliente aprova e rejeita orcamentos pela API publica, sem token', async () => {
    const cliente = await comToken(http().post('/api/clientes'))
      .send({ nome: 'Carlos Dias', documento: '111.444.777-35', email: 'carlos@email.com', telefone: '11966665555' })
      .expect(201);
    await comToken(http().post('/api/veiculos'))
      .send({ placa: 'DEF4G56', marca: 'Honda', modelo: 'Fit', ano: 2018, clienteId: cliente.body.id })
      .expect(201);
    const peca = await comToken(http().post('/api/pecas'))
      .send({ nome: 'Correia dentada', precoUnitario: 150, quantidadeEmEstoque: 4 })
      .expect(201);

    const abrirOrcamento = async (): Promise<string> => {
      const ordem = await comToken(http().post('/api/ordens-servico'))
        .send({ documento: '11144477735', placa: 'DEF4G56' })
        .expect(201);
      await comToken(http().post(`/api/ordens-servico/${ordem.body.id}/diagnostico`)).expect(200);
      await comToken(http().post(`/api/ordens-servico/${ordem.body.id}/itens-peca`))
        .send({ pecaId: peca.body.id, quantidade: 1 })
        .expect(201);
      await comToken(http().post(`/api/ordens-servico/${ordem.body.id}/orcamento/enviar`)).expect(200);
      return ordem.body.codigo;
    };

    const aprovada = await abrirOrcamento();
    await http()
      .post(`/api/acompanhamento/${aprovada}/orcamento/aprovar`)
      .send({ documento: '529.982.247-25' })
      .expect(404);
    const aprovacao = await http()
      .post(`/api/acompanhamento/${aprovada}/orcamento/aprovar`)
      .send({ documento: '111.444.777-35' })
      .expect(200);
    expect(aprovacao.body.status).toBe('EM_EXECUCAO');
    expect(aprovacao.body.decisaoOrcamento).toBe('APROVADO');
    const pecaAposAprovacao = await comToken(http().get(`/api/pecas/${peca.body.id}`)).expect(200);
    expect(pecaAposAprovacao.body.quantidadeEmEstoque).toBe(3);
    await http()
      .post(`/api/acompanhamento/${aprovada}/orcamento/aprovar`)
      .send({ documento: '111.444.777-35' })
      .expect(422);

    const rejeitada = await abrirOrcamento();
    const rejeicao = await http()
      .post(`/api/acompanhamento/${rejeitada}/orcamento/rejeitar`)
      .send({ documento: '111.444.777-35', motivo: 'Prefiro esperar' })
      .expect(200);
    expect(rejeicao.body.status).toBe('EM_DIAGNOSTICO');
    expect(rejeicao.body.decisaoOrcamento).toBe('REJEITADO');
  });

  it('impede remover cliente ou veiculo com historico e libera quem nao tem vinculos', async () => {
    const comHistorico = await comToken(http().post('/api/clientes'))
      .send({ nome: 'Paula Reis', documento: '123.456.789-09', email: 'paula@email.com', telefone: '11944443333' })
      .expect(201);
    const veiculoComHistorico = await comToken(http().post('/api/veiculos'))
      .send({ placa: 'HIS7T01', marca: 'Ford', modelo: 'Ka', ano: 2017, clienteId: comHistorico.body.id })
      .expect(201);
    await comToken(http().post('/api/ordens-servico'))
      .send({ documento: '12345678909', placa: 'HIS7T01' })
      .expect(201);

    await comToken(http().delete(`/api/veiculos/${veiculoComHistorico.body.id}`)).expect(409);
    await comToken(http().delete(`/api/clientes/${comHistorico.body.id}`)).expect(409);

    const semOrdens = await comToken(http().post('/api/clientes'))
      .send({ nome: 'Rui Alves', documento: '987.654.321-00', email: 'rui@email.com', telefone: '11933332222' })
      .expect(201);
    const veiculoSemOrdens = await comToken(http().post('/api/veiculos'))
      .send({ placa: 'SEM0R01', marca: 'Renault', modelo: 'Kwid', ano: 2022, clienteId: semOrdens.body.id })
      .expect(201);

    await comToken(http().delete(`/api/clientes/${semOrdens.body.id}`)).expect(409);
    await comToken(http().delete(`/api/veiculos/${veiculoSemOrdens.body.id}`)).expect(204);
    await comToken(http().delete(`/api/clientes/${semOrdens.body.id}`)).expect(204);
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
      .send({ documento: '11.222.333/0001-81', placa: 'XYZ9A88' })
      .expect(201);
    expect(ordem.body.veiculoId).toBe(veiculo.body.id);
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
