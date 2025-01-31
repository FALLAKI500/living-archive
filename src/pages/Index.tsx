import { Card } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Building, Calendar, DollarSign, Users } from "lucide-react";

const stats = [
  {
    title: "Total Properties",
    value: "0",
    icon: Building,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Active Bookings",
    value: "0",
    icon: Calendar,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Total Revenue",
    value: "$0",
    icon: DollarSign,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    title: "Total Customers",
    value: "0",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
  },
];

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your rental property management dashboard
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <h2 className="text-2xl font-bold">{stat.value}</h2>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Recent Bookings</h3>
            <p className="text-muted-foreground text-sm">No bookings yet</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Revenue Overview</h3>
            <p className="text-muted-foreground text-sm">No data available</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;