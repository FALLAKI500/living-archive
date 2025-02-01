import { useState } from "react"
import { useForm } from "react-hook-form"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import type { Property } from "@/types/property"

interface AuthFormData {
  email: string
  password: string
}

const testProperties = [
  {
    name: "Résidence Al Azhari",
    location: "Casablanca",
    price: 665,
    status: "Available" as const,
    image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
  },
  {
    name: "Villa Bahia",
    location: "Marrakech",
    price: 1101,
    status: "Available" as const,
    image_url: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7"
  },
  {
    name: "Appartement Zaytouna",
    location: "Tanger",
    price: 749,
    status: "Rented" as const,
    image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"
  }
]

const insertTestData = async (userId: string) => {
  const propertiesWithUserId = testProperties.map(property => ({
    ...property,
    user_id: userId
  }))

  const { data, error } = await supabase
    .from("properties")
    .insert(propertiesWithUserId)
    .select()

  if (error) {
    console.error("Error inserting data:", error)
    toast.error("Failed to insert test data")
  } else {
    console.log("Data inserted successfully:", data)
    toast.success("Test properties added successfully")
  }
}

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const { register, handleSubmit } = useForm<AuthFormData>()

  const onSubmit = async (data: AuthFormData) => {
    try {
      setIsLoading(true)
      await signIn(data.email, data.password)
      
      // After successful sign in, get the user and insert test data
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await insertTestData(user.id)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          Property Management System
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to access your dashboard
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                {...register("email")}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register("password")}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}