import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function callGenerateLabel(supabaseUrl: string, orderId: string) {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/generate-label`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({ order_id: orderId }),
    });
    const data = await res.json();
    console.log("generate-label from webhook:", JSON.stringify(data));
  } catch (err) {
    console.error("generate-label call failed:", err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const eventType = body?.event_type;
    console.log("PayPal webhook event:", eventType);

    if (eventType !== "PAYMENT.CAPTURE.COMPLETED") {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract order_id from custom_id
    const resource = body?.resource;
    const customId = resource?.custom_id || resource?.invoice_id;

    if (!customId) {
      console.error("No custom_id in webhook resource");
      return new Response(JSON.stringify({ error: "No custom_id" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order } = await supabase
      .from("orders")
      .select("id, freight_payment_status, label_status")
      .eq("id", customId)
      .single();

    if (!order) {
      console.error("Order not found for webhook:", customId);
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const captureId = resource?.id || null;

    if (order.freight_payment_status !== "paid") {
      await supabase.from("orders").update({
        freight_payment_status: "paid",
        paypal_capture_id: captureId,
      }).eq("id", order.id);
    }

    if (order.label_status !== "generated") {
      await callGenerateLabel(Deno.env.get("SUPABASE_URL")!, order.id);
    }

    return new Response(JSON.stringify({ received: true, order_id: order.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("paypal-webhook error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
