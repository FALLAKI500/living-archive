import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CustomerDetailsProps {
  fullName: string
  phone?: string
  city?: string
  companyName?: string
  totalBookings: number
  totalSpent: number
  lastBookingDate?: string
}

export function CustomerDetails({
  fullName,
  phone,
  city,
  companyName,
  totalBookings,
  totalSpent,
  lastBookingDate,
}: CustomerDetailsProps) {
  return (
    <div className="space-y-4">
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
    </div>
  )
}