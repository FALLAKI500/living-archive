import { Layout } from "@/components/Layout";
import { MonthlyRevenueTrend } from "@/components/MonthlyRevenueTrend";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { addMonths, startOfMonth, endOfMonth } from "date-fns";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(addMonths(new Date(), -6)),
    to: endOfMonth(new Date())
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your property management business
            </p>
          </div>
          <DatePickerWithRange
            date={dateRange}
            setDate={(newRange) => setDateRange(newRange || {
              from: startOfMonth(addMonths(new Date(), -6)),
              to: endOfMonth(new Date())
            })}
          />
        </div>

        <MonthlyRevenueTrend 
          startDate={dateRange.from || startOfMonth(addMonths(new Date(), -6))}
          endDate={dateRange.to || endOfMonth(new Date())}
        />
      </div>
    </Layout>
  );
}