import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div>
      <Helmet>
        <title>IdeaSoop Beta Hub — Get Your Startup Tested</title>
        <meta name="description" content="Founders post beta tests. Testers earn credits by helping others. Minimal, fast, and focused." />
        <link rel="canonical" href="/" />
      </Helmet>

      <header className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Get Your Startup Tested. Earn Credits Helping Others.</h1>
          <p className="text-lg text-muted-foreground">A minimalist hub where founders post beta testing requests and testers earn collaboration credits.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild>
              <Link to="/hub">I Want to Test</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/post">I Want My Idea Tested</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="space-y-16">
        <section className="container grid md:grid-cols-3 gap-6">
          {[{t:"Founders post test requests",d:"Create a quick brief, set time and credit reward."},{t:"Testers complete tasks & give feedback",d:"Follow steps, submit feedback, get approved."},{t:"Credits are transferred automatically",d:"On approval, credits move from requester to tester."}].map((s,i)=> (
            <Card key={i} className="transition-transform hover:-translate-y-0.5">
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-2">Step {i+1}</div>
                <h3 className="font-medium mb-2">{s.t}</h3>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="container">
          <h2 className="text-xl font-semibold mb-4">What People Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map((i)=> (
              <Card key={i}><CardContent className="p-6 text-sm text-muted-foreground">Success story coming soon.</CardContent></Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;

