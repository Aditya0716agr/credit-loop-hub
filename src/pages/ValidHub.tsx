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

const ValidHub = () => {
  const { user, credits, postTest } = useApp();
  const [buyOpen, setBuyOpen] = useState(false);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<ProjectType>("Website");
  const [goals, setGoals] = useState("");
  const [timeRequired, setTimeRequired] = useState<5|10|15|30>(10);
  const [link, setLink] = useState("");
  const [nda, setNda] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Derive founder cost and tester reward based on time
    const derived = (() => {
      if (timeRequired <= 10) return { founder: 15, per: 1, testers: 3 };
      if (timeRequired > 10 && timeRequired <= 20) return { founder: 30, per: 2, testers: 5 };
      return { founder: 60, per: 3, testers: 10 };
    })();

    if (credits < derived.founder) {
      setBuyOpen(true);
      return;
    }

    const res = await postTest({ title, type, goals, timeRequired, reward: derived.per, link, nda });
    if (res) navigate(`/test/${res.id}`);
  };

  return (
    <div className="container py-10 space-y-8">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>ValidHub — Post Beta Test Requests | Refi</title>
        <meta name="title" content="ValidHub — Post Beta Test Requests | Refi" />
        <meta name="description" content="Create and publish beta test requests on ValidHub. Connect with qualified testers, validate your product ideas, and get valuable user feedback. Start testing your website, app, or service flow today." />
        <meta name="keywords" content="beta testing, user testing, product validation, user feedback, website testing, app testing, service testing, product development, user research, UX testing" />
        <meta name="author" content="Refi" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="/validhub" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="/validhub" />
        <meta property="og:title" content="ValidHub — Post Beta Test Requests | Refi" />
        <meta property="og:description" content="Create and publish beta test requests on ValidHub. Connect with qualified testers, validate your product ideas, and get valuable user feedback." />
        <meta property="og:image" content="/og-validhub.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Refi" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="/validhub" />
        <meta property="twitter:title" content="ValidHub — Post Beta Test Requests | Refi" />
        <meta property="twitter:description" content="Create and publish beta test requests on ValidHub. Connect with qualified testers, validate your product ideas, and get valuable user feedback." />
        <meta property="twitter:image" content="/og-validhub.jpg" />
        
        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "ValidHub — Post Beta Test Requests",
            "description": "Create and publish beta test requests on ValidHub. Connect with qualified testers, validate your product ideas, and get valuable user feedback.",
            "url": "/validhub",
            "mainEntity": {
              "@type": "Service",
              "name": "Beta Testing Platform",
              "description": "Platform for posting beta test requests and connecting with testers",
              "provider": {
                "@type": "Organization",
                "name": "Refi"
              },
              "serviceType": "Beta Testing",
              "areaServed": "Worldwide"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "ValidHub",
                  "item": "/validhub"
                }
              ]
            }
          })}
        </script>
      </Helmet>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">ValidHub — Post Test Request</h1>
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
          {/* Reward is derived; show read-only summary instead of input */}
          <div className="grid gap-2">
            <Label>Derived Reward & Testers</Label>
            <div className="rounded-md border px-3 py-2 text-sm">
              {(() => {
                const d = timeRequired <= 10 ? { founder: 15, per: 1, testers: 3 } : (timeRequired <= 20 ? { founder: 30, per: 2, testers: 5 } : { founder: 60, per: 3, testers: 10 });
                return (
                  <div>
                    <div>Tester reward: <span className="font-medium">{d.per} cr</span> each</div>
                    <div>Max testers: <span className="font-medium">{d.testers}</span></div>
                    <div>Founder cost: <span className="font-medium">{d.founder} cr</span></div>
                  </div>
                );
              })()}
            </div>
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

        {(() => {
          const d = timeRequired <= 10 ? { founder: 15 } : (timeRequired <= 20 ? { founder: 30 } : { founder: 60 });
          return d.founder > credits;
        })() && (
          <div className="rounded-md border p-4 text-sm flex items-center justify-between">
            <div>
              <div className="font-medium">Need Credits?</div>
              <div className="text-muted-foreground">You don't have enough credits to cover the founder cost for this test.</div>
            </div>
            <Button type="button" variant="secondary" onClick={()=> setBuyOpen(true)}>Buy Credits</Button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit">Post Test</Button>
          <span className="text-sm text-muted-foreground">Posting will deduct <span className="font-medium text-foreground">{(() => timeRequired <= 10 ? 15 : (timeRequired <= 20 ? 30 : 60))()}</span> credits.</span>
        </div>
      </form>

      <BuyCreditsModal open={buyOpen} onOpenChange={setBuyOpen} />
    </div>
  );
};

export default ValidHub;
