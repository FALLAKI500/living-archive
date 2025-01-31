import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import type { Property, CreatePropertyInput } from "@/types/property"
import { PropertyInput } from "./PropertyInput"
import { PropertyStatusDropdown } from "./PropertyStatusDropdown"

interface PropertyFormProps {
  property?: Property
}

export function PropertyForm({ property }: PropertyFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const form = useForm<CreatePropertyInput>({
    defaultValues: {
      name: property?.name ?? "",
      location: property?.location ?? "",
      price: property?.price ?? 0,
      status: property?.status ?? "Available",
      image_url: property?.image_url ?? "",
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: CreatePropertyInput) => {
      if (!user) throw new Error("User must be logged in")
      setIsLoading(true)
      
      if (property) {
        const { error } = await supabase
          .from("properties")
          .update(values)
          .eq("id", property.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("properties")
          .insert([{ ...values, user_id: user.id }])
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] })
      toast.success(
        property ? "Property updated successfully" : "Property added successfully"
      )
      form.reset()
    },
    onError: (error) => {
      console.error("Error saving property:", error)
      toast.error("Failed to save property")
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  function onSubmit(values: CreatePropertyInput) {
    mutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PropertyInput
          form={form}
          name="name"
          label="Name"
          placeholder="Property name"
        />
        <PropertyInput
          form={form}
          name="location"
          label="Location"
          placeholder="Property location"
        />
        <PropertyInput
          form={form}
          name="price"
          label="Price per month"
          placeholder="Price"
          type="number"
        />
        <PropertyStatusDropdown form={form} />
        <PropertyInput
          form={form}
          name="image_url"
          label="Image URL"
          placeholder="Image URL (optional)"
          required={false}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : property ? "Update Property" : "Add Property"}
        </Button>
      </form>
    </Form>
  )
}