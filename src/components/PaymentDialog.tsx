import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"

interface PaymentDialogProps {
  invoiceId: string
  currentAmount: number
  amountPaid: number
  onSuccess?: () => void
}

export function PaymentDialog({ invoiceId, currentAmount, amountPaid, onSuccess }: PaymentDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const remainingAmount = currentAmount - amountPaid
  const isFullyPaid = amountPaid >= currentAmount

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const amount = parseFloat(formData.get("amount") as string)
      const notes = formData.get("notes") as string

      if (amount <= 0) {
        throw new Error("Payment amount must be greater than 0")
      }

      if (amount > remainingAmount) {
        throw new Error(`Payment amount cannot exceed the remaining balance of $${remainingAmount}`)
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          invoice_id: invoiceId,
          amount,
          notes,
          payment_method: "manual",
        })

      if (paymentError) throw paymentError

      // Update invoice amount_paid and status
      const newAmountPaid = amountPaid + amount
      const status = newAmountPaid >= currentAmount ? "paid" : "pending"

      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          amount_paid: newAmountPaid,
          status,
        })
        .eq("id", invoiceId)

      if (invoiceError) throw invoiceError

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      })

      setIsOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error recording payment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record payment",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={isFullyPaid ? "ghost" : "outline"}
          disabled={isFullyPaid}
        >
          {isFullyPaid ? "Fully Paid" : "Record Payment"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              required
              min="0.01"
              max={remainingAmount}
              placeholder={`Enter amount (max: $${remainingAmount})`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              name="notes"
              placeholder="Payment notes (optional)"
            />
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Invoice Total: ${currentAmount.toLocaleString()}</p>
            <p>Amount Paid: ${amountPaid.toLocaleString()}</p>
            <p>Remaining: ${remainingAmount.toLocaleString()}</p>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || isFullyPaid}>
            {isSubmitting ? "Recording..." : "Record Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}