import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface RevenueData {
  month: string;
  total_revenue: number;
  invoice_count: number;
}

export function RevenueDataTable() {
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["revenue-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_revenue_summary")
        .select("*")
        .order("month", { ascending: false })
        .limit(12);

      if (error) throw error;
      return data as RevenueData[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real Revenue Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading revenue data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real Revenue Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Total Revenue (MAD)</TableHead>
                <TableHead>Total Payments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueData?.map((row, index) => (
                <TableRow key={row.month}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {format(new Date(row.month), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>
                    {Number(row.total_revenue).toLocaleString()}
                  </TableCell>
                  <TableCell>{row.invoice_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}