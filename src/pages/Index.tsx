import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "@/components/ui/carousel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/context/AppContext";
import { Clock, Coins, MousePointerClick, Megaphone, UserRound } from "lucide-react";
import BuyCreditsModal from "@/components/credits/BuyCreditsModal";

// Utilities
const useCountUp = (to: number, duration = 1200) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.floor(p * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return val;
};

const useInView = (opts?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting && setInView(true));
    }, opts ?? { threshold: 0.1 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [opts]);
  return { ref, inView } as const;
};

// Quick role-select signup modal
const QuickSignupModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const [role, setRole] = useState<"tester" | "founder">("tester");
  const navigate = useNavigate();
  const proceed = () => {
    const redirect = role === "tester" ? "/hub" : "/post";
    navigate(`/auth?role=${role}&redirect=${encodeURIComponent(redirect)}`);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get started free</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Choose your role to continue. You can switch later.</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRole("tester")}
              className={`group rounded-md border p-4 text-left transition ${role === "tester" ? "ring-2 ring-ring" : "hover:bg-accent"}`}
              aria-pressed={role === "tester"}
            >
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="font-medium">Tester</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Try products and earn credits.</p>
            </button>
            <button
              onClick={() => setRole("founder")}
              className={`group rounded-md border p-4 text-left transition ${role === "founder" ? "ring-2 ring-ring" : "hover:bg-accent"}`}
              aria-pressed={role === "founder"}
            >
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="font-medium">Founder</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Post tests, get fast feedback.</p>
            </button>
          </div>
          <Button onClick={proceed} className="w-full">Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Small test card for carousel
const MiniTestCard = ({
  title,
  reward,
  time,
  meta,
  onTry,
}: {
  title: string;
  reward: number;
  time: number;
  meta: string;
  onTry: () => void;
}) => (
  <Card className="hover:-translate-y-0.5 transition-transform">
    <CardContent className="p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium line-clamp-1" title={title}>{title}</h3>
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Badge className="text-[10px]">{reward} cr</Badge>
          <Badge variant="secondary" className="text-[10px]"><Clock className="mr-1 h-3 w-3" />{time}m</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-1">{meta}</p>
      <div className="pt-1">
        <Button size="sm" onClick={onTry} className="h-8 px-3">Try</Button>
      </div>
    </CardContent>
  </Card>
);

const Index = () => {
  const navigate = useNavigate();
  const { tests } = useApp();
  const [signupOpen, setSignupOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [testsCarouselApi, setTestsCarouselApi] = useState<CarouselApi | null>(null);

  // Live counters (simple demo logic using existing data)
  const testsTodayTarget = Math.max(3, tests.length);
  const activeNowTarget = 24 + (tests.length % 7) * 3;
  const creditsWeekTarget = tests.reduce((sum, t: any) => sum + (Number(t.reward) || 0), 0) + 120;
  const testsToday = useCountUp(testsTodayTarget);
  const activeNow = useCountUp(activeNowTarget);
  const creditsWeek = useCountUp(creditsWeekTarget);

  // Filters for carousel
  const [timeFilter, setTimeFilter] = useState<"All" | "5-10" | "10-20" | "20+">("All");
  const coerceMinutes = (v: any) => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    }
    return 0;
  };
  const filtered = useMemo(() => {
    return tests.filter((t: any) => {
      const mins = coerceMinutes(t.timeRequired);
      if (timeFilter === "All") return true;
      if (timeFilter === "5-10") return mins >= 5 && mins <= 10;
      if (timeFilter === "10-20") return mins > 10 && mins <= 20;
      return mins > 20;
    });
  }, [tests, timeFilter]);

  // Auto-scroll tests carousel leftwards with pause on hover
  useEffect(() => {
    if (!testsCarouselApi) return;
    if (paused) return;
    const id = setInterval(() => {
      testsCarouselApi.scrollNext();
    }, 2500);
    return () => clearInterval(id);
  }, [testsCarouselApi, paused]);

  // Sticky CTA visibility (hide when near bottom footer)
  const [showSticky, setShowSticky] = useState(true);
  useEffect(() => {
    const onScroll = () => {
      const fromBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      setShowSticky(fromBottom > 300);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const benefitsIn = useInView();

  return (
    <div>
      <Helmet>
        <title>IdeaSoop Beta — Get Tested Fast</title>
        <meta name="description" content="Post tests, get real feedback, and earn credits. Minimal, fast, and focused." />
        <link rel="canonical" href="/" />
      </Helmet>

      {/* Hero */}
      <header className="container py-12 md:py-20">
        <div className="grid md:grid-cols-1 gap-8 items-center">
          {/* Left copy */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Get your startup tested. Earn credits helping others.
            </h1>
            <p className="text-lg text-muted-foreground max-w-prose">
              A minimalist hub where founders post beta tests and testers earn collaboration credits.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button onClick={() => setSignupOpen(true)} className="hover-scale shadow" aria-label="Start Testing">
                Start Testing
              </Button>
              <span className="text-xs text-muted-foreground text-center sm:px-2">
                New users get 20 free credits — limited time.
              </span>
              <Button variant="outline" onClick={() => setSignupOpen(true)} aria-label="Post Your First Test">
                Post Your First Test
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <button onClick={() => setBuyOpen(true)} className="underline underline-offset-4">Buy credits</button>
            </div>
          </div>

        </div>
      </header>

      {/* Live Activity Bar */}
      <section className="border-y bg-muted/30">
        <div className="container py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight">{testsToday}</div>
            <div className="text-sm text-muted-foreground">Tests posted today</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight">{activeNow}</div>
            <div className="text-sm text-muted-foreground">Active testers now</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight">{creditsWeek}</div>
            <div className="text-sm text-muted-foreground">Credits earned this week</div>
          </div>
        </div>
      </section>

      <main className="space-y-16">
        {/* How it works */}
        <section className="container pt-12">
          <h2 className="text-xl font-semibold mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[{
              t: "Post a Test",
              d: "Create a brief, set time and credit reward.",
              I: Megaphone
            }, {
              t: "Test & Submit",
              d: "Follow steps, submit feedback, get approved.",
              I: MousePointerClick
            }, {
              t: "Earn & Spend Credits",
              d: "Your credits transfer automatically on approval.",
              I: Coins
            }].map((s, i) => (
              <Card key={i} className="group transition-transform hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <s.I className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                    <h3 className="font-medium">{s.t}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{s.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* See what's being tested */}
        <section className="container">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">See What’s Being Tested</h2>
            <div className="flex gap-2">
              {["All", "5-10", "10-20", "20+"].map((f) => (
                <Button
                  key={f}
                  variant={timeFilter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeFilter(f as any)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {/* Carousel of tests */}
          <Carousel className="w-full" opts={{ loop: true }} setApi={setTestsCarouselApi} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <CarouselContent className="-ml-2">
              {filtered.slice(0, 12).map((t: any) => (
                <CarouselItem key={t.id} className="pl-2 basis-3/4 sm:basis-1/2 lg:basis-1/3">
                  <MiniTestCard
                    title={t.title}
                    reward={Number(t.reward) || 0}
                    time={coerceMinutes(t.timeRequired)}
                    meta={`Posted recently • ${t.testersNeeded ? t.testersNeeded : 3} testers needed`}
                    onTry={() => navigate(`/test/${t.id}`)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-between mt-3">
              <CarouselPrevious className="static translate-x-0" />
              <CarouselNext className="static translate-x-0" />
            </div>
          </Carousel>
        </section>

        {/* Benefits strip */}
        <section ref={benefitsIn.ref} className="container">
          <div className={`grid md:grid-cols-3 gap-4 transition-all ${benefitsIn.inView ? "animate-fade-in" : "opacity-0 translate-y-2"}`}>
            {[{
              t: "Actionable feedback in 48h",
              d: "Most tests complete within two days."
            }, {
              t: "Real testers, real results",
              d: "No agencies — direct signals from peers."
            }, {
              t: "No hassle",
              d: "Simple briefs, instant payouts in credits."
            }].map((b, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-medium mb-1">{b.t}</h3>
                  <p className="text-sm text-muted-foreground">{b.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="container pb-24">
          <h2 className="text-xl font-semibold mb-6">What People Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[{
              q: "Got useful feedback in a day. Helped us fix onboarding.",
              n: "Priya S.", r: "Founder"
            }, {
              q: "Testing takes 5–10 minutes and the credits add up fast.",
              n: "Daniel K.", r: "Tester"
            }, {
              q: "Clear tasks, quick approvals. Super smooth.",
              n: "Maya R.", r: "Founder"
            }].map((t, i) => (
              <Card key={i} className="hover:-translate-y-0.5 transition-transform">
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm">“{t.q}”</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="grayscale">
                      <AvatarFallback>{t.n.split(" ").map((p) => p[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{t.n}</div>
                      <div className="text-xs text-muted-foreground">{t.r}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky Footer CTA (desktop) */}
      {showSticky && (
        <div className="fixed bottom-0 inset-x-0 hidden md:block border-t bg-foreground text-background">
          <div className="container py-3 flex items-center justify-center gap-4">
            <span className="text-sm">Start free — get 20 credits today</span>
            <Button variant="secondary" onClick={() => setSignupOpen(true)} className="hover-scale">
              Get Started Free
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-xs underline underline-offset-4 opacity-80 hover:opacity-100">How credits work</button>
              </TooltipTrigger>
              <TooltipContent>
                Earn by testing. Spend to post tests. 1 credit ≈ 1 tester-minute.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar (mobile) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 p-3">
        <div className="container flex items-center gap-3">
          <Button className="flex-1" onClick={() => setSignupOpen(true)}>Start Testing</Button>
          <Button variant="outline" onClick={() => navigate("/hub")} aria-label="View tests">
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      <QuickSignupModal open={signupOpen} onOpenChange={setSignupOpen} />
      <BuyCreditsModal open={buyOpen} onOpenChange={setBuyOpen} />
    </div>
  );
};

export default Index;
