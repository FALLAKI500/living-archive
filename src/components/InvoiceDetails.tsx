import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaymentDialog } from "@/components/PaymentDialog"
import { supabase } from "@/integrations/supabase/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface Payment {
  id: string
  amount: number
  payment_date: string
  payment_method: string
  notes: string | null
}

interface InvoiceDetailsProps {
  invoiceId: string
  currentAmount: number
  amountPaid: number
  dueDate: string
  status: "pending" | "paid" | "overdue"
}

export function InvoiceDetails({ 
  invoiceId, 
  currentAmount, 
  amountPaid, 
  dueDate,
  status 
}: InvoiceDetailsProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("payment_date", { ascending: false })

      if (error) throw error
      return data as Payment[]
    },
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "text-green-600"
      case "overdue":
        return "text-red-600"
      default:
        return "text-yellow-600"
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold tracking-tight">
            Invoice Details
          </h3>
          <p className="text-sm text-muted-foreground">
            Due by {format(new Date(dueDate), "PPP")}
          </p>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "capitalize",
            getStatusColor(status)
          )}
        >
          {status}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Total Amount
          </p>
          <p className="text-2xl font-semibold">
            ${currentAmount.toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Amount Paid
          </p>
          <p className="text-2xl font-semibold">
            ${amountPaid.toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Remaining
          </p>
          <p className="text-2xl font-semibold">
            ${(currentAmount - amountPaid).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold">Payment History</h4>
          <PaymentDialog
            invoiceId={invoiceId}
            currentAmount={currentAmount}
            amountPaid={amountPaid}
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading payments...</p>
        ) : payments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {format(new Date(payment.payment_date), "PP")}
                  </TableCell>
                  <TableCell>${payment.amount.toLocaleString()}</TableCell>
                  <TableCell className="capitalize">
                    {payment.payment_method}
                  </TableCell>
                  <TableCell>{payment.notes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">
            No payments recorded yet.
          </p>
        )}
      </div>
    </Card>
  )
}