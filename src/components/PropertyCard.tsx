import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PropertyForm } from "@/components/PropertyForm"
import { AddInvoiceForm } from "@/components/AddInvoiceForm"
import { Edit, MapPin, Trash, Receipt } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import type { Property } from "@/types/property"

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [pricingType, setPricingType] = useState<"daily" | "monthly">(property.pricing_type || "monthly")
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      setIsDeleteLoading(true)
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", property.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] })
      toast.success("Property deleted successfully")
    },
    onError: (error) => {
      console.error("Error deleting property:", error)
      toast.error("Failed to delete property")
    },
    onSettled: () => {
      setIsDeleteLoading(false)
    },
  })

  const displayPrice = pricingType === "daily" 
    ? property.daily_rate 
    : (property.monthly_rate || property.daily_rate * 30)

  return (
    <Card>
      <div className="relative aspect-video">
        <img
          src={property.image_url || "/placeholder.svg"}
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
            {property.address}{property.city ? `, ${property.city}` : ''}
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant={pricingType === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => setPricingType("daily")}
              >
                Daily Rate
              </Button>
              <Button
                variant={pricingType === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setPricingType("monthly")}
              >
                Monthly Rate
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {displayPrice.toLocaleString()} MAD/{pricingType === "daily" ? "day" : "month"}
              </span>
              <div className="space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Property</DialogTitle>
                    </DialogHeader>
                    <PropertyForm property={property} />
                  </DialogContent>
                </Dialog>
                <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Receipt className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Invoice</DialogTitle>
                    </DialogHeader>
                    <AddInvoiceForm
                      propertyId={property.id}
                      tenantId="tenant-id" // This should be replaced with actual tenant ID
                      onSuccess={() => setIsInvoiceDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteMutation.mutate()}
                  disabled={isDeleteLoading}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}