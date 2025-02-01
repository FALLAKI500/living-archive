import { Layout } from "@/components/Layout"

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
      </div>
    </Layout>
  )
}