import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Booking {
  id: string;
  property_id: string;
  tenant_id: string;
  amount: number;
  start_date: string;
  end_date: string;
  status: string;
  properties: {
    name: string;
    address: string;
  } | null;
}

export default function Bookings() {
  const { user } = useAuth();

  const { data: bookings, isLoading, error } = useQuery<Booking[]>({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      console.log("Fetching bookings data...");
      
      if (!user) throw new Error("User not authenticated");

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
        .or(`tenant_id.eq.${user.id},properties.user_id.eq.${user.id}`)
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        throw error;
      }

      console.log("Bookings data received:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-lg text-muted-foreground">Loading bookings...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading bookings. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage your property bookings and reservations.
          </p>
        </div>

        <div className="grid gap-4">
          {bookings && bookings.length > 0 ? (
            bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle>{booking.properties?.name || "Unknown Property"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dates</span>
                      <span>
                        {booking.start_date && booking.end_date ? (
                          `${format(new Date(booking.start_date), "PPP")} - ${format(
                            new Date(booking.end_date),
                            "PPP"
                          )}`
                        ) : (
                          "Dates not specified"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span>{booking.amount.toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="capitalize">{booking.status}</span>
                    </div>
                    {booking.properties?.address && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address</span>
                        <span>{booking.properties.address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No bookings found.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}