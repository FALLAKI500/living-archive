export interface CustomerData {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  company_name: string | null;
  total_bookings: number;
  total_spent: number;
  last_booking_date: string | null;
  customer_status: string;
}