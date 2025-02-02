import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerDetails } from "./customer/CustomerDetails"
import { CustomerNotes } from "./customer/CustomerNotes"
import { CustomerCharts } from "./customer/CustomerCharts"
import { UpcomingBookings } from "./customer/UpcomingBookings"

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
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{fullName || "Unnamed Customer"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CustomerDetails
          fullName={fullName}
          phone={phone}
          city={city}
          companyName={companyName}
          totalBookings={totalBookings}
          totalSpent={totalSpent}
          lastBookingDate={lastBookingDate}
        />
        
        <CustomerCharts customerId={id} />
        
        <UpcomingBookings bookings={upcomingBookings} />
        
        <CustomerNotes 
          customerId={id}
          initialNotes={notes}
        />
      </CardContent>
    </Card>
  )
}