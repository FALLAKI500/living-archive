export type ExpenseCategory = "maintenance" | "utilities" | "insurance" | "taxes" | "mortgage" | "other"

export interface Expense {
  id?: string
  property_id?: string
  user_id?: string
  amount: number
  category: ExpenseCategory
  description?: string
  date: string
  created_at?: string
  updated_at?: string
  payment_method?: string
}