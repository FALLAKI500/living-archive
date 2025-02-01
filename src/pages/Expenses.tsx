import { Layout } from "@/components/Layout";

const Expenses = () => {
  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
        <p className="text-muted-foreground">
          Track and manage your property-related expenses.
        </p>
      </div>
    </Layout>
  );
};

export default Expenses;