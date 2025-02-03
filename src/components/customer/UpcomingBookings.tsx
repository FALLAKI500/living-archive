import { Badge } from "@/components/ui/badge"
import { format, isThisWeek, isToday } from "date-fns"

interface UpcomingBookingsProps {
  bookings: Array<{
    id: string
    start_date: string
  }>
}

export function UpcomingBookings({ bookings }: UpcomingBookingsProps) {
  const getBookingUrgencyColor = (date: string) => {
    if (isToday(new Date(date))) return "bg-red-500"
    if (isThisWeek(new Date(date))) return "bg-orange-500"
    return "bg-blue-500"
  }

  if (!bookings.length) return null

  return (
    <div className="pt-4 border-t">
      <h3 className="font-medium mb-2">Upcoming Bookings</h3>
      <div className="space-y-2">
        {bookings.map((booking) => (
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
  )
}