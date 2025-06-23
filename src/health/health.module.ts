import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { OpenSearchModule } from '../opensearch/opensearch.module';

@Module({
  imports: [TerminusModule, OpenSearchModule],
  controllers: [HealthController],
})
export class HealthModule {} 