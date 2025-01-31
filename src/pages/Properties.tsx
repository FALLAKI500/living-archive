import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
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
import { Plus, Search } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import type { Property } from "@/types/property"

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity })
  const [selectedStatus, setSelectedStatus] = useState<"all" | "Available" | "Rented">("all")

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
          // Refetch properties when changes occur
          window.location.reload()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPrice =
      property.price >= priceRange.min && property.price <= priceRange.max
    
    const matchesStatus =
      selectedStatus === "all" || property.status === selectedStatus

    return matchesSearch && matchesPrice && matchesStatus
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
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

        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Min price"
              className="w-24"
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
            />
            <Input
              type="number"
              placeholder="Max price"
              className="w-24"
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || Infinity }))}
            />
            <select
              className="rounded-md border px-3"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as "all" | "Available" | "Rented")}
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div>Loading properties...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}