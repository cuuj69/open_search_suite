import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import {
  SearchDocument,
  SearchResult,
  SearchDocumentResponse,
  CreateSearchDocumentInput,
  UpdateSearchDocumentInput,
  SearchQueryInput,
} from './dto/search-document.dto';

@Resolver(() => SearchDocument)
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  @Mutation(() => SearchDocumentResponse)
  async createSearchDocument(
    @Args('input') input: CreateSearchDocumentInput,
  ): Promise<SearchDocumentResponse> {
    try {
      const document = await this.searchService.createDocument(input);
      return {
        success: true,
        message: 'Document created successfully',
        document,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create document: ${error.message}`,
      };
    }
  }

  @Mutation(() => SearchDocumentResponse)
  async updateSearchDocument(
    @Args('id') id: string,
    @Args('input') input: UpdateSearchDocumentInput,
  ): Promise<SearchDocumentResponse> {
    try {
      const document = await this.searchService.updateDocument(id, input);
      return {
        success: true,
        message: 'Document updated successfully',
        document,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update document: ${error.message}`,
      };
    }
  }

  @Mutation(() => SearchDocumentResponse)
  async deleteSearchDocument(@Args('id') id: string): Promise<SearchDocumentResponse> {
    try {
      await this.searchService.deleteDocument(id);
      return {
        success: true,
        message: 'Document deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete document: ${error.message}`,
      };
    }
  }

  @Query(() => SearchDocument, { nullable: true })
  async getSearchDocument(@Args('id') id: string): Promise<SearchDocument | null> {
    return this.searchService.getDocument(id);
  }

  @Query(() => SearchResult)
  async searchDocuments(@Args('input') input: SearchQueryInput): Promise<SearchResult> {
    return this.searchService.searchDocuments(input);
  }

  @Query(() => [String])
  async getCategories(): Promise<string[]> {
    return this.searchService.getCategories();
  }

  @Query(() => [String])
  async getTags(): Promise<string[]> {
    return this.searchService.getTags();
  }

  @Query(() => Boolean)
  async healthCheck(): Promise<boolean> {
    return this.searchService.healthCheck();
  }

  @ResolveField(() => String)
  async formattedPrice(@Parent() document: SearchDocument): Promise<string> {
    if (document.price === undefined || document.price === null) {
      return 'N/A';
    }
    return `$${document.price.toFixed(2)}`;
  }

  @ResolveField(() => String)
  async formattedRating(@Parent() document: SearchDocument): Promise<string> {
    if (document.rating === undefined || document.rating === null) {
      return 'No rating';
    }
    return `${document.rating.toFixed(1)}/5.0`;
  }

  @ResolveField(() => String)
  async excerpt(@Parent() document: SearchDocument): Promise<string> {
    const maxLength = 150;
    if (document.content.length <= maxLength) {
      return document.content;
    }
    return document.content.substring(0, maxLength) + '...';
  }
} 