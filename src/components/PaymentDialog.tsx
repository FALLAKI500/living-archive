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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const amount = parseFloat(formData.get("amount") as string)
      const notes = formData.get("notes") as string

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
        description: "Failed to record payment. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Record Payment</Button>
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
              placeholder="Enter payment amount"
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
          <div className="text-sm text-muted-foreground">
            <p>Invoice Total: ${currentAmount}</p>
            <p>Amount Paid: ${amountPaid}</p>
            <p>Remaining: ${currentAmount - amountPaid}</p>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Recording..." : "Record Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}