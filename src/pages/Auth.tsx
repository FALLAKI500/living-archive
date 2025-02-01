import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signUpUser } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const { toast } = useToast();

  // Add test function for overdue invoice
  const testOverdueEmail = async () => {
    try {
      setLoading(true);
      // Get the first invoice to test with
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .limit(1)
        .single();

      if (fetchError) throw fetchError;

      if (!invoice) {
        toast({
          title: "No invoice found",
          description: "Please create an invoice first",
          variant: "destructive",
        });
        return;
      }

      // Update the invoice status to trigger the email
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status: 'overdue' })
        .eq('id', invoice.id);

      if (updateError) throw updateError;

      toast({
        title: "Test initiated",
        description: "Check the email logs table for results",
      });

      console.log("Test completed - Invoice ID:", invoice.id);
    } catch (error) {
      console.error("Test error:", error);
      setError(error instanceof Error ? error.message : "Failed to run test");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!email || !password) {
      setError("Email and password are required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    try {
      setLoading(true);
      await signIn(email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Invalid credentials. Please try signing up if you don't have an account."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    try {
      setLoading(true);
      await signUpUser(email, password);
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your sign up.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Sign up error:", error);
      setError(error instanceof Error ? error.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const renderForm = (type: "signin" | "signup") => (
    <form onSubmit={type === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${type}-email`}>Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            id={`${type}-email`}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 transition-shadow duration-200 focus:ring-2 focus:ring-primary"
            required
            disabled={loading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${type}-password`}>Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            id={`${type}-password`}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 transition-shadow duration-200 focus:ring-2 focus:ring-primary"
            required
            disabled={loading}
          />
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full transition-all duration-200 hover:scale-[1.02]" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {type === "signin" ? "Signing in..." : "Signing up..."}
          </>
        ) : (
          type === "signin" ? "Sign In" : "Sign Up"
        )}
      </Button>
    </form>
  );

  if (loading && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          Please wait...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="signin" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin">
              {renderForm("signin")}
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={testOverdueEmail}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Overdue Email"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              {renderForm("signup")}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
