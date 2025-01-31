import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-6">
          <p className="text-muted-foreground">Welcome to your dashboard!</p>
        </div>
      </div>
    </div>
  );
}