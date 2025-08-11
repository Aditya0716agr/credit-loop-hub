import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    const session_id = params.get("session_id");
    if (!session_id) { setResult("Missing session ID."); setVerifying(false); return; }

    (async () => {
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { session_id }
      });
      setVerifying(false);
      if (error) {
        toast.error(error.message);
        setResult("Verification failed.");
        return;
      }
      toast.success("Payment verified. Credits added to your account.");
      setResult("Success! Your credits have been added.");
    })();
  }, [params]);

  return (
    <div className="container py-10 max-w-lg">
      <Helmet>
        <title>Payment Success — IdeaSoop</title>
        <meta name="description" content="Your payment was successful. Credits have been added to your account." />
        <link rel="canonical" href="/payment-success" />
      </Helmet>
      <Card>
        <CardContent className="p-6 space-y-3">
          <h1 className="text-2xl font-semibold">Payment Success</h1>
          <p className="text-sm text-muted-foreground">{verifying ? "Verifying your payment..." : result}</p>
          <Button asChild>
            <Link to="/profile">Go to Profile</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
