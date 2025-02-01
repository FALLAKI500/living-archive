import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Layout } from "@/components/Layout"
import { PropertyCard } from "@/components/PropertyCard"
import { PropertyForm } from "@/components/PropertyForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import type { Property } from "@/types/property"

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity })
  const [selectedStatus, setSelectedStatus] = useState<"all" | "Available" | "Rented">("all")
  const queryClient = useQueryClient()

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as Property[]
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["properties"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const propertyPrice = property.pricing_type === 'daily' ? property.daily_rate : property.monthly_rate
    const matchesPrice =
      propertyPrice >= priceRange.min && propertyPrice <= priceRange.max
    
    const matchesStatus =
      selectedStatus === "all" || property.status === selectedStatus

    return matchesSearch && matchesPrice && matchesStatus
  })

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground animate-pulse">
            Loading properties...
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Properties</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Property</DialogTitle>
              </DialogHeader>
              <PropertyForm />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="number"
              placeholder="Min price"
              className="w-full sm:w-24"
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
            />
            <Input
              type="number"
              placeholder="Max price"
              className="w-full sm:w-24"
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || Infinity }))}
            />
            <select
              className="w-full sm:w-auto rounded-md border px-3 py-2"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as "all" | "Available" | "Rented")}
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </Layout>
  )
}