import { Layout } from "@/components/Layout"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ExportDialog } from "@/components/ExportDialog"
import { CustomerCard } from "@/components/CustomerCard"

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const { data: customerStats, isLoading } = useQuery({
    queryKey: ["customer-statistics"],
    queryFn: async () => {
      const { data: stats, error: statsError } = await supabase
        .rpc('get_customer_statistics')

      if (statsError) throw statsError

      // Fetch upcoming bookings for each customer
      const customersWithBookings = await Promise.all(
        stats.map(async (customer) => {
          const { data: bookings, error: bookingsError } = await supabase
            .from('invoices')
            .select('id, start_date')
            .eq('tenant_id', customer.id)
            .gte('start_date', new Date().toISOString())
            .order('start_date', { ascending: true })
            .limit(5)

          if (bookingsError) throw bookingsError

          return {
            ...customer,
            upcomingBookings: bookings || []
          }
        })
      )

      return customersWithBookings
    }
  })

  const filteredCustomers = customerStats?.filter(customer => {
    const searchLower = searchQuery.toLowerCase()
    return (
      !searchQuery ||
      customer.full_name?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower) ||
      customer.city?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Input
            placeholder="Search by name, phone, or city..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ExportDialog data={filteredCustomers || []} />
        </div>

        {isLoading ? (
          <p>Loading customer statistics...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers?.map((customer) => (
              <CustomerCard
                key={customer.id}
                id={customer.id}
                fullName={customer.full_name || "Unnamed Customer"}
                phone={customer.phone}
                city={customer.city}
                companyName={customer.company_name}
                totalBookings={Number(customer.total_bookings)}
                totalSpent={Number(customer.total_spent)}
                lastBookingDate={customer.last_booking_date}
                notes={customer.notes}
                upcomingBookings={customer.upcomingBookings}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}