import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import type { Property } from "@/types/property"

export function TestDataInserter() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const insertTestData = async () => {
    if (!user) {
      toast.error("You must be logged in to insert test data")
      return
    }

    setIsLoading(true)
    try {
      const testProperties: Omit<Property, "id" | "created_at" | "updated_at">[] = [
        {
          name: "Luxury Villa",
          address: "123 Ocean Drive",
          city: "Casablanca",
          daily_rate: 1500,
          monthly_rate: 35000,
          num_bedrooms: 4,
          status: "Available",
          image_url: "https://example.com/villa.jpg",
          user_id: user.id,
          pricing_type: "monthly"
        },
        {
          name: "Downtown Apartment",
          address: "456 City Center",
          city: "Rabat",
          daily_rate: 800,
          monthly_rate: 18000,
          num_bedrooms: 2,
          status: "Available",
          image_url: "https://example.com/apartment.jpg",
          user_id: user.id,
          pricing_type: "monthly"
        }
      ]

      const { error } = await supabase
        .from("properties")
        .insert(testProperties)

      if (error) throw error

      toast.success("Test properties inserted successfully")
    } catch (error) {
      console.error("Error inserting test data:", error)
      toast.error("Failed to insert test data")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={insertTestData} disabled={isLoading}>
      {isLoading ? "Inserting..." : "Insert Test Properties"}
    </Button>
  )
}