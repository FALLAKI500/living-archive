import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

type Expense = {
  id?: string
  amount: number
  category: string
  description?: string
  date: string
  payment_method?: string
  property_id?: string | null
}

export default function Expenses() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  // 🟢 استرجاع المصروفات
  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*, property:properties(name)")
        .order("date", { ascending: false })

      if (error) throw error
      return data as Expense[]
    },
  })

  // 🟢 استرجاع العقارات
  const { data: properties } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name")

      if (error) throw error
      return data
    },
  })

  // ✅ دالة الإضافة مع تحديث البيانات فورًا بعد الإدخال
  const addExpenseMutation = useMutation({
    mutationFn: async (expenseData: Expense) => {
      const { error } = await supabase.from("expenses").insert([expenseData])
      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Expense added successfully")
      queryClient.invalidateQueries(["expenses"]) // 🔄 تحديث البيانات
      setIsDialogOpen(false)
    },
    onError: (error) => {
      console.error("Error adding expense:", error)
      toast.error("Failed to add expense")
    },
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const expenseData: Expense = {
        amount: Number(formData.get("amount")),
        category: formData.get("category") as string,
        description: formData.get("description") as string,
        date: formData.get("date") as string,
        payment_method: formData.get("payment_method") as string,
        property_id: formData.get("property_id") as string || null,
      }

      await addExpenseMutation.mutateAsync(expenseData)
    } catch (error) {
      console.error("Error adding expense:", error)
      toast.error("Failed to add expense")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground animate-pulse">
            Loading expenses...
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="amount" type="number" required placeholder="Enter amount" />
                <Select name="category" required defaultValue="utilities">
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="taxes">Taxes</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select name="payment_method" defaultValue="cash">
                  <SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <Select name="property_id">
                  <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                  <SelectContent>
                    {properties?.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input name="description" placeholder="Enter description (optional)" />
                <Input type="date" name="date" required defaultValue={format(new Date(), "yyyy-MM-dd")} />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Expense"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses?.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{format(new Date(expense.date), "PPP")}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.amount} MAD</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  )
}
