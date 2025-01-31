export type PropertyStatus = 'Available' | 'Rented';

export interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  status: PropertyStatus;
  image_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreatePropertyInput {
  name: string;
  location: string;
  price: number;
  status: PropertyStatus;
  image_url?: string;
}