import { useState } from "react"
import { useForm } from "react-hook-form"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface InvoiceFormProps {
  propertyId: string
  tenantId: string
  onSuccess?: () => void
}

export function InvoiceForm({ propertyId, tenantId, onSuccess }: InvoiceFormProps) {
  const [date, setDate] = useState<Date>()
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      amount: "",
      description: "",
    },
  })

  const createInvoiceMutation = useMutation({
    mutationFn: async (values: { amount: string; description: string }) => {
      const { error } = await supabase.from("invoices").insert({
        property_id: propertyId,
        tenant_id: tenantId,
        amount: parseFloat(values.amount),
        due_date: date,
        description: values.description,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      toast.success("Invoice created successfully")
      form.reset()
      setDate(undefined)
      onSuccess?.()
    },
    onError: (error) => {
      console.error("Error creating invoice:", error)
      toast.error("Failed to create invoice")
    },
  })

  const onSubmit = (values: { amount: string; description: string }) => {
    if (!date) {
      toast.error("Please select a due date")
      return
    }
    createInvoiceMutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Due Date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </FormItem>

        <Button
          type="submit"
          className="w-full"
          disabled={createInvoiceMutation.isPending}
        >
          Create Invoice
        </Button>
      </form>
    </Form>
  )
}