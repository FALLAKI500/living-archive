import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

interface CustomerSpendingChartProps {
  customerId: string
}

export default function CustomerSpendingChart({ customerId }: CustomerSpendingChartProps) {
  const { data: spendingData } = useQuery({
    queryKey: ["customer-spending", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('amount, created_at')
        .eq('tenant_id', customerId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return data.map(invoice => ({
        date: format(new Date(invoice.created_at), 'MMM yyyy'),
        amount: Number(invoice.amount)
      }))
    }
  })

  if (!spendingData?.length) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">No spending data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={spendingData}>
        <XAxis 
          dataKey="date" 
          stroke="#888888"
          fontSize={12}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickFormatter={(value) => `${value} MAD`}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toLocaleString()} MAD`, "Amount"]}
        />
        <Bar dataKey="amount" fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  )
}