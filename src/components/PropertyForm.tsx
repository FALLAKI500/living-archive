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
import { Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const propertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  daily_rate: z.number().min(0, "Daily rate must be a positive number"),
  monthly_rate: z.number().optional(),
  pricing_type: z.enum(["daily", "monthly"]),
  status: z.enum(["Available", "Rented"]),
  image_url: z.string().optional(),
})

interface PropertyFormProps {
  property?: Property
}

export function PropertyForm({ property }: PropertyFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const form = useForm<CreatePropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: property?.name ?? "",
      address: property?.address ?? "",
      city: property?.city ?? "",
      daily_rate: property?.daily_rate ?? 0,
      monthly_rate: property?.monthly_rate ?? 0,
      pricing_type: property?.pricing_type ?? "monthly",
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
        return { type: "update", name: values.name }
      } else {
        const { error } = await supabase
          .from("properties")
          .insert([{ ...values, user_id: user.id }])
        if (error) throw error
        return { type: "create", name: values.name }
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] })
      if (result.type === "update") {
        toast.success(`Property "${result.name}" updated successfully`, {
          description: "Your changes have been saved.",
          duration: 3000,
        })
      } else {
        toast.success(`Property "${result.name}" added successfully`, {
          description: "The new property has been created.",
          duration: 3000,
        })
      }
      form.reset()
    },
    onError: (error) => {
      console.error("Error saving property:", error)
      toast.error("Failed to save property", {
        description: error instanceof Error ? error.message : "Please try again later",
        duration: 5000,
      })
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
          name="address"
          label="Address"
          placeholder="Property address"
        />
        <PropertyInput
          form={form}
          name="city"
          label="City"
          placeholder="Property city"
          required={false}
        />
        <PropertyInput
          form={form}
          name="daily_rate"
          label="Daily Rate"
          placeholder="Daily rate"
          type="number"
        />
        <PropertyInput
          form={form}
          name="monthly_rate"
          label="Monthly Rate"
          placeholder="Monthly rate (optional)"
          type="number"
          required={false}
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
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {property ? "Updating..." : "Adding..."}
            </>
          ) : (
            property ? "Update Property" : "Add Property"
          )}
        </Button>
      </form>
    </Form>
  )
}