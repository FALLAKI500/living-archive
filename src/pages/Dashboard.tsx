import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertOctagon, Calendar, DollarSign, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { PaymentBreakdownChart } from "@/components/PaymentBreakdownChart";
import { MonthlyRevenueTrend } from "@/components/MonthlyRevenueTrend";
import { RevenueDataTable } from "@/components/RevenueDataTable";
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";

export default function Dashboard() {
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 5));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboard-metrics", startDate, endDate],
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

  const { data: propertyRevenue, isLoading: propertyLoading } = useQuery({
    queryKey: ["property-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_revenue_summary")
        .select("*")
        .order("total_billed", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (metricsLoading || propertyLoading) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Your rental property metrics at a glance.
            </p>
          </div>
          <div className="flex gap-4">
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              placeholder="Start date"
            />
            <DatePicker
              date={endDate}
              setDate={setEndDate}
              placeholder="End date"
              minDate={startDate}
            />
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${metrics?.totalPayments.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Received payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${metrics?.pendingAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Outstanding balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overdue Invoices
              </CardTitle>
              <AlertOctagon className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.overdueCount}</div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Due</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.upcomingExpirations}
              </div>
              <p className="text-xs text-muted-foreground">Due in next 30 days</p>
            </CardContent>
          </Card>
        </div>

        {metrics?.overdueCount > 0 && (
          <Alert variant="destructive">
            <AlertOctagon className="h-4 w-4" />
            <AlertDescription>
              You have {metrics.overdueCount} overdue{" "}
              {metrics.overdueCount === 1 ? "invoice" : "invoices"} that require
              your attention.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <MonthlyRevenueTrend startDate={startDate} endDate={endDate} />
          <PaymentBreakdownChart />
        </div>

        {/* Top Performing Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Top Performing Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertyRevenue?.slice(0, 5).map((property) => (
                <div
                  key={property.property_id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{property.property_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {property.invoice_count} invoices
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${property.total_billed.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${property.total_paid.toLocaleString()} paid
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <RevenueDataTable />
      </div>
    </Layout>
  );
}
