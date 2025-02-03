import { Layout } from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Expenses() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your property expenses
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expenses Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Expenses tracking coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}