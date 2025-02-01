import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

const testProperties = [
  {
    name: "Résidence Al Azhari",
    location: "Casablanca",
    daily_rate: 549, // Calculated from monthly rate
    monthly_rate: 16470,
    pricing_type: "monthly",
    status: "Rented",
    image_url: "https://plan-a.ca/wp-content/uploads/2022/12/4800_paul_pouliot_30207_web-scaled.jpg"
  },
  {
    name: "Villa Bahia",
    location: "Marrakech",
    daily_rate: 640,
    monthly_rate: 19200, // Calculated from daily rate
    pricing_type: "daily",
    status: "Available",
    image_url: "https://stayhere.ma/wp-content/uploads/2022/08/Agdir_stayhere_1_024_220723_%C2%A9HARDLIGHT-scaled.jpg"
  },
  {
    name: "Appartement Zaytouna",
    location: "Tanger",
    daily_rate: 1059,
    monthly_rate: 31770,
    pricing_type: "daily",
    status: "Available",
    image_url: "https://concretise.ch/wp-content/uploads/2022/03/adobestock-329752349-1024x683.jpeg"
  },
  {
    name: "Dar Al Noor",
    location: "Fès",
    daily_rate: 480,
    monthly_rate: 14400,
    pricing_type: "daily",
    status: "Available",
    image_url: "https://www.toulouseimmo9.com/medias/64a52a34988b2-1920.jpg"
  },
  {
    name: "Résidence Saada",
    location: "Rabat",
    daily_rate: 1022,
    monthly_rate: 30660,
    pricing_type: "daily",
    status: "Available",
    image_url: "https://www.toulouseimmo9.com/medias/60a2379023649-1200.jpg"
  }
] as const

export default function Auth() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  const insertTestData = async () => {
    if (!user) {
      toast.error("Please login first")
      return
    }

    try {
      const propertiesToInsert = testProperties.map(property => ({
        ...property,
        user_id: user.id
      }))

      const { error } = await supabase
        .from("properties")
        .insert(propertiesToInsert)

      if (error) throw error

      toast.success("Test properties inserted successfully")
    } catch (error) {
      console.error("Error inserting test data:", error)
      toast.error("Failed to insert test properties")
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Rental Manager Pro
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Streamline your property management with our intuitive platform.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account or sign in
            </p>
          </div>
          <div className="grid gap-6">
            <form action="/auth/sign-in" method="POST">
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <button
                    onClick={insertTestData}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    Insert Test Properties
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}