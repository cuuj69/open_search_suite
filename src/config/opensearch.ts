import { Client } from '@opensearch-project/opensearch';
import { Item } from '../types/item';

const client = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'admin',
    password: '1234'
  }
});

export const ITEMS_INDEX = 'items';

export const createItemsIndex = async () => {
  const indexExists = await client.indices.exists({ index: ITEMS_INDEX });
  
  if (!indexExists.body) {
    await client.indices.create({
      index: ITEMS_INDEX,
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            brand_id: { type: 'keyword' },
            title: { 
              type: 'text',
              fields: {
                keyword: { type: 'keyword' },
                suggest: { type: 'completion' }
              }
            },
            brand: { 
              type: 'text',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            category_id: { type: 'keyword' },
            condition: { type: 'keyword' },
            size: { type: 'keyword' },
            price: { type: 'float' },
            discount: { type: 'float' },
            bp_fee: { type: 'float' },
            shipping_price_from: { type: 'float' },
            description: { type: 'text' },
            material: { type: 'keyword' },
            color: { type: 'keyword' },
            created_at: { type: 'date' },
            changed_at: { type: 'date' },
            thumbnail_url: { type: 'keyword' },
            video_default: { type: 'keyword' },
            is_boosted: { type: 'boolean' },
            status: { type: 'keyword' },
            seller_id: { type: 'keyword' },
            popularity_score: { type: 'float' },
            feed_key: { type: 'keyword' },
            views: { type: 'integer' },
            clicks: { type: 'integer' },
            likes: { type: 'integer' },
            saves: { type: 'integer' },
            last_interaction: { type: 'date' }
          }
        },
        settings: {
          analysis: {
            analyzer: {
              text_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'stop', 'snowball']
              }
            }
          }
        }
      }
    });
  }
};

export default client; 