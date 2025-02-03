import { memo } from "react"
import { motion } from "framer-motion"

interface CustomerDetailsProps {
  fullName: string
  phone?: string
  city?: string
  companyName?: string
  totalBookings: number
  totalSpent: number
  lastBookingDate?: string
}

export const CustomerDetails = memo(({
  fullName,
  phone,
  city,
  companyName,
  totalBookings,
  totalSpent,
  lastBookingDate,
}: CustomerDetailsProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
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
        <motion.p 
          className="text-sm font-medium"
          whileHover={{ scale: 1.02 }}
        >
          Total Bookings: {totalBookings}
        </motion.p>
        <motion.p 
          className="text-sm font-medium"
          whileHover={{ scale: 1.02 }}
        >
          Total Spent: {Number(totalSpent).toLocaleString()} MAD
        </motion.p>
        {lastBookingDate && (
          <p className="text-sm text-muted-foreground">
            Last Booking: {new Date(lastBookingDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  )
})

CustomerDetails.displayName = "CustomerDetails"