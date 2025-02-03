import { useState, useEffect } from "react"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import type { Property } from "@/types/property"

export function BookingForm() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [dailyRate, setDailyRate] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    if (startDate && endDate && dailyRate) {
      const days = calculateDays(startDate, endDate)
      setTotalPrice(days * dailyRate)
    }
  }, [startDate, endDate, dailyRate])

  const fetchProperties = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "Available")

      if (error) throw error

      const typedProperties = data?.map(property => ({
        ...property,
        pricing_type: property.pricing_type as Property['pricing_type']
      })) || []

      setProperties(typedProperties)
    } catch (error) {
      console.error("❌ Error fetching properties:", error)
      toast.error("Failed to load properties")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDays = (start: Date, end: Date) => {
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const handleBooking = async () => {
    if (!selectedProperty || !startDate || !endDate) {
      toast.error("❌ Please complete all fields")
      return
    }

    setIsSubmitting(true)
    try {
      // 🔍 **جلب `tenant_id`**
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log("User Data:", userData);
      
      const tenantId = userData?.user?.id;
      if (!tenantId) {
        console.error("❌ No tenant ID found");
        toast.error("User is not authenticated.");
        return;
      }
      console.log("✅ Tenant ID:", tenantId);

      // 🔍 **التحقق من الحجوزات السابقة**
      const { data: existingBookings, error: checkError } = await supabase
        .from("invoices")
        .select("*")
        .eq("property_id", selectedProperty)
        .or(`start_date.lte.${format(endDate, "yyyy-MM-dd")},end_date.gte.${format(startDate, "yyyy-MM-dd")}`)
        .neq("status", "cancelled");

      if (checkError) throw checkError;

      if (existingBookings && existingBookings.length > 0) {
        toast.error("❌ This property is already booked for the selected dates")
        return
      }

      // 🔍 **التأكد من صحة البيانات قبل الإرسال**
      console.log("📌 Booking Data:", {
        property_id: selectedProperty,
        tenant_id: tenantId,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        daily_rate: dailyRate,
        amount: totalPrice,
        status: "pending",
        due_date: format(startDate, "yyyy-MM-dd"),
        amount_paid: 0,
        days_rented: calculateDays(startDate, endDate),
      });

      // 🔥 **إنشاء الحجز في Supabase**
      const { error: bookingError } = await supabase.from("invoices").insert([
        {
          property_id: selectedProperty,
          tenant_id: tenantId,
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          daily_rate: dailyRate,
          amount: totalPrice,
          status: "pending",
          due_date: format(startDate, "yyyy-MM-dd"),
          amount_paid: 0,
          days_rented: calculateDays(startDate, endDate),
        },
      ]);

      if (bookingError) {
        console.error("❌ Booking error:", bookingError);
        throw bookingError;
      }

      toast.success("✅ Booking successfully created!")

      // 🔄 **إعادة تعيين النموذج**
      setSelectedProperty("")
      setStartDate(undefined)
      setEndDate(undefined)
      setDailyRate(0)
      setTotalPrice(0)
    } catch (error) {
      console.error("❌ Error creating booking:", error)
      toast.error("Failed to create booking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Book a Property</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Property</label>
          <Select
            value={selectedProperty}
            onValueChange={(value) => {
              setSelectedProperty(value)
              const property = properties.find(p => p.id === value)
              setDailyRate(property?.daily_rate || 0)
            }}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name} - {property.daily_rate} MAD/day
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DatePicker date={startDate} setDate={setStartDate} placeholder="Start Date" />
        <DatePicker date={endDate} setDate={setEndDate} placeholder="End Date" />

        <p className="text-lg font-semibold">Total Price: {totalPrice.toLocaleString()} MAD</p>

        <Button onClick={handleBooking} disabled={isSubmitting || !selectedProperty || !startDate || !endDate}>
          {isSubmitting ? "Creating booking..." : "Confirm Booking"}
        </Button>
      </CardContent>
    </Card>
  )
}
