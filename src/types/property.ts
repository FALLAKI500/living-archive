export type PropertyStatus = "Available" | "Rented"
export type PricingType = "daily" | "monthly" | null

export interface Property {
  id: string
  name: string
  address: string
  city?: string | null
  daily_rate: number
  monthly_rate?: number | null
  status: PropertyStatus
  image_url?: string | null
  created_at: string
  updated_at: string
  user_id: string
  pricing_type?: PricingType
  num_bedrooms?: number | null
}

export type CreatePropertyInput = Omit<Property, "id" | "created_at" | "updated_at">