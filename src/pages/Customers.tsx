import { Layout } from "@/components/Layout"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ExportDialog } from "@/components/ExportDialog"

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const { data: customerStats, isLoading } = useQuery({
    queryKey: ["customer-statistics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_customer_statistics')

      if (error) throw error
      return data
    },
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
          <ExportDialog customers={filteredCustomers || []} />
        </div>

        {isLoading ? (
          <p>Loading customer statistics...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers?.map((stat) => (
              <Card key={stat.id}>
                <CardHeader>
                  <CardTitle>{stat.full_name || "Unnamed Customer"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {stat.company_name && `Company: ${stat.company_name}`}
                  </p>
                  {stat.phone && (
                    <p className="text-sm text-muted-foreground">
                      Phone: {stat.phone}
                    </p>
                  )}
                  {stat.city && (
                    <p className="text-sm text-muted-foreground">
                      City: {stat.city}
                    </p>
                  )}
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium">
                      Total Bookings: {stat.total_bookings}
                    </p>
                    <p className="text-sm font-medium">
                      Total Spent: {Number(stat.total_spent).toLocaleString()} MAD
                    </p>
                    {stat.last_booking_date && (
                      <p className="text-sm text-muted-foreground">
                        Last Booking: {new Date(stat.last_booking_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}