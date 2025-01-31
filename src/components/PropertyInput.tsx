import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import type { CreatePropertyInput } from "@/types/property"

interface PropertyInputProps {
  form: UseFormReturn<CreatePropertyInput>
  name: keyof CreatePropertyInput
  label: string
  placeholder: string
  type?: string
  required?: boolean
}

export function PropertyInput({
  form,
  name,
  label,
  placeholder,
  type = "text",
  required = true,
}: PropertyInputProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              onChange={(e) =>
                field.onChange(
                  type === "number" ? Number(e.target.value) : e.target.value
                )
              }
              required={required}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}