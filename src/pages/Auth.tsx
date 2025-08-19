import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
    navigate("/", { replace: true });
  };

  const signUp = async () => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to confirm and sign in");
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // navigation handled in sign in, but keep listener initialized first per best practices
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="container py-10 max-w-md">
      <Helmet>
        <title>Login or Sign Up — Refi</title>
        <meta name="description" content="Login or create an account to post tests and earn credits." />
        <link rel="canonical" href="/auth" />
      </Helmet>

      <h1 className="text-3xl font-semibold mb-6">Login / Sign Up</h1>
      <div className="space-y-4 rounded-lg border p-6 bg-card">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e)=> setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e)=> setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div className="flex gap-2">
          <Button onClick={signIn} disabled={loading}>Login</Button>
          <Button variant="secondary" onClick={signUp} disabled={loading}>Sign Up</Button>
        </div>
        <p className="text-xs text-muted-foreground">After signing up, confirm your email to complete registration.</p>
      </div>
    </div>
  );
};

export default Auth;
