/**
 * Carrega e normaliza as variaveis de ambiente da aplicacao. Centralizar a
 * leitura evita o uso espalhado de process.env e documenta os valores padrao
 * usados em desenvolvimento.
 */
export interface ConfiguracaoBanco {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  migrationsRun: boolean;
  logging: boolean;
}

export interface ConfiguracaoJwt {
  secret: string;
  expiresIn: string;
}

export interface ConfiguracaoAdmin {
  email: string;
  password: string;
}

export interface Configuracao {
  ambiente: string;
  porta: number;
  banco: ConfiguracaoBanco;
  jwt: ConfiguracaoJwt;
  admin: ConfiguracaoAdmin;
}

function booleano(valor: string | undefined, padrao: boolean): boolean {
  if (valor === undefined) {
    return padrao;
  }
  return valor.toLowerCase() === 'true';
}

function inteiro(valor: string | undefined, padrao: number): number {
  const convertido = Number(valor);
  return Number.isInteger(convertido) ? convertido : padrao;
}

export function carregarConfiguracao(): Configuracao {
  const ambiente = process.env.NODE_ENV ?? 'development';

  // Fail-fast em producao: segredos e credenciais sensiveis nao podem cair nos
  // valores padrao de desenvolvimento. Sem isso, uma implantacao sem variaveis
  // definidas subiria com segredo JWT e senha de admin publicos.
  if (ambiente === 'production') {
    const obrigatorias = ['JWT_SECRET', 'ADMIN_PASSWORD'] as const;
    const ausentes = obrigatorias.filter((chave) => !process.env[chave]);
    if (ausentes.length > 0) {
      throw new Error(
        `Configuracao invalida: em producao as variaveis ${ausentes.join(', ')} ` +
          'sao obrigatorias e precisam ser definidas.',
      );
    }
  }

  return {
    ambiente,
    porta: inteiro(process.env.PORT, 3000),
    banco: {
      host: process.env.DB_HOST ?? 'localhost',
      port: inteiro(process.env.DB_PORT, 5432),
      username: process.env.DB_USERNAME ?? 'oficina',
      password: process.env.DB_PASSWORD ?? 'oficina',
      database: process.env.DB_DATABASE ?? 'oficina',
      // O schema e criado e evoluido pelas migrations, aplicadas na subida.
      // A sincronizacao automatica do TypeORM fica desligada por padrao.
      synchronize: booleano(process.env.DB_SYNCHRONIZE, false),
      migrationsRun: booleano(process.env.DB_MIGRATIONS_RUN, true),
      logging: booleano(process.env.DB_LOGGING, false),
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? 'segredo-de-desenvolvimento-nao-use-em-producao',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '3600s',
    },
    admin: {
      email: process.env.ADMIN_EMAIL ?? 'admin@oficina.com.br',
      password: process.env.ADMIN_PASSWORD ?? 'Admin@123',
    },
  };
}
