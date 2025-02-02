import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { CustomerSpendingChart } from "./CustomerSpendingChart"
import { CustomerBookingsChart } from "./CustomerBookingsChart"
import { Badge } from "@/components/ui/badge"
import { format, isThisWeek, isToday } from "date-fns"

interface CustomerCardProps {
  id: string
  fullName: string
  phone?: string
  city?: string
  companyName?: string
  totalBookings: number
  totalSpent: number
  lastBookingDate?: string
  notes?: string[]
  upcomingBookings?: any[]
}

export function CustomerCard({
  id,
  fullName,
  phone,
  city,
  companyName,
  totalBookings,
  totalSpent,
  lastBookingDate,
  notes = [],
  upcomingBookings = []
}: CustomerCardProps) {
  const [newNote, setNewNote] = useState("")
  const [customerNotes, setCustomerNotes] = useState<string[]>(notes)
  const { toast } = useToast()

  const addNote = async () => {
    if (!newNote.trim()) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          notes: [...customerNotes, newNote],
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      setCustomerNotes(prev => [...prev, newNote])
      setNewNote("")
      toast({
        title: "Note added successfully",
        description: "Your note has been saved.",
      })
    } catch (error) {
      toast({
        title: "Error adding note",
        description: "There was a problem saving your note.",
        variant: "destructive",
      })
    }
  }

  const deleteNote = async (index: number) => {
    try {
      const newNotes = customerNotes.filter((_, i) => i !== index)
      const { error } = await supabase
        .from('profiles')
        .update({ 
          notes: newNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      setCustomerNotes(newNotes)
      toast({
        title: "Note deleted successfully",
        description: "Your note has been removed.",
      })
    } catch (error) {
      toast({
        title: "Error deleting note",
        description: "There was a problem removing your note.",
        variant: "destructive",
      })
    }
  }

  const getBookingUrgencyColor = (date: string) => {
    if (isToday(new Date(date))) return "bg-red-500"
    if (isThisWeek(new Date(date))) return "bg-orange-500"
    return "bg-blue-500"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{fullName || "Unnamed Customer"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {companyName && (
            <p className="text-sm text-muted-foreground">
              Company: {companyName}
            </p>
          )}
          {phone && (
            <p className="text-sm text-muted-foreground">
              Phone: {phone}
            </p>
          )}
          {city && (
            <p className="text-sm text-muted-foreground">
              City: {city}
            </p>
          )}
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm font-medium">
            Total Bookings: {totalBookings}
          </p>
          <p className="text-sm font-medium">
            Total Spent: {Number(totalSpent).toLocaleString()} MAD
          </p>
          {lastBookingDate && (
            <p className="text-sm text-muted-foreground">
              Last Booking: {new Date(lastBookingDate).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-medium mb-2">Customer Insights</h3>
          <div className="h-48 mb-4">
            <CustomerSpendingChart customerId={id} />
          </div>
          <div className="h-48">
            <CustomerBookingsChart customerId={id} />
          </div>
        </div>

        {upcomingBookings.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Upcoming Bookings</h3>
            <div className="space-y-2">
              {upcomingBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between">
                  <span className="text-sm">
                    {format(new Date(booking.start_date), 'MMM dd, yyyy')}
                  </span>
                  <Badge className={getBookingUrgencyColor(booking.start_date)}>
                    {isToday(new Date(booking.start_date)) 
                      ? "Today" 
                      : isThisWeek(new Date(booking.start_date))
                      ? "This Week"
                      : "Upcoming"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <h3 className="font-medium mb-2">Notes</h3>
          <div className="space-y-2">
            {customerNotes.map((note, index) => (
              <div key={index} className="flex items-start justify-between gap-2 p-2 bg-muted rounded-md">
                <p className="text-sm flex-1">{note}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNote(index)}
                >
                  Delete
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNote()}
              />
              <Button onClick={addNote}>Add</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}