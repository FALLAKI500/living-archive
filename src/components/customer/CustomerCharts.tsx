import { CustomerSpendingChart } from "../CustomerSpendingChart"
import { CustomerBookingsChart } from "../CustomerBookingsChart"

interface CustomerChartsProps {
  customerId: string
}

export function CustomerCharts({ customerId }: CustomerChartsProps) {
  return (
    <div className="pt-4 border-t">
      <h3 className="font-medium mb-2">Customer Insights</h3>
      <div className="h-48 mb-4">
        <CustomerSpendingChart customerId={customerId} />
      </div>
      <div className="h-48">
        <CustomerBookingsChart customerId={customerId} />
      </div>
    </div>
  )
}