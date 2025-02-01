import { Layout } from "@/components/Layout"
import { BookingForm } from "@/components/BookingForm"

export default function Booking() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book a Property</h1>
          <p className="text-muted-foreground">
            Select a property and dates to create a booking
          </p>
        </div>
        <BookingForm />
      </div>
    </Layout>
  )
}