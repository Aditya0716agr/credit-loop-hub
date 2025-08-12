import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const Signup = () => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    if (!name || !email || !password) return toast.error("Please fill all required fields");
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl, data: { name, bio } },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to confirm and sign in");
  };

  return (
    <div className="container py-10 max-w-md">
      <Helmet>
        <title>Sign Up — IdeaSoop</title>
        <meta name="description" content="Create your IdeaSoop account to test products or post your first test." />
        <link rel="canonical" href="/signup" />
      </Helmet>

      <h1 className="text-3xl font-semibold mb-6">Create your account</h1>
      <div className="space-y-4 rounded-lg border p-6 bg-card">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e)=> setName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Short bio</Label>
          <Textarea id="bio" value={bio} onChange={(e)=> setBio(e.target.value)} placeholder="Tell us a bit about you (optional)" rows={3} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e)=> setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e)=> setPassword(e.target.value)} placeholder="Create a strong password" />
        </div>
        <Button className="w-full" onClick={signUp} disabled={loading}>Create account</Button>
        <p className="text-xs text-muted-foreground">By signing up, you agree to our terms and privacy policy.</p>
        <p className="text-sm text-muted-foreground">Already have an account? <Link className="underline" to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Signup;
