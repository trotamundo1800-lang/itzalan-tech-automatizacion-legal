import { DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

function toBool(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }
  return TRUE_VALUES.has(value.toLowerCase());
}

export function getTypeOrmConfig(): TypeOrmModuleOptions & DataSourceOptions {
  const usePostgres = process.env.DB_TYPE === 'postgres' || !!process.env.DATABASE_URL;
  const synchronize = toBool(process.env.DB_SYNCHRONIZE, true);
  const migrationsRun = toBool(process.env.DB_MIGRATIONS_RUN, false);

  const common = {
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize,
    migrationsRun,
    autoLoadEntities: true,
  };

  if (usePostgres) {
    const postgresConfig: TypeOrmModuleOptions & DataSourceOptions = {
      ...common,
      type: 'postgres',
      url: process.env.DATABASE_URL,
      database: process.env.DB_NAME || 'itzalan',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'itzalan',
      password: process.env.DB_PASSWORD || 'changeme',
      ssl: toBool(process.env.DB_SSL, false) ? { rejectUnauthorized: false } : false,
    };

    return postgresConfig;
  }

  const sqliteConfig: TypeOrmModuleOptions & DataSourceOptions = {
    ...common,
    type: 'sqlite',
    database: process.env.DB_NAME || 'database.sqlite',
  };

  return sqliteConfig;
}