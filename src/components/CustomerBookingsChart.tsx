import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

interface CustomerBookingsChartProps {
  customerId: string
}

export default function CustomerBookingsChart({ customerId }: CustomerBookingsChartProps) {
  const { data: bookingData } = useQuery({
    queryKey: ["customer-bookings", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('created_at')
        .eq('tenant_id', customerId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group bookings by month
      const bookingsByMonth = data.reduce((acc: Record<string, number>, invoice) => {
        const monthKey = format(new Date(invoice.created_at), 'MMM yyyy')
        acc[monthKey] = (acc[monthKey] || 0) + 1
        return acc
      }, {})

      return Object.entries(bookingsByMonth).map(([date, count]) => ({
        date,
        bookings: count
      }))
    }
  })

  if (!bookingData?.length) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">No booking data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={bookingData}>
        <XAxis 
          dataKey="date" 
          stroke="#888888"
          fontSize={12}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
        />
        <Tooltip 
          formatter={(value: number) => [`${value} bookings`, "Bookings"]}
        />
        <Line 
          type="monotone" 
          dataKey="bookings" 
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}