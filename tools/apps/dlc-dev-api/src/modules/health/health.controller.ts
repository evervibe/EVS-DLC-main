import { Controller, Get } from '@nestjs/common';
import { dbPools } from '../../common/db';
import { RedisService } from '../../core/redis/redis.service';
import { AuthService } from '../auth/auth.service';
import { MetricsService } from './metrics.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
    private readonly metricsService: MetricsService,
  ) {}

  @Get()
  async getStatus() {
    const dbStatus = {
      auth: false,
      game: false,
      data: false,
      post: false,
      ops: false,
    };

    // Test each database connection
    for (const [name, pool] of Object.entries(dbPools)) {
      try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        dbStatus[name as keyof typeof dbStatus] = true;
      } catch (error) {
        console.error(`Health check failed for ${name} database:`, error.message);
      }
    }

    const allDbsHealthy = Object.values(dbStatus).every(status => status);
    
    // Get cache status
    const cacheStatus = {
      connected: this.redisService.isConnected(),
      keys: await this.redisService.count(),
    };

    // JWT service status (optional check)
    const authStatus = {
      jwtConfigured: true, // JWT service is available if we got here
    };

    return {
      status: allDbsHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.2.3-alpha',
      rateLimit: 'active',
      databases: dbStatus,
      cache: cacheStatus,
      auth: authStatus,
    };
  }

  @Get('ready')
  getReadiness() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  async getMetrics() {
    return this.metricsService.getMetrics();
  }
}
