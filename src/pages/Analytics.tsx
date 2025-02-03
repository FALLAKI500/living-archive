import { Layout } from "@/components/Layout"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Analytics() {
  const { data: monthlyRevenue, isLoading } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_revenue_summary")
        .select("*")
        .order("month", { ascending: true })

      if (error) throw error
      return data
    },
  })

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            View your property management analytics
          </p>
        </div>

        {isLoading ? (
          <p>Loading analytics...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <pre>{JSON.stringify(monthlyRevenue, null, 2)}</pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}