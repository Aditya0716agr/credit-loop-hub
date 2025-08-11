import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
interface Props { open: boolean; onOpenChange: (open: boolean) => void }

const packs = [
  { amount: 10, price: 399 },
  { amount: 25, price: 899 },
  { amount: 60, price: 1999 },
];

const BuyCreditsModal = ({ open, onOpenChange }: Props) => {
  const handleBuy = async (credits: number) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { credits, currency: "inr" },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
        onOpenChange(false);
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (e: any) {
      toast.error(e.message || "Payment error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy Credits</DialogTitle>
          <DialogDescription>Credits never expire. 1 credit ≈ one collaboration/test action.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {packs.map((p) => (
            <div key={p.amount} className="flex items-center justify-between rounded-md border p-4">
              <div>
                <div className="font-medium">{p.amount} Credits</div>
                <div className="text-sm text-muted-foreground">₹{p.price}</div>
              </div>
              <Button onClick={() => handleBuy(p.amount)}>Buy with Stripe</Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Secure checkout by Stripe. Payments in INR supported.</p>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCreditsModal;
