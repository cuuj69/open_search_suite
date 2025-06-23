import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';
import { OpenSearchService } from '../opensearch/opensearch.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private readonly openSearchService: OpenSearchService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.opensearchHealth(),
    ]);
  }

  private async opensearchHealth(): Promise<HealthIndicatorResult> {
    const isHealthy = await this.openSearchService.getHealth();
    
    return {
      opensearch: {
        status: isHealthy ? 'up' : 'down',
        message: isHealthy ? 'OpenSearch is healthy' : 'OpenSearch is not responding',
      },
    };
  }
} 