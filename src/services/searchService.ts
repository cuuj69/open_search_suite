import client, { ITEMS_INDEX } from '../config/opensearch';
import { Item, SearchFilters, SearchResult } from '../types/item';

export class SearchService {
  async indexItem(item: Item): Promise<void> {
    await client.index({
      index: ITEMS_INDEX,
      id: item.id,
      body: item,
      refresh: true  // Force a refresh after indexing
    });
  }

  async searchItems(query: string, filters: SearchFilters = {}, page: number = 1, size: number = 20): Promise<SearchResult> {
    const from = (page - 1) * size;
    
    const must: any[] = [];
    
    // Add text search if query exists
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['title^3', 'description', 'brand'],
          fuzziness: 'AUTO'
        }
      });
    }

    // Add filters
    if (filters.brand) {
      must.push({ term: { 'brand.keyword': filters.brand } });
    }
    if (filters.color) {
      must.push({ term: { color: filters.color } });
    }
    if (filters.size) {
      must.push({ term: { size: filters.size } });
    }
    if (filters.category) {
      must.push({ term: { category_id: filters.category } });
    }
    if (filters.condition) {
      must.push({ term: { condition: filters.condition } });
    }
    if (filters.minPrice || filters.maxPrice) {
      const range: any = { price: {} };
      if (filters.minPrice) range.price.gte = filters.minPrice;
      if (filters.maxPrice) range.price.lte = filters.maxPrice;
      must.push({ range });
    }

    const response = await client.search({
      index: ITEMS_INDEX,
      body: {
        from,
        size,
        query: {
          bool: {
            must,
            should: [
              { term: { is_boosted: true } }
            ],
            minimum_should_match: 0
          }
        },
        sort: [
          { _score: 'desc' },
          { popularity_score: 'desc' }
        ]
      }
    });

    return {
      items: response.body.hits.hits.map((hit: any) => hit._source),
      total: response.body.hits.total.value,
      took: response.body.took
    };
  }

  async getSuggestions(query: string): Promise<string[]> {
    const response = await client.search({
      index: ITEMS_INDEX,
      body: {
        suggest: {
          title_suggest: {
            prefix: query,
            completion: {
              field: 'title.suggest',
              size: 5,
              skip_duplicates: true
            }
          }
        }
      }
    });

    return response.body.suggest.title_suggest[0].options.map((option: any) => option.text);
  }

  async getRecommendations(userId: string, size: number = 10): Promise<Item[]> {
    // Get user's interaction history
    const userInteractions = await this.getUserInteractions(userId);
    
    // Build recommendation query based on user's preferences
    const response = await client.search({
      index: ITEMS_INDEX,
      body: {
        size,
        query: {
          bool: {
            should: [
              // Boost items from brands the user has interacted with
              {
                terms: {
                  'brand.keyword': userInteractions.brands,
                  boost: 2
                }
              },
              // Boost items in categories the user has interacted with
              {
                terms: {
                  category_id: userInteractions.categories,
                  boost: 1.5
                }
              },
              // Boost items with similar colors
              {
                terms: {
                  color: userInteractions.colors,
                  boost: 1.2
                }
              }
            ],
            minimum_should_match: 1
          }
        },
        sort: [
          { popularity_score: 'desc' },
          { views: 'desc' }
        ]
      }
    });

    return response.body.hits.hits.map((hit: any) => hit._source);
  }

  private async getUserInteractions(userId: string) {
    // This would typically come from a separate user interactions index
    // For now, we'll return some mock data
    return {
      brands: ['Nike', 'Adidas'],
      categories: ['shoes', 'clothing'],
      colors: ['black', 'white']
    };
  }
} 