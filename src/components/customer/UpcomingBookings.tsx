import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { format, isThisWeek, isToday } from "date-fns"
import { motion } from "framer-motion"

interface UpcomingBookingsProps {
  bookings: Array<{
    id: string
    start_date: string
  }>
}

export const UpcomingBookings = memo(({ bookings }: UpcomingBookingsProps) => {
  const getBookingUrgencyColor = (date: string) => {
    if (isToday(new Date(date))) return "bg-red-500"
    if (isThisWeek(new Date(date))) return "bg-orange-500"
    return "bg-blue-500"
  }

  if (!bookings.length) return null

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pt-4 border-t"
    >
      <h3 className="font-medium mb-2">Upcoming Bookings</h3>
      <div className="space-y-2">
        {bookings.map((booking) => (
          <motion.div 
            key={booking.id} 
            className="flex items-center justify-between"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
})

UpcomingBookings.displayName = "UpcomingBookings"