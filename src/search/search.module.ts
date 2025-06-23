import { Module } from '@nestjs/common';
import { SearchResolver } from './search.resolver';
import { SearchService } from './search.service';
import { OpenSearchModule } from '../opensearch/opensearch.module';

@Module({
  imports: [OpenSearchModule],
  providers: [SearchResolver, SearchService],
  exports: [SearchService],
})
export class SearchModule {} 