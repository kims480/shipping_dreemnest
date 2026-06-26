import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * PostgreSQL + PostGIS connection (TECH_ARCHITECTURE §3). `synchronize` is
 * dev-only convenience — replace with migrations before any shared environment.
 */
export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'dreem_nest',
    password: process.env.DB_PASSWORD ?? 'dreem_nest',
    database: process.env.DB_NAME ?? 'dreem_nest',
    autoLoadEntities: true,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  }),
);
