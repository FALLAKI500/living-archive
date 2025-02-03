import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const { data: revenueData, isLoading, error } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_revenue_summary")
        .select("*")
        .order("month", { ascending: true });

      if (error) {
        toast.error("Failed to load analytics data");
        throw error;
      }

      return data?.map(item => ({
        ...item,
        month: format(new Date(item.month), "MMM yyyy"),
        total_revenue: Number(item.total_revenue)
      })) || [];
    }
  });

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-500">
          Failed to load analytics. Please try again later.
        </div>
      </Layout>
    );
  }

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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading data...</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {revenueData && revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <XAxis 
                          dataKey="month" 
                          stroke="#888888"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickFormatter={(value) => `${value.toLocaleString()} MAD`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`${value.toLocaleString()} MAD`, "Revenue"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="total_revenue"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">No revenue data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Summary</CardTitle>
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
                    {revenueData && revenueData.length > 0 ? (
                      revenueData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.month}</TableCell>
                          <TableCell className="font-semibold">
                            {row.total_revenue.toLocaleString()} MAD
                          </TableCell>
                          <TableCell>{row.invoice_count || 0}</TableCell>
                          <TableCell>{row.payment_count || 0}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
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