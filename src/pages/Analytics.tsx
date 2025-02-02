import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Skeleton } from "@/components/ui/skeleton";

// تسجيل المكتبات للرسم البياني
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Analytics() {
  const { data: monthlyRevenue, isLoading } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_revenue_summary")
        .select("*")
        .order("month", { ascending: true });

      if (error) throw error;
      console.log("Monthly Revenue Data:", data); // ✅ تأكد أن البيانات تُسترجع
      return data || [];
    },
  });

  // تجهيز البيانات للرسم البياني 📊
  const chartData = {
    labels: monthlyRevenue?.map((item) =>
      new Date(item.month).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    ),
    datasets: [
      {
        label: "Total Revenue (MAD)",
        data: monthlyRevenue?.map((item) => item.total_revenue),
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">📊 Analytics</h1>
          <p className="text-muted-foreground">View your property management analytics</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            {/* 📈 الرسم البياني للإيرادات */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </CardContent>
            </Card>

            {/* 📑 الجدول يعرض البيانات بالتفصيل */}
            <Card>
              <CardHeader>
                <CardTitle>📑 Monthly Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Total Revenue (MAD)</TableHead>
                      <TableHead>Invoices</TableHead>
                      <TableHead>Payments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyRevenue?.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(row.month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </TableCell>
                        <TableCell className="font-semibold">{row.total_revenue.toLocaleString()} MAD</TableCell>
                        <TableCell>{row.invoice_count}</TableCell>
                        <TableCell>{row.payment_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
