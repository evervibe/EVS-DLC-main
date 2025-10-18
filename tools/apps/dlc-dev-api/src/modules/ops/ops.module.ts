import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpsController } from './ops.controller';
import { RedisModule } from '../../core/redis/redis.module';

@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forRoot({
      name: 'ops',
      type: 'mysql',
      host: process.env.DB_OPS_HOST || 'localhost',
      port: parseInt(process.env.DB_OPS_PORT || '3306', 10),
      username: process.env.DB_OPS_USER || 'root',
      password: process.env.DB_OPS_PASS || 'root',
      database: process.env.DB_OPS_NAME || 'db_ops',
      autoLoadEntities: false,
      synchronize: false,
      retryAttempts: 3,
      retryDelay: 3000,
    }),
  ],
  controllers: [OpsController],
})
export class OpsModule {}
