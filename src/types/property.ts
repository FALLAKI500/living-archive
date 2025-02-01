export type PropertyStatus = 'Available' | 'Rented';
export type PricingType = 'daily' | 'monthly';

export interface Property {
  id: string;
  name: string;
  location: string;
  daily_rate: number;
  monthly_rate?: number;
  pricing_type: PricingType;
  status: PropertyStatus;
  image_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreatePropertyInput {
  name: string;
  location: string;
  daily_rate: number;
  monthly_rate?: number;
  pricing_type: PricingType;
  status: PropertyStatus;
  image_url?: string;
}