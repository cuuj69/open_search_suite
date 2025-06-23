import { createItemsIndex } from './config/opensearch';
import { SearchService } from './services/searchService';
import { Item } from './types/item';

async function main() {
  try {
    // Create the index
    console.log('Creating index...');
    await createItemsIndex();
    console.log('Index created successfully!');

    const searchService = new SearchService();

    // Create some sample items
    const sampleItems: Item[] = [
      {
        id: '1',
        brand_id: 'nike1',
        title: 'Nike Air Max 270',
        brand: 'Nike',
        category_id: 'shoes',
        condition: 'new',
        size: '42',
        price: 150,
        discount: 0,
        bp_fee: 10,
        shipping_price_from: 5,
        description: 'Classic Nike Air Max 270 in black color',
        material: 'mesh',
        color: 'black',
        created_at: new Date().toISOString(),
        changed_at: new Date().toISOString(),
        thumbnail_url: 'https://example.com/nike-air-max.jpg',
        video_default: '',
        is_boosted: true,
        status: 'active',
        seller_id: 'seller1',
        popularity_score: 0.8,
        feed_key: 'nike-air-max-270',
        views: 100,
        clicks: 50,
        likes: 30,
        saves: 20,
        last_interaction: new Date().toISOString()
      },
      {
        id: '2',
        brand_id: 'adidas1',
        title: 'Adidas Ultraboost 22',
        brand: 'Adidas',
        category_id: 'shoes',
        condition: 'new',
        size: '43',
        price: 180,
        discount: 20,
        bp_fee: 10,
        shipping_price_from: 5,
        description: 'Adidas Ultraboost 22 in white color',
        material: 'primeknit',
        color: 'white',
        created_at: new Date().toISOString(),
        changed_at: new Date().toISOString(),
        thumbnail_url: 'https://example.com/adidas-ultraboost.jpg',
        video_default: '',
        is_boosted: false,
        status: 'active',
        seller_id: 'seller2',
        popularity_score: 0.7,
        feed_key: 'adidas-ultraboost-22',
        views: 80,
        clicks: 40,
        likes: 25,
        saves: 15,
        last_interaction: new Date().toISOString()
      }
    ];

    // Index the sample items
    console.log('\nIndexing sample items...');
    for (const item of sampleItems) {
      await searchService.indexItem(item);
    }
    console.log('Items indexed successfully!');

    // Test search functionality
    console.log('\nTesting search functionality...');
    const searchResults = await searchService.searchItems('nike', {
      brand: 'Nike',
      minPrice: 100,
      maxPrice: 200
    });
    console.log('Search results:', JSON.stringify(searchResults, null, 2));

    // Test suggestions
    console.log('\nTesting suggestions...');
    const suggestions = await searchService.getSuggestions('nik');
    console.log('Suggestions:', suggestions);

    // Test recommendations
    console.log('\nTesting recommendations...');
    const recommendations = await searchService.getRecommendations('user123');
    console.log('Recommendations:', JSON.stringify(recommendations, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 