import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DatePickerWithRange } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Users } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { addDays } from "date-fns"
import { DateRange } from "react-day-picker"

interface CustomerData {
  id: string
  full_name: string | null
  phone: string | null
  city: string | null
  company_name: string | null
  total_bookings: number
  total_spent: number
  last_booking_date: string | null
  customer_status: string
}

export function CustomerDashboard() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [minSpent, setMinSpent] = useState<number | null>(null)

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", dateRange, statusFilter, minSpent],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_customer_statistics", {
        start_date: dateRange.from?.toISOString(),
        end_date: dateRange.to?.toISOString(),
        min_spent: minSpent,
        status: statusFilter,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching customer data",
          description: error.message,
        })
        throw error
      }

      return data as CustomerData[]
    },
  })

  const filteredCustomers = customers?.filter((customer) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      !searchQuery ||
      customer.full_name?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower) ||
      customer.city?.toLowerCase().includes(searchLower)
    )
  })

  const columns = [
    {
      accessorKey: "full_name",
      header: "Customer Name",
    },
    {
      accessorKey: "customer_status",
      header: "Status",
      cell: ({ row }: { row: any }) => {
        const status = row.getValue("customer_status")
        return (
          <Badge
            className={
              status === "Overdue"
                ? "bg-red-500"
                : status === "Active"
                ? "bg-green-500"
                : status === "New"
                ? "bg-blue-500"
                : "bg-gray-500"
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "total_bookings",
      header: "Total Bookings",
    },
    {
      accessorKey: "total_spent",
      header: "Total Spent",
      cell: ({ row }: { row: any }) => {
        return `${Number(row.getValue("total_spent")).toLocaleString()} MAD`
      },
    },
    {
      accessorKey: "last_booking_date",
      header: "Last Booking",
      cell: ({ row }: { row: any }) => {
        const date = row.getValue("last_booking_date")
        return date ? format(new Date(date), "PP") : "N/A"
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DatePickerWithRange
                date={dateRange}
                setDate={setDateRange}
              />
              <Select
                value={statusFilter || ""}
                onValueChange={(value) => setStatusFilter(value || null)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Min. spent amount"
                className="w-[180px]"
                value={minSpent || ""}
                onChange={(e) => setMinSpent(e.target.value ? Number(e.target.value) : null)}
              />
            </div>

            <DataTable
              columns={columns}
              data={filteredCustomers || []}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}