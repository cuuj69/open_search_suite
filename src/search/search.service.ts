import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OpenSearchService, SearchDocument, SearchQuery } from '../opensearch/opensearch.service';
import {
  CreateSearchDocumentInput,
  UpdateSearchDocumentInput,
  SearchQueryInput,
  SearchResult,
} from './dto/search-document.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly openSearchService: OpenSearchService) {}

  async createDocument(input: CreateSearchDocumentInput): Promise<SearchDocument> {
    this.logger.log(`Creating document with title: ${input.title}`);

    const documentId = await this.openSearchService.indexDocument({
      title: input.title,
      content: input.content,
      category: input.category,
      tags: input.tags,
      price: input.price,
      rating: input.rating,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdDocument = await this.openSearchService.getDocument(documentId);
    if (!createdDocument) {
      throw new Error('Failed to retrieve created document');
    }

    return createdDocument;
  }

  async updateDocument(id: string, input: UpdateSearchDocumentInput): Promise<SearchDocument> {
    this.logger.log(`Updating document with ID: ${id}`);

    const existingDocument = await this.openSearchService.getDocument(id);
    if (!existingDocument) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    await this.openSearchService.updateDocument(id, input);

    const updatedDocument = await this.openSearchService.getDocument(id);
    if (!updatedDocument) {
      throw new Error('Failed to retrieve updated document');
    }

    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<void> {
    this.logger.log(`Deleting document with ID: ${id}`);

    const existingDocument = await this.openSearchService.getDocument(id);
    if (!existingDocument) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    await this.openSearchService.deleteDocument(id);
  }

  async getDocument(id: string): Promise<SearchDocument | null> {
    this.logger.log(`Getting document with ID: ${id}`);
    return this.openSearchService.getDocument(id);
  }

  async searchDocuments(input: SearchQueryInput): Promise<SearchResult> {
    this.logger.log(`Searching documents with query: ${input.query}`);

    const searchQuery: SearchQuery = {
      query: input.query,
      category: input.category,
      tags: input.tags,
      minPrice: input.minPrice,
      maxPrice: input.maxPrice,
      minRating: input.minRating,
      from: input.from,
      size: input.size,
    };

    const result = await this.openSearchService.searchDocuments(searchQuery);
    return {
      documents: result.documents,
      total: result.total,
      took: result.took,
    };
  }

  async getCategories(): Promise<string[]> {
    this.logger.log('Getting all categories');
    
    try {
      // This is a simplified implementation
      // In a production environment, you might want to use aggregations
      const result = await this.openSearchService.searchDocuments({
        query: '*',
        size: 1000,
      });

      const categories = new Set<string>();
      result.documents.forEach(doc => {
        if (doc.category) {
          categories.add(doc.category);
        }
      });

      return Array.from(categories).sort();
    } catch (error) {
      this.logger.error(`Error getting categories: ${error.message}`);
      return [];
    }
  }

  async getTags(): Promise<string[]> {
    this.logger.log('Getting all tags');
    
    try {
      // This is a simplified implementation
      // In a production environment, you might want to use aggregations
      const result = await this.openSearchService.searchDocuments({
        query: '*',
        size: 1000,
      });

      const tags = new Set<string>();
      result.documents.forEach(doc => {
        if (doc.tags) {
          doc.tags.forEach(tag => tags.add(tag));
        }
      });

      return Array.from(tags).sort();
    } catch (error) {
      this.logger.error(`Error getting tags: ${error.message}`);
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    return this.openSearchService.getHealth();
  }

  async bulkIndexDocuments(documents: CreateSearchDocumentInput[]): Promise<string[]> {
    this.logger.log(`Bulk indexing ${documents.length} documents`);

    const documentIds: string[] = [];
    
    for (const document of documents) {
      try {
        const createdDocument = await this.createDocument(document);
        documentIds.push(createdDocument.id);
      } catch (error) {
        this.logger.error(`Failed to index document: ${error.message}`);
        throw error;
      }
    }

    this.logger.log(`Successfully indexed ${documentIds.length} documents`);
    return documentIds;
  }

  async searchByCategory(category: string, limit: number = 10): Promise<SearchDocument[]> {
    this.logger.log(`Searching documents by category: ${category}`);

    const result = await this.openSearchService.searchDocuments({
      query: '*',
      category,
      size: limit,
    });

    return result.documents;
  }

  async searchByTags(tags: string[], limit: number = 10): Promise<SearchDocument[]> {
    this.logger.log(`Searching documents by tags: ${tags.join(', ')}`);

    const result = await this.openSearchService.searchDocuments({
      query: '*',
      tags,
      size: limit,
    });

    return result.documents;
  }

  async getRecommendations(documentId: string, limit: number = 5): Promise<SearchDocument[]> {
    this.logger.log(`Getting recommendations for document: ${documentId}`);

    const document = await this.getDocument(documentId);
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Simple recommendation based on category and tags
    const result = await this.openSearchService.searchDocuments({
      query: document.title,
      category: document.category,
      tags: document.tags,
      size: limit + 1, // +1 to exclude the original document
    });

    // Filter out the original document
    return result.documents.filter(doc => doc.id !== documentId).slice(0, limit);
  }
} 