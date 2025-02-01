import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface AddInvoiceFormProps {
  propertyId: string
  tenantId: string
  onSuccess?: () => void
}

export function AddInvoiceForm({ propertyId, tenantId, onSuccess }: AddInvoiceFormProps) {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [dailyRate, setDailyRate] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      if (!startDate || !endDate || !dailyRate) {
        throw new Error("Please fill in all required fields")
      }

      const { error } = await supabase.from("invoices").insert({
        property_id: propertyId,
        tenant_id: tenantId,
        daily_rate: parseFloat(dailyRate),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        due_date: endDate.toISOString(), // Set due date to end date
        description,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      toast.success("Invoice created successfully")
      if (onSuccess) onSuccess()
    },
    onError: (error) => {
      console.error("Error creating invoice:", error)
      toast.error("Failed to create invoice")
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    createInvoiceMutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="daily_rate">Daily Rate ($)</Label>
        <Input
          id="daily_rate"
          type="number"
          step="0.01"
          value={dailyRate}
          onChange={(e) => setDailyRate(e.target.value)}
          required
          placeholder="Enter daily rate"
        />
      </div>

      <div className="space-y-2">
        <Label>Start Date</Label>
        <DatePicker
          date={startDate}
          setDate={setStartDate}
          placeholder="Select start date"
        />
      </div>

      <div className="space-y-2">
        <Label>End Date</Label>
        <DatePicker
          date={endDate}
          setDate={setEndDate}
          placeholder="Select end date"
          disabled={(date) => startDate ? date < startDate : false}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter invoice description"
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Invoice"}
      </Button>
    </form>
  )
}