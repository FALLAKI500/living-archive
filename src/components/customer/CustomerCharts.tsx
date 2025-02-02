import { lazy, Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const CustomerSpendingChart = lazy(() => import("../../components/CustomerSpendingChart").then(module => ({ default: module.default })))
const CustomerBookingsChart = lazy(() => import("../../components/CustomerBookingsChart").then(module => ({ default: module.default })))

interface CustomerChartsProps {
  customerId: string
}

export function CustomerCharts({ customerId }: CustomerChartsProps) {
  return (
    <div className="pt-4 border-t">
      <h3 className="font-medium mb-2">Customer Insights</h3>
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <div className="h-48 mb-4">
          <CustomerSpendingChart customerId={customerId} />
        </div>
      </Suspense>
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <div className="h-48">
          <CustomerBookingsChart customerId={customerId} />
        </div>
      </Suspense>
    </div>
  )
}