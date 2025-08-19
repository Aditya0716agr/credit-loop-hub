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
import { Clock, Coins, MousePointerClick, Megaphone, UserRound, Users, Zap, Target, Rocket, TrendingUp, Star } from "lucide-react";
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
    <div className="relative overflow-hidden">
      {/* Animated Background Lights */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-2/3 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse animation-delay-3000"></div>
      </div>

      <Helmet>
        <title>Refi — Get Tested Fast</title>
        <meta name="description" content="Post tests, get real feedback, and earn credits. Minimal, fast, and focused." />
        <link rel="canonical" href="/" />
      </Helmet>

      {/* Hero */}
      <header className="container py-12 md:py-20 relative">
        <div className="grid md:grid-cols-1 gap-8 items-center">
          {/* Hero Content */}
          <div className="space-y-8 animate-fade-in text-center max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 text-sm font-medium">
                <Rocket className="h-4 w-4" />
                <span>Now in Beta — Get Early Access</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                Get your startup tested. 
                <span className="block text-primary">Earn credits helping others.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join the fastest-growing community of founders and testers. Get real feedback in hours, not weeks.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => setSignupOpen(true)} size="lg" className="hover-scale shadow-lg text-lg px-8 py-6 h-auto" aria-label="Start Testing">
                <Zap className="h-5 w-5 mr-2" />
                Start Testing Free
              </Button>
              <Button variant="outline" size="lg" onClick={() => setSignupOpen(true)} className="text-lg px-8 py-6 h-auto" aria-label="Post Your First Test">
                <Target className="h-5 w-5 mr-2" />
                Post Your First Test
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>1000+ Active Testers</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>48h Average Response</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>20 Free Credits</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                by{" "}
                <a 
                  href="https://www.ideasoop.online/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  ideasoop labs
                </a>
              </p>
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

      <main className="space-y-24 relative">
        {/* Get Initial Users Section */}
        <section className="container">
          <div className="text-center space-y-6 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Get Your Initial Users Fast</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don't waste months building in isolation. Get real user feedback and validate your ideas within days.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                {[
                  { icon: Target, title: "Launch in Minutes", desc: "Post your test with a simple brief and get started immediately" },
                  { icon: Users, title: "Real Users", desc: "Connect with genuine testers, not bots or agencies" },
                  { icon: Zap, title: "Instant Feedback", desc: "Get actionable insights within 48 hours" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => setSignupOpen(true)} size="lg" className="shadow-lg">
                Get Your First Users Now
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 backdrop-blur-sm border">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Tests</span>
                    <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Live</Badge>
                  </div>
                  <div className="space-y-3">
                    {["Mobile App Onboarding", "Website Checkout Flow", "Feature Usability Test"].map((test, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                        <span className="text-sm">{test}</span>
                        <Badge variant="secondary">{3 + i} testers</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 text-xs text-muted-foreground text-center">
                    Live testing activity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple process, powerful results. Get started in 3 easy steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[{
              t: "Post a Test",
              d: "Create a brief, set time and credit reward.",
              I: Megaphone
            }, {
              t: "Get Real Feedback", 
              d: "Testers complete your tasks and submit detailed feedback within hours.",
              I: MousePointerClick,
              step: "02"
            }, {
              t: "Earn & Spend Credits",
              d: "Credits transfer automatically. Test others' products to earn more.",
              I: Coins,
              step: "03"
            }].map((s, i) => (
              <Card key={i} className="group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl relative overflow-hidden">
                <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10">{s.step}</div>
                <CardContent className="p-8 relative">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <s.I className="h-6 w-6 text-primary transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <h3 className="text-xl font-semibold">{s.t}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{s.d}</p>
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
                    meta={`Posted recently • ${(t.maxTesters ?? (coerceMinutes(t.timeRequired) <= 10 ? 3 : (coerceMinutes(t.timeRequired) <= 20 ? 5 : 10)))} testers needed`}
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

        {/* Enhanced Benefits Section */}
        <section ref={benefitsIn.ref} className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why Choose Refi?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The fastest way to validate ideas and connect with your target audience.
            </p>
          </div>
          
          <div className={`grid md:grid-cols-3 gap-8 transition-all duration-700 ${benefitsIn.inView ? "animate-fade-in" : "opacity-0 translate-y-8"}`}>
            {[{
              t: "Lightning Fast Results",
              d: "Get actionable feedback in 48 hours or less. No more waiting weeks for insights.",
              icon: Zap,
              stat: "48h",
              statLabel: "avg response"
            }, {
              t: "Real Testers, Real Results",
              d: "Connect directly with genuine users, not agencies or bots. Get authentic feedback.",
              icon: Users,
              stat: "1000+",
              statLabel: "active testers"
            }, {
              t: "Credit-Based Economy",
              d: "Test to earn, spend to validate. Fair system that keeps the community engaged.",
              icon: Coins,
              stat: "20",
              statLabel: "free credits"
            }].map((b, i) => (
              <Card key={i} className="group hover:-translate-y-2 transition-all duration-300 hover:shadow-xl border-2 hover:border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-8 relative">
                  <div className="mb-6">
                    <div className="bg-primary/10 p-4 rounded-2xl w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                      <b.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="text-3xl font-bold text-primary">{b.stat}</div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{b.statLabel}</div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{b.t}</h3>
                    <p className="text-muted-foreground leading-relaxed">{b.d}</p>
                  </div>
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

      {/* Enhanced Sticky Footer CTA (desktop) */}
      {showSticky && (
        <div className="fixed bottom-0 inset-x-0 hidden md:block border-t bg-background/95 backdrop-blur-sm shadow-lg">
          <div className="container py-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              <span className="font-medium">Start free — get 20 credits today</span>
            </div>
            <Button onClick={() => setSignupOpen(true)} className="hover-scale shadow-lg">
              <Zap className="h-4 w-4 mr-2" />
              Get Started Free
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-xs underline underline-offset-4 opacity-80 hover:opacity-100 flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  How credits work
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Earn by testing others' products. Spend to get your own tested. 1 credit ≈ 1 tester-minute.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Enhanced Sticky Bottom Bar (mobile) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 p-4 shadow-lg">
        <div className="container flex items-center gap-3">
          <Button className="flex-1 shadow-lg" onClick={() => setSignupOpen(true)}>
            <Zap className="h-4 w-4 mr-2" />
            Start Testing
          </Button>
          <Button variant="outline" onClick={() => navigate("/hub")} aria-label="View tests" className="shadow">
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
