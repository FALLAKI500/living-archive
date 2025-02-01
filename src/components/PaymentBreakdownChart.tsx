import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PaymentStatus {
  name: string;
  value: number;
  color: string;
}

export function PaymentBreakdownChart() {
  const { data: paymentData, isLoading } = useQuery({
    queryKey: ["payment-breakdown"],
    queryFn: async () => {
      const { data: invoices, error } = await supabase
        .from("invoices")
        .select("amount, amount_paid, status");

      if (error) throw error;

      const paid = invoices.reduce(
        (sum, inv) => sum + (inv.status === "paid" ? Number(inv.amount) : 0),
        0
      );
      const pending = invoices.reduce(
        (sum, inv) => sum + (inv.status === "pending" ? Number(inv.amount) : 0),
        0
      );
      const overdue = invoices.reduce(
        (sum, inv) => sum + (inv.status === "overdue" ? Number(inv.amount) : 0),
        0
      );

      return [
        { name: "Paid", value: paid, color: "hsl(var(--success))" },
        { name: "Pending", value: pending, color: "hsl(var(--warning))" },
        { name: "Overdue", value: overdue, color: "hsl(var(--destructive))" },
      ];
    },
  });

  if (isLoading || !paymentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              paid: { theme: { light: "hsl(var(--success))", dark: "hsl(var(--success))" } },
              pending: { theme: { light: "hsl(var(--warning))", dark: "hsl(var(--warning))" } },
              overdue: { theme: { light: "hsl(var(--destructive))", dark: "hsl(var(--destructive))" } },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload as PaymentStatus;
                    return (
                      <ChartTooltipContent>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: data.color }}
                            />
                            <span>{data.name}</span>
                          </div>
                          <div className="font-bold">{data.value.toLocaleString()} MAD</div>
                        </div>
                      </ChartTooltipContent>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 flex justify-center gap-4">
            {paymentData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">
                  {entry.name}: {entry.value.toLocaleString()} MAD
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}