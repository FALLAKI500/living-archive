import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface MonthlyRevenueTrendProps {
  startDate: Date;
  endDate: Date;
}

export function MonthlyRevenueTrend({ startDate, endDate }: MonthlyRevenueTrendProps) {
  const { data: monthlyRevenue, isLoading, error } = useQuery({
    queryKey: ["monthly-revenue", startDate, endDate],
    queryFn: async () => {
      console.log("📊 Fetching revenue data...");
      const { data, error } = await supabase
        .from("monthly_revenue_summary")
        .select("*")
        .gte("month", startDate.toISOString())
        .lte("month", endDate.toISOString())
        .order("month", { ascending: true });

      if (error) {
        console.error("❌ Supabase Error:", error);
        toast.error("Failed to load revenue data");
        throw error;
      }

      console.log("✅ Revenue data fetched:", data || "No Data");
      return data.map(item => ({
        ...item,
        month: format(new Date(item.month), "MMM yyyy"),
        total_revenue: Number(item.total_revenue)
      }));
    }
  });

  // Handle error state
  if (error) {
    console.error("❌ Query Error:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-red-500">Failed to load revenue data. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading revenue data...</p>
        </CardContent>
      </Card>
    );
  }

  // Ensure we have data before rendering
  const revenueData = monthlyRevenue || [];
  if (revenueData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">No revenue data available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
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
        </div>
      </CardContent>
    </Card>
  );
}