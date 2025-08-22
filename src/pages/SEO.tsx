import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Zap, 
  Target, 
  Coins, 
  Clock, 
  Star, 
  CheckCircle, 
  TrendingUp,
  Shield,
  Globe,
  Smartphone,
  Laptop,
  Building,
  Rocket
} from "lucide-react";

const SEO = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Helmet>
        <title>Refi - User Testing Platform | Get Your Startup Tested Fast</title>
        <meta name="description" content="Refi is the fastest user testing platform for startups. Post tests, get real feedback in hours, and earn credits by testing others' products. Join 1000+ active testers today." />
        <meta name="keywords" content="user testing, startup testing, product validation, user feedback, beta testing, app testing, website testing, user research, UX testing, startup feedback" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Refi - User Testing Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Refi - User Testing Platform | Get Your Startup Tested Fast" />
        <meta property="og:description" content="Post tests, get real feedback in hours, and earn credits by testing others' products. Join 1000+ active testers today." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://refi.com" />
        <meta property="og:site_name" content="Refi" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Refi - User Testing Platform" />
        <meta name="twitter:description" content="Get your startup tested fast. Post tests, get real feedback in hours." />
        
        {/* Additional SEO */}
        <meta name="application-name" content="Refi" />
        <meta name="theme-color" content="#000000" />
        <link rel="canonical" href="https://refi.com" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Refi",
            "description": "User testing platform for startups to get fast feedback and validate ideas",
            "url": "https://refi.com",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Free to start with 20 credits"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "150"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="container py-16 md:py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 text-sm font-medium">
            <Rocket className="h-4 w-4" />
            <span>User Testing Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            User Testing Platform
            <span className="block text-primary">for Startups</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Refi is the fastest way to validate your startup ideas with real user feedback. 
            Post tests, get actionable insights in hours, and build products your users actually want.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
              <Link to="/">Start Testing Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
              <Link to="/hub">Browse Tests</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="container py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Why Choose Refi for User Testing?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fast, reliable, and cost-effective user testing that actually helps you build better products.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Lightning Fast Results",
              description: "Get actionable feedback in 48 hours or less. No more waiting weeks for insights.",
              features: ["48-hour average response", "Real-time notifications", "Quick approval process"]
            },
            {
              icon: Users,
              title: "1000+ Active Testers",
              description: "Connect with genuine users, not agencies or bots. Get authentic, valuable feedback.",
              features: ["Verified testers", "Diverse user base", "Quality control"]
            },
            {
              icon: Coins,
              title: "Credit-Based Economy",
              description: "Test to earn, spend to validate. Fair system that keeps the community engaged.",
              features: ["20 free credits", "Earn by testing", "Transparent pricing"]
            }
          ].map((feature, index) => (
            <Card key={index} className="group hover:-translate-y-2 transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16 bg-muted/30 rounded-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How User Testing Works on Refi
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple 3-step process to get real user feedback and validate your ideas.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "Post Your Test",
              description: "Create a clear test brief with specific tasks and requirements. Set time limits and credit rewards.",
              icon: Target
            },
            {
              step: "02",
              title: "Get Real Feedback",
              description: "Testers complete your tasks and submit detailed feedback within hours, not days.",
              icon: Users
            },
            {
              step: "03",
              title: "Earn & Spend Credits",
              description: "Credits transfer automatically. Test others' products to earn more credits for your own tests.",
              icon: Coins
            }
          ].map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="relative">
                <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                  {step.step}
                </div>
                <div className="absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/30 hidden md:block"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="container py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            What Can You Test on Refi?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From mobile apps to websites, validate every aspect of your product with real users.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Smartphone, title: "Mobile Apps", description: "Test app onboarding, features, and user flows" },
            { icon: Laptop, title: "Websites", description: "Validate landing pages, checkout flows, and UX" },
            { icon: Building, title: "SaaS Products", description: "Test new features, pricing pages, and workflows" },
            { icon: Globe, title: "Landing Pages", description: "Validate copy, design, and conversion elements" }
          ].map((item, index) => (
            <Card key={index} className="text-center hover:-translate-y-1 transition-transform">
              <CardContent className="p-6 space-y-3">
                <div className="bg-primary/10 p-3 rounded-lg w-fit mx-auto">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing & Credits */}
      <section className="container py-16 bg-muted/30 rounded-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free with 20 credits. Earn more by testing others' products.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { time: "5-10 minutes", credits: "3-5", description: "Quick usability tests, simple flows" },
              { time: "10-20 minutes", credits: "5-8", description: "Feature testing, moderate complexity" },
              { time: "20+ minutes", credits: "8-15", description: "Comprehensive testing, complex tasks" }
            ].map((tier, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">{tier.credits}</div>
                    <div className="text-sm text-muted-foreground">credits</div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{tier.time}</h3>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Star className="h-4 w-4 mr-2" />
              20 Free Credits to Start
            </Badge>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to Validate Your Startup?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of founders who are building better products with real user feedback.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
              <Link to="/">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
              <Link to="/hub">Browse Available Tests</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="container py-8 border-t">
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Refi - The fastest user testing platform for startups. 
            Built by{" "}
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
      </section>
    </div>
  );
};

export default SEO;
