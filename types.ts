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
  imageUrl: string;
  roomTypes: string[];
}

export type RoomTypeFilter = 'beach' | 'water';

export interface Filters {
  searchTerm: string;
  transportation: TransportationType[];
  maxPrice: number;
  roomTypes: RoomTypeFilter[];
  minRestaurants: number;
  minBars: number;
  hasPrivatePool: boolean;
}

export type SortOption =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'snorkeling-desc'
  | 'travelTime-asc';