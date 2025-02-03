import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { toast } from "sonner";

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Analytics() {
  const queryClient = useQueryClient();

  const { data: revenueData = [], isLoading, error } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: async () => {
      console.log("📊 Fetching revenue data...");
      const { data, error } = await supabase
        .from("monthly_revenue_summary")
        .select("*")
        .order("month", { ascending: true });

      if (error) {
        console.error("❌ Supabase Error:", error);
        toast.error("Failed to load analytics data");
        throw error;
      }

      console.log("✅ Revenue data fetched:", data || "No Data");
      return data || [];
    },
  });

  // Safety check for data
  if (error) {
    console.error("❌ Query Error:", error);
    return (
      <Layout>
        <div className="text-center text-red-500">
          Failed to load analytics. Please try again later.
        </div>
      </Layout>
    );
  }

  // Prepare chart data with safety checks
  const chartData = {
    labels: revenueData.map((item) =>
      item?.month
        ? new Date(item.month).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "Unknown"
    ),
    datasets: [
      {
        label: "Total Revenue (MAD)",
        data: revenueData.map((item) => item?.total_revenue || 0),
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Monthly Revenue Trend",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `${value.toLocaleString()} MAD`,
        },
      },
    },
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">📊 Analytics</h1>
          <p className="text-muted-foreground">View your property management analytics</p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>📈 Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {revenueData.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-muted-foreground">
                      No revenue data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue Summary Table */}
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
                    {revenueData.length > 0 ? (
                      revenueData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {row?.month
                              ? new Date(row.month).toLocaleDateString("en-US", {
                                  month: "long",
                                  year: "numeric",
                                })
                              : "Unknown"}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {(row?.total_revenue || 0).toLocaleString()} MAD
                          </TableCell>
                          <TableCell>{row?.invoice_count || 0}</TableCell>
                          <TableCell>{row?.payment_count || 0}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground"
                        >
                          No revenue data available
                        </TableCell>
                      </TableRow>
                    )}
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