import { Injectable } from '@nestjs/common';
import { dbPools } from '../../common/db';
import { RedisService } from '../../core/redis/redis.service';

@Injectable()
export class MetricsService {
  constructor(private readonly redisService: RedisService) {}

  async getMetrics() {
    const dbMetrics = {
      auth: await this.getDatabaseMetrics('auth'),
      game: await this.getDatabaseMetrics('game'),
      data: await this.getDatabaseMetrics('data'),
      post: await this.getDatabaseMetrics('post'),
    };

    const cacheMetrics = {
      connected: this.redisService.isConnected(),
      keyCount: await this.redisService.count(),
    };

    const systemMetrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    };

    return {
      timestamp: new Date().toISOString(),
      version: '1.1.0-alpha',
      databases: dbMetrics,
      cache: cacheMetrics,
      system: systemMetrics,
    };
  }

  private async getDatabaseMetrics(name: string) {
    const pool = dbPools[name];
    if (!pool) {
      return { status: 'not_configured', active: 0, idle: 0, total: 0 };
    }

    try {
      const connection = await pool.getConnection();
      const stats = pool.pool.config;
      connection.release();

      return {
        status: 'healthy',
        active: pool.pool._allConnections.length - pool.pool._freeConnections.length,
        idle: pool.pool._freeConnections.length,
        total: pool.pool._allConnections.length,
        connectionLimit: stats.connectionLimit,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
