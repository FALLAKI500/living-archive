import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { InvoiceForm } from "@/components/InvoiceForm"
import { PaymentDialog } from "@/components/PaymentDialog"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
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
import { Plus, Loader2, Search } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface Invoice {
  id: string
  property_id: string
  tenant_id: string
  amount: number
  amount_paid: number
  due_date: string
  status: "pending" | "paid" | "overdue" | "cancelled"
  description: string
  created_at: string
  start_date: string | null
  end_date: string | null
  properties: {
    name: string
  }
}

export default function Invoices() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<Invoice["status"] | "all">("all")
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>()
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>()
  const queryClient = useQueryClient()

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, properties(name)")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as Invoice[]
    },
  })

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["invoices"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-success/15 text-success"
      case "pending":
        return "bg-warning/15 text-warning"
      case "overdue":
        return "bg-destructive/15 text-destructive"
      default:
        return "bg-muted/15 text-muted-foreground"
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    // Search by property name
    const matchesSearch = invoice.properties.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    // Filter by status
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    // Filter by date range
    const startDate = startDateFilter ? new Date(startDateFilter) : null
    const endDate = endDateFilter ? new Date(endDateFilter) : null
    const invoiceDate = new Date(invoice.due_date)

    const matchesDateRange =
      (!startDate || invoiceDate >= startDate) &&
      (!endDate || invoiceDate <= endDate)

    return matchesSearch && matchesStatus && matchesDateRange
  })

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground animate-pulse">
            Loading invoices...
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <InvoiceForm
                propertyId="your-property-id"
                tenantId="tenant-id"
                onSuccess={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by property name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as Invoice["status"] | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <DatePicker
              date={startDateFilter}
              setDate={setStartDateFilter}
              placeholder="Start date"
            />
            <DatePicker
              date={endDateFilter}
              setDate={setEndDateFilter}
              placeholder="End date"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.properties.name}</TableCell>
                  <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>${invoice.amount_paid.toLocaleString()}</TableCell>
                  <TableCell>
                    {format(new Date(invoice.due_date), "PPP")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(invoice.status)}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>
                    <PaymentDialog
                      invoiceId={invoice.id}
                      currentAmount={invoice.amount}
                      amountPaid={invoice.amount_paid}
                      onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ["invoices"] })
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  )
}