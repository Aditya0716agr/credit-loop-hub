import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp, ProjectType } from "@/context/AppContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BuyCreditsModal from "@/components/credits/BuyCreditsModal";

const PostTest = () => {
  const { user, credits, postTest } = useApp();
  const [buyOpen, setBuyOpen] = useState(false);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<ProjectType>("Website");
  const [goals, setGoals] = useState("");
  const [timeRequired, setTimeRequired] = useState<5|10|15|30>(10);
  const [reward, setReward] = useState<number>(2);
  const [link, setLink] = useState("");
  const [nda, setNda] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = postTest({ title, type, goals, timeRequired, reward, link, nda });
    if (res) navigate(`/test/${res.id}`);
    else if (reward > credits) setBuyOpen(true);
  };

  return (
    <div className="container py-10 space-y-8">
      <Helmet>
        <title>Post a Test — IdeaSoop Beta Hub</title>
        <meta name="description" content="Publish a beta test request and reward testers with credits." />
        <link rel="canonical" href="/post" />
      </Helmet>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Post Test Request</h1>
        <div className="text-sm text-muted-foreground">Credit balance: <span className="font-medium text-foreground">{credits}</span></div>
      </div>

      {!user && (
        <div className="rounded-md border p-4 text-sm">You are not signed in. You can still fill the form, but you must sign in to post.</div>
      )}

      <form className="grid gap-6 max-w-2xl" onSubmit={submit}>
        <div className="grid gap-2">
          <Label htmlFor="title">Project Title</Label>
          <Input id="title" value={title} onChange={(e)=> setTitle(e.target.value)} required />
        </div>

        <div className="grid gap-2">
          <Label>Project Type</Label>
          <Select value={type} onValueChange={(v)=> setType(v as ProjectType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["Website","App","Service Flow","Other"] as const).map((t)=> (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="goals">Testing Goals</Label>
          <Textarea id="goals" value={goals} onChange={(e)=> setGoals(e.target.value)} required rows={4} />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Time Required</Label>
            <Select value={String(timeRequired)} onValueChange={(v)=> setTimeRequired(Number(v) as 5|10|15|30)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[5,10,15,30].map((t)=> (
                  <SelectItem key={t} value={String(t)}>{t} min</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reward">Credit Reward (min 2)</Label>
            <Input id="reward" type="number" min={2} value={reward} onChange={(e)=> setReward(Number(e.target.value))} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="link">Link to demo/prototype</Label>
            <Input id="link" type="url" value={link} onChange={(e)=> setLink(e.target.value)} required />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="nda" checked={nda} onCheckedChange={(v)=> setNda(Boolean(v))} />
          <Label htmlFor="nda">Include NDA acknowledgement</Label>
        </div>

        {reward > credits && (
          <div className="rounded-md border p-4 text-sm flex items-center justify-between">
            <div>
              <div className="font-medium">Need Credits?</div>
              <div className="text-muted-foreground">You don't have enough credits to post this test.</div>
            </div>
            <Button type="button" variant="secondary" onClick={()=> setBuyOpen(true)}>Buy Credits</Button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit">Post Test</Button>
          <span className="text-sm text-muted-foreground">Posting will deduct <span className="font-medium text-foreground">{reward}</span> credits.</span>
        </div>
      </form>

      <BuyCreditsModal open={buyOpen} onOpenChange={setBuyOpen} />
    </div>
  );
};

export default PostTest;
