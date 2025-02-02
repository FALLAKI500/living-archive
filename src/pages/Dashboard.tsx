import { Layout } from "@/components/Layout"
import { MonthlyRevenueTrend } from "@/components/MonthlyRevenueTrend"
import { PaymentBreakdownChart } from "@/components/PaymentBreakdownChart"
import { CustomerDashboard } from "@/components/CustomerDashboard"

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <MonthlyRevenueTrend />
            </div>
            <div className="col-span-3">
              <PaymentBreakdownChart />
            </div>
          </div>
          <CustomerDashboard />
        </div>
      </div>
    </Layout>
  )
}