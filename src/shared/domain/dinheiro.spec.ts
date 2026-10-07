import { Dinheiro } from './dinheiro';
import { ErroDeValidacao } from './excecoes';

describe('Dinheiro', () => {
  it('cria a partir de reais convertendo para centavos', () => {
    const valor = Dinheiro.deReais(10.5);
    expect(valor.centavos).toBe(1050);
    expect(valor.reais).toBe(10.5);
  });

  it('cria a partir de centavos', () => {
    expect(Dinheiro.deCentavos(2599).reais).toBe(25.99);
  });

  it('representa o valor zero', () => {
    expect(Dinheiro.zero().centavos).toBe(0);
  });

  it('rejeita valores negativos', () => {
    expect(() => Dinheiro.deReais(-1)).toThrow(ErroDeValidacao);
    expect(() => Dinheiro.deCentavos(-10)).toThrow(ErroDeValidacao);
  });

  it('rejeita valores nao numericos', () => {
    expect(() => Dinheiro.deReais(Number.NaN)).toThrow(ErroDeValidacao);
    expect(() => Dinheiro.deReais(Number.POSITIVE_INFINITY)).toThrow(ErroDeValidacao);
  });

  it('rejeita centavos nao inteiros', () => {
    expect(() => Dinheiro.deCentavos(10.5)).toThrow(ErroDeValidacao);
  });

  it('soma dois valores', () => {
    const total = Dinheiro.deReais(10).somar(Dinheiro.deReais(5.25));
    expect(total.centavos).toBe(1525);
  });

  it('multiplica por uma quantidade inteira', () => {
    const total = Dinheiro.deReais(12.5).multiplicarPor(3);
    expect(total.centavos).toBe(3750);
  });

  it('rejeita multiplicacao por quantidade invalida', () => {
    expect(() => Dinheiro.deReais(10).multiplicarPor(-1)).toThrow(ErroDeValidacao);
    expect(() => Dinheiro.deReais(10).multiplicarPor(1.5)).toThrow(ErroDeValidacao);
  });

  it('formata no padrao brasileiro', () => {
    const texto = Dinheiro.deReais(1234.56).formatar();
    expect(texto).toContain('1.234,56');
  });

  it('compara igualdade por valor', () => {
    expect(Dinheiro.deReais(10).igualA(Dinheiro.deCentavos(1000))).toBe(true);
    expect(Dinheiro.deReais(10).igualA(Dinheiro.deReais(11))).toBe(false);
  });
});
