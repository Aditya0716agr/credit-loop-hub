import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { session_id } = await req.json();
    if (!session_id) return new Response(JSON.stringify({ error: "Missing session_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ ok: false, message: "Payment not completed" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const credits = Number(session.metadata?.credits || 0);
    const orderCurrency = (session.metadata?.currency as string) || (session.currency || "inr");

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey) throw new Error("Service role key not configured");

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      serviceKey,
      { auth: { persistSession: false } }
    );

    // Verify ownership of the order (if exists)
    const { data: order } = await supabaseService
      .from("orders")
      .select("id, user_id, status")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (order && order.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Order does not belong to this user" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Idempotency: if already paid, return ok
    if (order?.status === "paid") {
      return new Response(JSON.stringify({ ok: true, alreadyCredited: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Credit the user's balance
    if (credits > 0) {
      await supabaseService.rpc('adjust_user_credits', { _user_id: user.id, _delta: credits });
    }

    // Update order status
    if (order) {
      await supabaseService.from("orders").update({ status: "paid", currency: orderCurrency }).eq("id", order.id);
    } else {
      // If orders table didn't have a pending row, create a paid record for consistency
      await supabaseService.from("orders").insert({
        user_id: user.id,
        stripe_session_id: session_id,
        amount: session.amount_total ?? null,
        currency: orderCurrency,
        status: "paid",
      });
    }

    return new Response(JSON.stringify({ ok: true, credited: credits }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
