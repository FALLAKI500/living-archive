import { useState } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface InvoiceFormProps {
  propertyId: string
  tenantId: string
  onSuccess?: () => void
}

export function InvoiceForm({ propertyId, tenantId, onSuccess }: InvoiceFormProps) {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!startDate || !endDate) {
        throw new Error("Please select both start and end dates")
      }

      const formData = new FormData(e.currentTarget)
      const dailyRate = parseFloat(formData.get('daily_rate') as string)
      
      if (isNaN(dailyRate) || dailyRate <= 0) {
        throw new Error("Please enter a valid daily rate")
      }

      const { error } = await supabase.from("invoices").insert({
        property_id: propertyId,
        tenant_id: tenantId,
        daily_rate: dailyRate,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        due_date: format(endDate, 'yyyy-MM-dd'),
        amount: 0, // This will be calculated by the trigger
        description: formData.get('description') as string,
      })

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(error.message)
      }

      toast({
        title: "Success",
        description: "Invoice created successfully",
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error creating invoice:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create invoice. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="daily_rate">Daily Rate</Label>
        <Input
          id="daily_rate"
          name="daily_rate"
          type="number"
          step="0.01"
          required
          placeholder="Enter daily rate"
        />
      </div>

      <div className="space-y-2">
        <Label>Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>End Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
              disabled={(date) => startDate ? date < startDate : false}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
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