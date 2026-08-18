import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Accept GET (MP verification) and POST (notifications)
  if (req.method === "GET") {
    return new Response("OK", { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body).slice(0, 500));

    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Handle different notification formats
    let paymentId: string | null = null;

    if (body.type === "payment" && body.data?.id) {
      paymentId = String(body.data.id);
    } else if (body.action === "payment.updated" && body.data?.id) {
      paymentId = String(body.data.id);
    } else if (body.action === "payment.created" && body.data?.id) {
      paymentId = String(body.data.id);
    }

    if (!paymentId) {
      console.log("Notification type not handled:", body.type, body.action);
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Fetch payment details from Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
    });

    if (!mpRes.ok) {
      console.error("Failed to fetch payment:", mpRes.status);
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const payment = await mpRes.json();
    console.log("Payment details:", payment.id, payment.status, "ref:", payment.external_reference);

    const orderId = payment.external_reference;
    if (!orderId) {
      console.log("No external_reference found");
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Log webhook
    await supabase.from("payment_logs").insert({
      order_id: orderId,
      provider: "mercadopago",
      status: payment.status,
      payload: {
        payment_id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        payment_method: payment.payment_method_id,
        webhook_action: body.action || body.type,
      },
    });

    // Map MP status to our status
    let freightStatus = "pending";
    if (payment.status === "approved") freightStatus = "approved";
    else if (payment.status === "rejected") freightStatus = "rejected";
    else if (payment.status === "cancelled") freightStatus = "cancelled";
    else if (payment.status === "refunded") freightStatus = "cancelled";
    else if (payment.status === "in_process" || payment.status === "pending") freightStatus = "pending";

    // Update order
    await supabase.from("orders").update({
      freight_payment_status: freightStatus,
      mp_payment_id: String(payment.id),
    }).eq("id", orderId);

    // If approved, trigger label generation
    if (freightStatus === "approved") {
      console.log("Payment approved! Triggering label generation for order:", orderId);

      // Check if label already generated
      const { data: order } = await supabase
        .from("orders")
        .select("label_status")
        .eq("id", orderId)
        .single();

      if (order && order.label_status !== "generated") {
        try {
          const labelRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-label`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({ order_id: orderId }),
          });
          const labelData = await labelRes.json();
          console.log("Label generation result:", labelRes.status, JSON.stringify(labelData).slice(0, 300));
        } catch (e) {
          console.error("Label generation failed:", e);
          await supabase.from("orders").update({ label_status: "failed" }).eq("id", orderId);
        }
      }
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("OK", { status: 200, headers: corsHeaders });
  }
});
