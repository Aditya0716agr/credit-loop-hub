import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

interface Props { open: boolean; onOpenChange: (open: boolean) => void }

const packs = [
  { amount: 10, price: 5 },
  { amount: 25, price: 10 },
  { amount: 60, price: 20 },
];

const BuyCreditsModal = ({ open, onOpenChange }: Props) => {
  const { addCredits } = useApp();

  const handleBuy = (credits: number) => {
    // Stubbed checkout: add credits locally for demo
    addCredits(credits);
    onOpenChange(false);
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
                <div className="text-sm text-muted-foreground">${p.price}</div>
              </div>
              <Button onClick={() => handleBuy(p.amount)}>Checkout (Demo)</Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Stripe integration coming next — connect your Stripe key to enable real checkout.</p>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCreditsModal;
