import { useQuery } from "@tanstack/react-query"
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { BookingForm } from "@/components/BookingForm"
import { useState } from "react"

interface Booking {
  id: string
  property_id: string
  tenant_id: string
  amount: number
  start_date: string
  end_date: string
  status: string
  booking_status: string
  properties: {
    name: string
    address: string
  } | null
}

export default function Bookings() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          property_id,
          tenant_id,
          amount,
          start_date,
          end_date,
          status,
          booking_status,
          properties:property_id (
            name,
            address
          )
        `)
        .order("start_date", { ascending: false })

      if (error) throw error
      return data as Booking[]
    },
  })

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ 
          booking_status: "canceled",
          status: "cancelled" 
        })
        .eq("id", bookingId)

      if (error) throw error
      
      toast.success("Booking cancelled successfully")
      refetch()
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel booking")
    }
  }

  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = booking.properties?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.properties?.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.booking_status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading bookings...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">
              Manage your property bookings and reservations
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
              </DialogHeader>
              <BookingForm />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings?.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.properties?.name || "Unknown Property"}
                    <div className="text-sm text-muted-foreground">
                      {booking.properties?.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    {booking.start_date && booking.end_date ? (
                      `${format(new Date(booking.start_date), "PPP")} - ${format(
                        new Date(booking.end_date),
                        "PPP"
                      )}`
                    ) : (
                      "Dates not specified"
                    )}
                  </TableCell>
                  <TableCell>{booking.amount.toLocaleString()} MAD</TableCell>
                  <TableCell className="capitalize">{booking.booking_status}</TableCell>
                  <TableCell className="text-right">
                    {booking.booking_status === "active" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(!filteredBookings || filteredBookings.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-muted-foreground">No bookings found.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  )
}