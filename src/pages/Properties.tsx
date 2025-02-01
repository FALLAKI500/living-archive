import { useQuery } from "@tanstack/react-query"
import { Layout } from "@/components/Layout"
import { PropertyCard } from "@/components/PropertyCard"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PropertyForm } from "@/components/PropertyForm"
import { Plus } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { TestDataInserter } from "@/components/TestDataInserter"
import type { Property } from "@/types/property"

export default function Properties() {
  const { user } = useAuth()

  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as Property[]
    },
    enabled: !!user,
  })

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading properties...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
            <p className="text-muted-foreground">
              Manage your rental properties
            </p>
          </div>
          <div className="flex gap-4">
            <TestDataInserter />
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Property</DialogTitle>
                </DialogHeader>
                <PropertyForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties?.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </Layout>
  )
}