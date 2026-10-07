import { ErroDeValidacao } from '../../../shared/domain/excecoes';
import { Placa } from './placa';

describe('Placa', () => {
  describe('formato antigo', () => {
    it('aceita uma placa valida no padrao antigo', () => {
      expect(Placa.criar('ABC1234').valor).toBe('ABC1234');
    });

    it('formata a placa antiga com hifen', () => {
      expect(Placa.criar('ABC1234').formatado).toBe('ABC-1234');
    });

    it('normaliza minusculas, hifen e espacos', () => {
      expect(Placa.criar('abc-1234').valor).toBe('ABC1234');
      expect(Placa.criar('  abc 1234  ').valor).toBe('ABC1234');
    });
  });

  describe('formato Mercosul', () => {
    it('aceita uma placa valida no padrao Mercosul', () => {
      expect(Placa.criar('ABC1D23').valor).toBe('ABC1D23');
    });

    it('mantem o formato continuo no padrao Mercosul', () => {
      expect(Placa.criar('ABC1D23').formatado).toBe('ABC1D23');
    });

    it('normaliza minusculas no padrao Mercosul', () => {
      expect(Placa.criar('abc1d23').valor).toBe('ABC1D23');
    });
  });

  describe('entradas invalidas', () => {
    it('rejeita placa com menos caracteres que o padrao', () => {
      expect(() => Placa.criar('AB1234')).toThrow(ErroDeValidacao);
    });

    it('rejeita placa que nao casa com nenhum dos dois padroes', () => {
      expect(() => Placa.criar('ABCD123')).toThrow(ErroDeValidacao);
    });

    it('rejeita placa vazia', () => {
      expect(() => Placa.criar('')).toThrow(ErroDeValidacao);
    });

    it('rejeita entrada que nao e texto', () => {
      expect(() => Placa.criar(undefined as unknown as string)).toThrow(ErroDeValidacao);
      expect(() => Placa.criar(null as unknown as string)).toThrow(ErroDeValidacao);
    });
  });

  it('compara igualdade pelo valor normalizado', () => {
    expect(Placa.criar('abc-1234').igualA(Placa.criar('ABC1234'))).toBe(true);
    expect(Placa.criar('ABC1234').igualA(Placa.criar('ABC1D23'))).toBe(false);
  });
});
