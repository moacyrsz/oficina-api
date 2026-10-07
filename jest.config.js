/**
 * Configuracao do Jest para testes unitarios e de componente.
 *
 * A cobertura e coletada dos dominios criticos: as camadas de dominio de todos
 * os modulos (onde vivem as regras de negocio, objetos de valor e agregados) e a
 * camada de aplicacao do nucleo de Ordens de Servico (os fluxos criticos de
 * atendimento). O desafio exige cobertura minima de 80% nesses dominios criticos.
 * Contratos (portas e interfaces de repositorio) e eventos nao carregam logica
 * executavel relevante e ficam fora da medicao.
 */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  collectCoverageFrom: [
    'src/shared/domain/**/*.ts',
    'src/modules/**/domain/**/*.ts',
    'src/modules/ordens-servico/application/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/*.repository.ts',
    '!src/**/eventos.ts',
    '!src/**/ports/**',
  ],
  coverageDirectory: './coverage',
  // O provedor V8 mede o codigo efetivamente executado e evita os ramos
  // sinteticos gerados pelos helpers de decorator do TypeScript (@Inject),
  // que inflam artificialmente a contagem de ramos nos construtores.
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__support__/',
    '\\.spec\\.ts$',
    '\\.e2e-spec\\.ts$',
  ],
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
