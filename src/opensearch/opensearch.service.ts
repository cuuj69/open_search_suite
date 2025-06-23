import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

export interface SearchDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  price?: number;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchQuery {
  query: string;
  category?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  from?: number;
  size?: number;
}

@Injectable()
export class OpenSearchService implements OnModuleInit {
  private readonly logger = new Logger(OpenSearchService.name);
  private client: Client;
  private readonly indexName = 'products';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeClient();
    await this.createIndexIfNotExists();
  }

  private async initializeClient() {
    const opensearchUrl = this.configService.get<string>('OPENSEARCH_URL', 'http://localhost:9200');
    const username = this.configService.get<string>('OPENSEARCH_USERNAME', 'admin');
    const password = this.configService.get<string>('OPENSEARCH_PASSWORD', 'admin');

    this.client = new Client({
      node: opensearchUrl,
      auth: { username, password },
      ssl: {
        rejectUnauthorized: false, // For development only
      },
    });

    this.logger.log(`OpenSearch client initialized for: ${opensearchUrl}`);
  }

  private async createIndexIfNotExists() {
    try {
      const indexExists = await this.client.indices.exists({
        index: this.indexName,
      });

      if (!indexExists.body) {
        await this.client.indices.create({
          index: this.indexName,
          body: {
            mappings: {
              properties: {
                title: {
                  type: 'text',
                  analyzer: 'english',
                  fields: {
                    keyword: {
                      type: 'keyword',
                    },
                  },
                },
                content: {
                  type: 'text',
                  analyzer: 'english',
                },
                category: {
                  type: 'keyword',
                },
                tags: {
                  type: 'keyword',
                },
                price: {
                  type: 'float',
                },
                rating: {
                  type: 'float',
                },
                createdAt: {
                  type: 'date',
                },
                updatedAt: {
                  type: 'date',
                },
              },
            },
            settings: {
              analysis: {
                analyzer: {
                  english: {
                    type: 'english',
                  },
                },
              },
            },
          },
        });

        this.logger.log(`Index '${this.indexName}' created successfully`);
      } else {
        this.logger.log(`Index '${this.indexName}' already exists`);
      }
    } catch (error) {
      this.logger.error(`Error creating index: ${error.message}`);
      throw error;
    }
  }

  async indexDocument(document: Omit<SearchDocument, 'id'>): Promise<string> {
    try {
      const response = await this.client.index({
        index: this.indexName,
        body: {
          ...document,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Document indexed with ID: ${response.body._id}`);
      return response.body._id;
    } catch (error) {
      this.logger.error(`Error indexing document: ${error.message}`);
      throw error;
    }
  }

  async updateDocument(id: string, document: Partial<SearchDocument>): Promise<void> {
    try {
      await this.client.update({
        index: this.indexName,
        id,
        body: {
          doc: {
            ...document,
            updatedAt: new Date(),
          },
        },
      });

      this.logger.log(`Document ${id} updated successfully`);
    } catch (error) {
      this.logger.error(`Error updating document: ${error.message}`);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      await this.client.delete({
        index: this.indexName,
        id,
      });

      this.logger.log(`Document ${id} deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting document: ${error.message}`);
      throw error;
    }
  }

  async getDocument(id: string): Promise<SearchDocument | null> {
    try {
      const response = await this.client.get({
        index: this.indexName,
        id,
      });

      return {
        id: response.body._id,
        ...response.body._source,
      } as SearchDocument;
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      }
      this.logger.error(`Error getting document: ${error.message}`);
      throw error;
    }
  }

  async searchDocuments(query: SearchQuery): Promise<{
    documents: SearchDocument[];
    total: number;
    took: number;
  }> {
    try {
      const searchBody: any = {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: query.query,
                  fields: ['title^2', 'content'],
                  fuzziness: 'AUTO',
                },
              },
            ],
            filter: [],
          },
        },
        sort: [
          { _score: { order: 'desc' } },
          { createdAt: { order: 'desc' } },
        ],
        from: query.from || 0,
        size: query.size || 10,
      };

      // Add filters
      if (query.category) {
        searchBody.query.bool.filter.push({
          term: { category: query.category },
        });
      }

      if (query.tags && query.tags.length > 0) {
        searchBody.query.bool.filter.push({
          terms: { tags: query.tags },
        });
      }

      if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        const rangeFilter: any = { price: {} };
        if (query.minPrice !== undefined) rangeFilter.price.gte = query.minPrice;
        if (query.maxPrice !== undefined) rangeFilter.price.lte = query.maxPrice;
        searchBody.query.bool.filter.push({ range: rangeFilter });
      }

      if (query.minRating !== undefined) {
        searchBody.query.bool.filter.push({
          range: { rating: { gte: query.minRating } },
        });
      }

      const response = await this.client.search({
        index: this.indexName,
        body: searchBody,
      });

      const documents = response.body.hits.hits.map((hit) => ({
        id: hit._id,
        ...hit._source,
      }));

      return {
        documents,
        total: response.body.hits.total.value,
        took: response.body.took,
      };
    } catch (error) {
      this.logger.error(`Error searching documents: ${error.message}`);
      throw error;
    }
  }

  async getHealth(): Promise<boolean> {
    try {
      await this.client.cluster.health();
      return true;
    } catch (error) {
      this.logger.error(`OpenSearch health check failed: ${error.message}`);
      return false;
    }
  }
} 