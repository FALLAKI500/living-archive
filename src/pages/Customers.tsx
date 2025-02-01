import { Layout } from "@/components/Layout";

const Customers = () => {
  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customer relationships and tenant information.
        </p>
      </div>
    </Layout>
  );
};

export default Customers;