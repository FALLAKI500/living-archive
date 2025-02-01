import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { PropertyStatus } from "@/types/property"

export function TestDataInserter() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const testProperties = [
    {
      name: "Résidence Al Azhari",
      address: "123 Main Street",
      city: "Casablanca",
      daily_rate: 549,
      monthly_rate: 16470,
      num_bedrooms: 3,
      status: "Rented" as PropertyStatus,
      image_url: "https://plan-a.ca/wp-content/uploads/2022/12/4800_paul_pouliot_30207_web-scaled.jpg",
      user_id: user?.id,
      pricing_type: "monthly" as const
    },
    {
      name: "Villa Bahia",
      address: "456 Ocean Drive",
      city: "Marrakech",
      daily_rate: 640,
      monthly_rate: 19200,
      num_bedrooms: 3,
      status: "Available" as PropertyStatus,
      image_url: "https://stayhere.ma/wp-content/uploads/2022/08/Agdir_stayhere_1_024_220723_%C2%A9HARDLIGHT-scaled.jpg",
      user_id: user?.id,
      pricing_type: "monthly" as const
    },
    {
      name: "Appartement Zaytouna",
      address: "789 Mountain View",
      city: "Tanger",
      daily_rate: 1059,
      monthly_rate: 31770,
      num_bedrooms: 3,
      status: "Available",
      image_url: "https://concretise.ch/wp-content/uploads/2022/03/adobestock-329752349-1024x683.jpeg",
      user_id: user?.id
    },
    {
      name: "Dar Al Noor",
      address: "321 Palm Street",
      city: "Fès",
      daily_rate: 480,
      monthly_rate: 14400,
      num_bedrooms: 2,
      status: "Available",
      image_url: "https://www.toulouseimmo9.com/medias/64a52a34988b2-1920.jpg",
      user_id: user?.id
    },
    {
      name: "Résidence Saada",
      address: "654 Garden Road",
      city: "Rabat",
      daily_rate: 1022,
      monthly_rate: 30660,
      num_bedrooms: 3,
      status: "Available",
      image_url: "https://www.toulouseimmo9.com/medias/60a2379023649-1200.jpg",
      user_id: user?.id
    },
    {
      name: "Appartement Al Amal",
      address: "987 Sunset Boulevard",
      city: "Agadir",
      daily_rate: 710,
      monthly_rate: 21300,
      num_bedrooms: 4,
      status: "Rented",
      image_url: "https://www.toulouseimmo9.com/medias/63c7ac4008ae7-1200.jpg",
      user_id: user?.id
    },
    {
      name: "Riad El Fath",
      address: "147 Desert Road",
      city: "Meknès",
      daily_rate: 950,
      monthly_rate: 28500,
      num_bedrooms: 3,
      status: "Available",
      image_url: "https://www.shbarcelona.fr/blog/fr/wp-content/uploads/2016/03/appartement-photo.jpg",
      user_id: user?.id
    },
    {
      name: "Résidence Majorelle",
      address: "258 Beach Avenue",
      city: "Oujda",
      daily_rate: 870,
      monthly_rate: 26100,
      num_bedrooms: 2,
      status: "Rented",
      image_url: "https://www.shbarcelona.fr/blog/fr/wp-content/uploads/2016/03/Photo-appartement-3.jpg",
      user_id: user?.id
    },
    {
      name: "Appartement Andalou",
      address: "369 River Street",
      city: "Essaouira",
      daily_rate: 980,
      monthly_rate: 29400,
      num_bedrooms: 4,
      status: "Available",
      image_url: "https://www.shbarcelona.fr/blog/fr/wp-content/uploads/2016/03/Photo-appartement-2.jpg",
      user_id: user?.id
    },
    {
      name: "Dar Al Yasmine",
      address: "741 Lake View",
      city: "Tetouan",
      daily_rate: 560,
      monthly_rate: 16800,
      num_bedrooms: 2,
      status: "Available",
      image_url: "https://www.shbarcelona.fr/blog/fr/wp-content/uploads/2016/03/Photo-appartement-1.jpg",
      user_id: user?.id
    }
  ]

  const insertTestData = async () => {
    if (!user) {
      toast.error("You must be logged in to insert test data")
      return
    }

    setIsLoading(true)
    const { error } = await supabase.from("properties").insert(testProperties)

    if (error) {
      console.error("Error inserting test data:", error)
      toast.error("Failed to insert test data")
    } else {
      toast.success("Test data inserted successfully")
    }
    setIsLoading(false)
  }

  return (
    <div className="mt-4">
      <Button
        onClick={insertTestData}
        disabled={isLoading || !user}
        className="w-full"
      >
        {isLoading ? "Inserting Test Data..." : "Insert Test Properties"}
      </Button>
    </div>
  )
}
