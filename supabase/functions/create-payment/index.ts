import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PACKS = [
  { credits: 10, price: { inr: 39900, usd: 500 } },  // ₹399 or $5.00
  { credits: 25, price: { inr: 89900, usd: 1000 } }, // ₹899 or $10.00
  { credits: 60, price: { inr: 199900, usd: 2000 } }, // ₹1,999 or $20.00
] as const;

type Currency = "inr" | "usd";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: auth } = await supabase.auth.getUser(token);
    const user = auth.user;
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { credits, currency = "inr" as Currency } = await req.json();
    const selected = PACKS.find((p) => p.credits === Number(credits));
    if (!selected) {
      return new Response(JSON.stringify({ error: "Invalid credits pack" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });

    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "https://qqgzldxoirboudlimllz.supabase.co";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency,
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: `Credits Pack — ${selected.credits}` },
            unit_amount: selected.price[currency],
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-canceled`,
      metadata: {
        user_id: user.id,
        credits: String(selected.credits),
        currency,
      },
    });

    // Optional: create an order row using service role key (bypasses RLS)
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (serviceKey) {
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        serviceKey,
        { auth: { persistSession: false } }
      );
      await supabaseService.from("orders").insert({
        user_id: user.id,
        stripe_session_id: session.id,
        amount: selected.price[currency],
        currency,
        status: "pending",
      });
    }

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
