import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PaymentCanceled = () => {
  return (
    <div className="container py-10 max-w-lg">
      <Helmet>
        <title>Payment Canceled — IdeaSoop</title>
        <meta name="description" content="Your payment was canceled. You can try again anytime." />
        <link rel="canonical" href="/payment-canceled" />
      </Helmet>
      <Card>
        <CardContent className="p-6 space-y-3">
          <h1 className="text-2xl font-semibold">Payment Canceled</h1>
          <p className="text-sm text-muted-foreground">No charges were made. You can retry whenever you're ready.</p>
          <div className="flex gap-2">
            <Button asChild><Link to="/profile">Back to Profile</Link></Button>
            <Button variant="secondary" asChild><Link to="/hub">Browse Tests</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCanceled;
