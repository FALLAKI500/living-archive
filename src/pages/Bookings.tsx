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
import { Plus } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { BookingForm } from "@/components/BookingForm"

interface Booking {
  id: string
  property_id: string
  tenant_id: string
  amount: number
  start_date: string
  end_date: string
  status: string
  properties: {
    name: string
    address: string
  } | null
}

export default function Bookings() {
  const { data: bookings, isLoading } = useQuery({
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
        .update({ status: "cancelled" })
        .eq("id", bookingId)

      if (error) throw error
      toast.success("Booking cancelled successfully")
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel booking")
    }
  }

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
              {bookings?.map((booking) => (
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
                  <TableCell className="capitalize">{booking.status}</TableCell>
                  <TableCell className="text-right">
                    {booking.status !== "cancelled" && (
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
              {(!bookings || bookings.length === 0) && (
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