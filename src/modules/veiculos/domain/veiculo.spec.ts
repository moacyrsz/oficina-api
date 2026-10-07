import { ErroDeValidacao } from '../../../shared/domain/excecoes';
import { Placa } from './placa';
import { DadosCriarVeiculo, Veiculo } from './veiculo';

const CLIENTE_ID = '11111111-1111-1111-1111-111111111111';

function dadosValidos(): DadosCriarVeiculo {
  return {
    placa: Placa.criar('ABC1D23'),
    marca: 'Volkswagen',
    modelo: 'Gol',
    ano: 2022,
    clienteId: CLIENTE_ID,
  };
}

describe('Veiculo', () => {
  describe('criacao', () => {
    it('cria um veiculo com dados validos e gera um id', () => {
      const veiculo = Veiculo.criar(dadosValidos());
      expect(veiculo.id).toBeDefined();
      expect(veiculo.placa.valor).toBe('ABC1D23');
      expect(veiculo.marca).toBe('Volkswagen');
      expect(veiculo.modelo).toBe('Gol');
      expect(veiculo.ano).toBe(2022);
      expect(veiculo.clienteId).toBe(CLIENTE_ID);
    });

    it('usa o id informado quando fornecido', () => {
      const veiculo = Veiculo.criar(dadosValidos(), 'veiculo-1');
      expect(veiculo.id).toBe('veiculo-1');
    });

    it('remove espacos em branco de marca e modelo', () => {
      const veiculo = Veiculo.criar({ ...dadosValidos(), marca: '  Fiat ', modelo: ' Uno ' });
      expect(veiculo.marca).toBe('Fiat');
      expect(veiculo.modelo).toBe('Uno');
    });

    it('aceita o ano minimo e o ano maximo permitido', () => {
      const anoMaximo = new Date().getFullYear() + 1;
      expect(Veiculo.criar({ ...dadosValidos(), ano: 1900 }).ano).toBe(1900);
      expect(Veiculo.criar({ ...dadosValidos(), ano: anoMaximo }).ano).toBe(anoMaximo);
    });
  });

  describe('validacoes', () => {
    it('exige marca', () => {
      expect(() => Veiculo.criar({ ...dadosValidos(), marca: '   ' })).toThrow(ErroDeValidacao);
    });

    it('exige modelo', () => {
      expect(() => Veiculo.criar({ ...dadosValidos(), modelo: '' })).toThrow(ErroDeValidacao);
    });

    it('exige clienteId', () => {
      expect(() => Veiculo.criar({ ...dadosValidos(), clienteId: '  ' })).toThrow(ErroDeValidacao);
    });

    it('rejeita ano anterior a 1900', () => {
      expect(() => Veiculo.criar({ ...dadosValidos(), ano: 1899 })).toThrow(ErroDeValidacao);
    });

    it('rejeita ano acima do limite permitido', () => {
      const acimaDoLimite = new Date().getFullYear() + 2;
      expect(() => Veiculo.criar({ ...dadosValidos(), ano: acimaDoLimite })).toThrow(ErroDeValidacao);
    });

    it('rejeita ano nao inteiro', () => {
      expect(() => Veiculo.criar({ ...dadosValidos(), ano: 2020.5 })).toThrow(ErroDeValidacao);
    });
  });

  describe('atualizacao', () => {
    it('atualiza marca, modelo e ano', () => {
      const veiculo = Veiculo.criar(dadosValidos());
      veiculo.atualizar({ marca: 'Fiat', modelo: 'Argo', ano: 2024 });
      expect(veiculo.marca).toBe('Fiat');
      expect(veiculo.modelo).toBe('Argo');
      expect(veiculo.ano).toBe(2024);
    });

    it('mantem os valores atuais quando um campo nao e informado', () => {
      const veiculo = Veiculo.criar(dadosValidos());
      veiculo.atualizar({ ano: 2023 });
      expect(veiculo.marca).toBe('Volkswagen');
      expect(veiculo.modelo).toBe('Gol');
      expect(veiculo.ano).toBe(2023);
    });

    it('nao altera a placa durante a atualizacao', () => {
      const veiculo = Veiculo.criar(dadosValidos());
      veiculo.atualizar({ marca: 'Fiat' });
      expect(veiculo.placa.valor).toBe('ABC1D23');
    });

    it('remove espacos em branco ao atualizar', () => {
      const veiculo = Veiculo.criar(dadosValidos());
      veiculo.atualizar({ modelo: '  Polo  ' });
      expect(veiculo.modelo).toBe('Polo');
    });

    it('rejeita atualizacao com marca vazia', () => {
      const veiculo = Veiculo.criar(dadosValidos());
      expect(() => veiculo.atualizar({ marca: '   ' })).toThrow(ErroDeValidacao);
    });

    it('rejeita atualizacao com ano invalido', () => {
      const veiculo = Veiculo.criar(dadosValidos());
      expect(() => veiculo.atualizar({ ano: 1800 })).toThrow(ErroDeValidacao);
    });
  });

  describe('restauracao', () => {
    it('restaura um veiculo a partir de props e id', () => {
      const veiculo = Veiculo.restaurar(
        {
          placa: Placa.criar('ABC1234'),
          marca: 'Ford',
          modelo: 'Ka',
          ano: 2015,
          clienteId: CLIENTE_ID,
        },
        'veiculo-99',
      );
      expect(veiculo.id).toBe('veiculo-99');
      expect(veiculo.placa.formatado).toBe('ABC-1234');
      expect(veiculo.marca).toBe('Ford');
    });
  });
});
