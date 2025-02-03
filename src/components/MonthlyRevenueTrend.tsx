import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface MonthlyRevenueTrendProps {
  startDate: Date;
  endDate: Date;
}

export function MonthlyRevenueTrend({ startDate, endDate }: MonthlyRevenueTrendProps) {
  const { data: monthlyRevenue, isLoading } = useQuery({
    queryKey: ["monthly-revenue", startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_revenue_summary")
        .select("*")
        .gte("month", startDate.toISOString())
        .lte("month", endDate.toISOString())
        .order("month", { ascending: true });

      if (error) throw error;
      return data.map(item => ({
        ...item,
        month: format(new Date(item.month), "MMM yyyy"),
        total_revenue: Number(item.total_revenue)
      }));
    }
  });

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenue}>
              <XAxis 
                dataKey="month" 
                stroke="#888888"
                fontSize={12}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickFormatter={(value) => `${value} MAD`}
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