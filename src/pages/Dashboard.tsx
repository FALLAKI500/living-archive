import { useQuery } from "@tanstack/react-query"
import { Layout } from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlyRevenueTrend } from "@/components/MonthlyRevenueTrend"
import { PaymentBreakdownChart } from "@/components/PaymentBreakdownChart"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { Building, Calendar, DollarSign, Users } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const today = new Date()
  const startDate = startOfMonth(today)
  const endDate = endOfMonth(today)

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [
        { data: properties },
        { data: bookings },
        { data: revenue },
        { data: checkIns }
      ] = await Promise.all([
        supabase.from("properties").select("status").eq("status", "Available"),
        supabase.from("invoices").select("*"),
        supabase.from("monthly_revenue_summary").select("*").single(),
        supabase.from("invoices")
          .select(`
            id,
            start_date,
            end_date,
            tenant_id,
            properties (name),
            profiles!invoices_tenant_id_fkey (full_name)
          `)
          .or(`start_date.eq.${format(today, "yyyy-MM-dd")},end_date.eq.${format(today, "yyyy-MM-dd")}`)
      ])

      return {
        availableProperties: properties?.length || 0,
        totalBookings: bookings?.length || 0,
        monthlyRevenue: revenue?.total_revenue || 0,
        checkInsToday: checkIns?.filter(b => b.start_date === format(today, "yyyy-MM-dd")) || [],
        checkOutsToday: checkIns?.filter(b => b.end_date === format(today, "yyyy-MM-dd")) || []
      }
    }
  })

  // Fetch recent payments
  const { data: recentPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["recent-payments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select(`
          amount,
          payment_date,
          invoices (
            tenant_id,
            profiles!invoices_tenant_id_fkey (full_name)
          )
        `)
        .order("payment_date", { ascending: false })
        .limit(5)
      return data
    }
  })

  // Fetch alerts (pending payments and maintenance)
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn: async () => {
      const [{ data: pendingPayments }, { data: maintenance }] = await Promise.all([
        supabase
          .from("invoices")
          .select("*")
          .eq("status", "pending")
          .order("due_date", { ascending: true })
          .limit(5),
        supabase
          .from("expenses")
          .select("*")
          .eq("category", "maintenance")
          .order("created_at", { ascending: false })
          .limit(5)
      ])
      return { pendingPayments, maintenance }
    }
  })

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.availableProperties}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalBookings}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.monthlyRevenue.toLocaleString()} MAD
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {(stats?.checkInsToday.length || 0) + (stats?.checkOutsToday.length || 0)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <MonthlyRevenueTrend startDate={startDate} endDate={endDate} />
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <PaymentBreakdownChart />
            </CardContent>
          </Card>
        </div>

        {/* Activity and Alerts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Check-ins and Check-outs */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {statsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats?.checkInsToday.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{booking.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{booking.properties?.name}</p>
                        </div>
                        <Badge>Check-in</Badge>
                      </div>
                    ))}
                    {stats?.checkOutsToday.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{booking.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{booking.properties?.name}</p>
                        </div>
                        <Badge variant="secondary">Check-out</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {paymentsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentPayments?.map((payment, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {payment.invoices?.profiles?.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(payment.payment_date), "PPP")}
                          </p>
                        </div>
                        <p className="font-medium">{payment.amount.toLocaleString()} MAD</p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {alertsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts?.pendingPayments?.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Payment Due</p>
                        <p className="text-sm text-muted-foreground">
                          Due on {format(new Date(invoice.due_date), "PPP")}
                        </p>
                      </div>
                      <Badge variant="destructive">{invoice.amount.toLocaleString()} MAD</Badge>
                    </div>
                  ))}
                  {alerts?.maintenance?.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Maintenance Request</p>
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                      </div>
                      <Badge variant="secondary">
                        {expense.amount.toLocaleString()} MAD
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}