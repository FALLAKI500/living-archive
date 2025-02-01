export type PropertyStatus = "Available" | "Rented"
export type PricingType = "daily" | "monthly"

export interface Property {
  id: string
  name: string
  address: string
  city?: string
  daily_rate: number
  monthly_rate?: number
  status: PropertyStatus
  image_url?: string
  created_at: string
  updated_at: string
  user_id: string
  pricing_type?: PricingType
  num_bedrooms?: number
}

export type CreatePropertyInput = Omit<Property, "id" | "created_at" | "updated_at">