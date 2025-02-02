import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// 📊 تسجيل المكتبات للرسم البياني
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Analytics() {
  // 📌 جلب بيانات الإيرادات الشهرية
  const { data: monthlyRevenue, isLoading } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_revenue_summary")
        .select("*")
        .order("month", { ascending: true });

      if (error) throw error;

      console.log("📊 Monthly Revenue Data:", data || "No Data"); // ✅ التأكد من أن البيانات مسترجعة
      return data || [];
    },
  });

  // ✅ التأكد من أن البيانات موجودة
  const revenueData = monthlyRevenue || [];

  // 📈 تجهيز البيانات للرسم البياني
  const chartData = {
    labels: revenueData.map((item) =>
      item.month ? new Date(item.month).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Unknown"
    ),
    datasets: [
      {
        label: "Total Revenue (MAD)",
        data: revenueData.map((item) => item.total_revenue || 0),
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
          // ⏳ عرض الـ Skeleton أثناء التحميل
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            {/* 📊 الرسم البياني للإيرادات */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {revenueData.length > 0 ? (
                  <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                ) : (
                  <p className="text-center text-gray-500">📉 No data available</p>
                )}
              </CardContent>
            </Card>

            {/* 📑 الجدول يعرض البيانات بالتفصيل */}
            <Card>
              <CardHeader>
                <CardTitle>📑 Monthly Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueData.length > 0 ? (
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
                      {revenueData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {row.month ? new Date(row.month).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Unknown"}
                          </TableCell>
                          <TableCell className="font-semibold">{row.total_revenue ? row.total_revenue.toLocaleString() : "0"} MAD</TableCell>
                          <TableCell>{row.invoice_count || 0}</TableCell>
                          <TableCell>{row.payment_count || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-gray-500">📉 No revenue data available</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
