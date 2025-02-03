// BookingForm.tsx
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/types/property";
import type { Customer } from "@/types/customer";

export function BookingForm() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [dailyRate, setDailyRate] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProperties();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (startDate && endDate && dailyRate) {
      const days = calculateDays(startDate, endDate);
      setTotalPrice(days * dailyRate);
    }
  }, [startDate, endDate, dailyRate]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("properties").select("*").eq("status", "Available");
      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDays = (start: Date, end: Date) => {
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const handleBooking = async () => {
    if (!selectedProperty || !selectedCustomer || !startDate || !endDate) {
      toast.error("Please complete all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: bookingError } = await supabase.from("invoices").insert([
        {
          property_id: selectedProperty,
          customer_id: selectedCustomer,
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
        console.error("Booking error:", bookingError);
        throw bookingError;
      }

      toast.success("Booking successfully created!");
      setSelectedProperty("");
      setSelectedCustomer("");
      setStartDate(undefined);
      setEndDate(undefined);
      setDailyRate(0);
      setTotalPrice(0);
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Book a Property</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select Customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.full_name} - {customer.phone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button className="w-full" onClick={handleBooking} disabled={isSubmitting}>
          {isSubmitting ? "Creating booking..." : "Confirm Booking"}
        </Button>
      </CardContent>
    </Card>
  );
}
