export type InvoiceStatus = "pending" | "paid" | "overdue" | "cancelled"

export interface Invoice {
  id: string
  property_id: string
  tenant_id: string
  amount: number
  amount_paid: number
  due_date: string
  status: InvoiceStatus
  description: string | null
  created_at?: string
  updated_at: string
  daily_rate: number
  days_rented: number
  start_date?: string | null
  end_date?: string | null
  properties: {
    name: string
  }
}