import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const dataDataSource = new DataSource({
  type: 'mysql',
  name: 'data',
  host: process.env.DB_DATA_HOST || 'localhost',
  port: parseInt(process.env.DB_DATA_PORT || '3306', 10),
  username: process.env.DB_DATA_USER || 'root',
  password: process.env.DB_DATA_PASS || 'root',
  database: process.env.DB_DATA_NAME || 'db_data',
  synchronize: false,
  migrations: ['dist/migrations/*.js'],
  entities: ['dist/modules/data/**/*.entity.js'],
});

export const opsDataSource = new DataSource({
  type: 'mysql',
  name: 'ops',
  host: process.env.DB_OPS_HOST || 'localhost',
  port: parseInt(process.env.DB_OPS_PORT || '3306', 10),
  username: process.env.DB_OPS_USER || 'root',
  password: process.env.DB_OPS_PASS || 'root',
  database: process.env.DB_OPS_NAME || 'db_ops',
  synchronize: false,
  migrations: ['dist/migrations/ops/*.js'],
  entities: [], // ops uses raw SQL migrations and no entities for now
});

export default dataDataSource;
