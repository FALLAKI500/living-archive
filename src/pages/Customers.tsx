import { Layout } from "@/components/Layout"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Customers() {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["customer-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data
    },
  })

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships
          </p>
        </div>

        {isLoading ? (
          <p>Loading customers...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profiles?.map((profile) => (
              <Card key={profile.id}>
                <CardHeader>
                  <CardTitle>{profile.full_name || "Unnamed Customer"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profile.company_name}</p>
                  <p>{profile.phone}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}