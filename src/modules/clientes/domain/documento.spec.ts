import { Documento } from './documento';
import { ErroDeValidacao } from '../../../shared/domain/excecoes';

describe('Documento', () => {
  describe('CPF', () => {
    it('aceita um CPF valido sem mascara', () => {
      const documento = Documento.criar('52998224725');
      expect(documento.valor).toBe('52998224725');
      expect(documento.tipo).toBe('CPF');
    });

    it('aceita um CPF valido com mascara, guardando apenas os digitos', () => {
      const documento = Documento.criar('529.982.247-25');
      expect(documento.valor).toBe('52998224725');
      expect(documento.tipo).toBe('CPF');
    });

    it('formata o CPF com mascara', () => {
      const documento = Documento.criar('52998224725');
      expect(documento.formatado).toBe('529.982.247-25');
    });

    it('rejeita um CPF com digitos verificadores invalidos', () => {
      expect(() => Documento.criar('12345678900')).toThrow(ErroDeValidacao);
    });

    it('rejeita um CPF formado por digitos repetidos', () => {
      expect(() => Documento.criar('11111111111')).toThrow(ErroDeValidacao);
      expect(() => Documento.criar('00000000000')).toThrow(ErroDeValidacao);
    });
  });

  describe('CNPJ', () => {
    it('aceita um CNPJ valido sem mascara', () => {
      const documento = Documento.criar('11222333000181');
      expect(documento.valor).toBe('11222333000181');
      expect(documento.tipo).toBe('CNPJ');
    });

    it('aceita um CNPJ valido com mascara, guardando apenas os digitos', () => {
      const documento = Documento.criar('11.222.333/0001-81');
      expect(documento.valor).toBe('11222333000181');
      expect(documento.tipo).toBe('CNPJ');
    });

    it('formata o CNPJ com mascara', () => {
      const documento = Documento.criar('11222333000181');
      expect(documento.formatado).toBe('11.222.333/0001-81');
    });

    it('rejeita um CNPJ com digitos verificadores invalidos', () => {
      expect(() => Documento.criar('11222333000199')).toThrow(ErroDeValidacao);
    });

    it('rejeita um CNPJ formado por digitos repetidos', () => {
      expect(() => Documento.criar('11111111111111')).toThrow(ErroDeValidacao);
    });
  });

  describe('entradas invalidas', () => {
    it('rejeita quando a quantidade de digitos nao e de CPF nem de CNPJ', () => {
      expect(() => Documento.criar('123')).toThrow(ErroDeValidacao);
      expect(() => Documento.criar('123456789012')).toThrow(ErroDeValidacao);
    });

    it('rejeita documento vazio', () => {
      expect(() => Documento.criar('')).toThrow(ErroDeValidacao);
      expect(() => Documento.criar('   ')).toThrow(ErroDeValidacao);
    });

    it('compara igualdade por valor', () => {
      const a = Documento.criar('529.982.247-25');
      const b = Documento.criar('52998224725');
      expect(a.igualA(b)).toBe(true);
    });
  });
});
