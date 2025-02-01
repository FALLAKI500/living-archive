export type PropertyStatus = "Available" | "Rented"
export type PricingType = "daily" | "monthly"

export interface Property {
  id: string
  name: string
  address: string
  daily_rate: number
  status: PropertyStatus
  image_url?: string | null
  city?: string | null
  monthly_rate?: number | null
  created_at: string
  updated_at: string
  user_id: string
  pricing_type: PricingType | null
  num_bedrooms?: number | null
}