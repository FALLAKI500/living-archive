import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash, MapPin, Image } from "lucide-react"

// Temporary mock data - will be replaced with Supabase data
const mockProperties = [
  {
    id: 1,
    name: "Luxury Villa",
    location: "Beachfront",
    price: 2500,
    status: "Available",
    imageUrl: "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
  },
  {
    id: 2,
    name: "Modern Apartment",
    location: "Downtown",
    price: 1500,
    status: "Rented",
    imageUrl: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
  },
]

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState("")
  const [properties, setProperties] = useState(mockProperties)

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map((property) => (
          <Card key={property.id}>
            <div className="relative aspect-video">
              <img
                src={property.imageUrl}
                alt={property.name}
                className="absolute inset-0 h-full w-full object-cover rounded-t-lg"
              />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{property.name}</span>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    property.status === "Available"
                      ? "bg-success/15 text-success"
                      : "bg-warning/15 text-warning"
                  }`}
                >
                  {property.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {property.location}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">${property.price}</span>
                  <div className="space-x-2">
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}