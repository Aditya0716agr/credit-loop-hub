import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signIn = async () => {
    if (!email || !password) return toast.error("Please enter email and password");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate("/", { replace: true });
  };

  return (
    <div className="container py-10 max-w-md">
      <Helmet>
        <title>Login — IdeaSoop</title>
        <meta name="description" content="Login to IdeaSoop to start testing or post a test." />
        <link rel="canonical" href="/login" />
      </Helmet>

      <h1 className="text-3xl font-semibold mb-6">Login</h1>
      <div className="space-y-4 rounded-lg border p-6 bg-card">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e)=> setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e)=> setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <Button className="w-full" onClick={signIn} disabled={loading}>Login</Button>
        <p className="text-sm text-muted-foreground">Don’t have an account? <Link className="underline" to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
};

export default Login;
