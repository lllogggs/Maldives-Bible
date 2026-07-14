export enum TransportationType {
  Seaplane = '수상비행기',
  Boat = '보트',
  Domestic = '국내선',
}

export interface Resort {
  id: number;
  name: string;
  name_en: string;
  brand: string;
  openYear: number;
  renovationYear?: number;
  transportation: TransportationType;
  travelTime: number; // in minutes
  travelCost: number; // per person, round trip, USD
  price: number; // 4 nights, 2 adults, USD, all-inclusive
  rating: number; // out of 5
  snorkelingQuality: number; // out of 5
  location: string;
  spaBrand: string;
  restaurants: number;
  bars: number;
  pools: number;
  hasWaterVilla: boolean;
  hasBeachVilla: boolean;
  hasPrivatePool: boolean;
  hasFamilyRoom: boolean;
  hasKidsClub: boolean;
  honeymoonPerks: boolean;
  imageUrls: string[];
  imageSourceNote?: string;
  imageSourceProvider?: string;
  imageSourceUrl?: string;
  imageCredits?: ImageCredit[];
  roomTypes: string[];
  homepageUrl: string;
  reviewSummary?: ResortReviewSummary;
}

export interface ResortReviewPoint {
  text: string;
  /** Number of independent review sources that mention this point. */
  mentions?: number;
}

export interface ResortReviewSource {
  title: string;
  url: string;
  blogName?: string;
  publishedAt?: string;
}

export interface ResortReviewSummary {
  pros: ResortReviewPoint[];
  cons: ResortReviewPoint[];
  /** Number of verified firsthand review links available to the user. */
  sourceCount: number;
  /** ISO date for the latest review/curation pass. */
  reviewedAt: string;
  basis: 'naver-blog-search-snippets' | 'manual-curation';
  /** sufficient = repeated by 2+ independent sources; limited = one clear firsthand source. */
  evidenceStatus: 'sufficient' | 'limited' | 'insufficient';
  sources?: ResortReviewSource[];
}

export interface ImageCredit {
  provider?: string;
  sourceUrl: string;
  creator?: string;
  license?: string;
}

export type RoomTypeFilter = 'beach' | 'water';

export interface Filters {
  searchTerm: string;
  transportation: TransportationType[];
  minPrice: number;
  maxPrice: number;
  roomTypes: RoomTypeFilter[];
  minRestaurants: number;
  hasPrivatePool: boolean;
  onlyLiked: boolean;
}

export type SortOption =
  | 'custom'
  | 'popularity'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'snorkeling-desc'
  | 'travelTime-asc'
  | 'likes-desc';
