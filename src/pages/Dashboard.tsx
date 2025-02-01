import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertOctagon, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { PaymentBreakdownChart } from "@/components/PaymentBreakdownChart";
import { MonthlyRevenueTrend } from "@/components/MonthlyRevenueTrend";
import { RevenueDataTable } from "@/components/RevenueDataTable";

interface DashboardMetrics {
  totalPayments: number;
  pendingAmount: number;
  overdueCount: number;
  upcomingExpirations: number;
}

export default function Dashboard() {
  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const now = new Date();
      const startDate = startOfMonth(addMonths(now, -5));
      const endDate = endOfMonth(now);

      // Get total payments received
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("amount")
        .gte("payment_date", startDate.toISOString())
        .lte("payment_date", endDate.toISOString());

      if (paymentsError) throw paymentsError;

      // Get pending and overdue invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("amount, amount_paid, status, due_date");

      if (invoicesError) throw invoicesError;

      const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const pendingAmount = invoices
        ?.filter(inv => inv.status === "pending")
        .reduce((sum, inv) => sum + (Number(inv.amount) - Number(inv.amount_paid)), 0) || 0;
      const overdueCount = invoices?.filter(inv => inv.status === "overdue").length || 0;
      const upcomingExpirations = invoices?.filter(inv => {
        const dueDate = new Date(inv.due_date);
        const thirtyDaysFromNow = addMonths(now, 1);
        return dueDate <= thirtyDaysFromNow && inv.status !== "paid";
      }).length || 0;

      return {
        totalPayments,
        pendingAmount,
        overdueCount,
        upcomingExpirations,
      };
    },
  });

  // Fetch monthly revenue data
  const { data: monthlyRevenue, isLoading: revenueLoading } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: async () => {
      const now = new Date();
      const startDate = startOfMonth(addMonths(now, -5));
      const endDate = endOfMonth(now);

      const { data: payments, error } = await supabase
        .from("payments")
        .select("amount, payment_date")
        .gte("payment_date", startDate.toISOString())
        .lte("payment_date", endDate.toISOString());

      if (error) throw error;

      const monthlyData: { [key: string]: number } = {};
      
      // Initialize last 6 months
      for (let i = -5; i <= 0; i++) {
        const monthDate = addMonths(now, i);
        const monthKey = format(monthDate, "MMM yyyy");
        monthlyData[monthKey] = 0;
      }

      // Sum payments by month
      payments?.forEach(payment => {
        const monthKey = format(new Date(payment.payment_date), "MMM yyyy");
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(payment.amount);
      });

      return Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue,
      }));
    },
  });

  if (metricsLoading || revenueLoading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Your rental property metrics at a glance.</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics?.totalPayments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Received payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics?.pendingAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Outstanding balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
              <AlertOctagon className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.overdueCount}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Due</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.upcomingExpirations}</div>
              <p className="text-xs text-muted-foreground">Due in next 30 days</p>
            </CardContent>
          </Card>
        </div>

        {metrics?.overdueCount > 0 && (
          <Alert variant="destructive">
            <AlertOctagon className="h-4 w-4" />
            <AlertDescription>
              You have {metrics.overdueCount} overdue {metrics.overdueCount === 1 ? 'invoice' : 'invoices'} that require your attention.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <MonthlyRevenueTrend />
          <PaymentBreakdownChart />
        </div>

        <RevenueDataTable />
      </div>
    </Layout>
  );
}
