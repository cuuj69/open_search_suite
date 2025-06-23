export interface Item {
  id: string;
  brand_id: string;
  title: string;
  brand: string;
  category_id: string;
  condition: string;
  size: string;
  price: number;
  discount: number;
  bp_fee: number;
  shipping_price_from: number;
  description: string;
  material: string;
  color: string;
  created_at: string;
  changed_at: string;
  thumbnail_url: string;
  video_default: string;
  is_boosted: boolean;
  status: string;
  seller_id: string;
  popularity_score: number;
  feed_key: string;
  
  // Additional fields for tracking user interactions
  views: number;
  clicks: number;
  likes: number;
  saves: number;
  last_interaction: string;
}

export interface SearchFilters {
  brand?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  condition?: string;
}

export interface SearchResult {
  items: Item[];
  total: number;
  took: number;
} 