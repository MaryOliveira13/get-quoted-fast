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

  // Header Asaas para autenticação do webhook
  const asaasTokenHeader = req.headers.get("asaas-access-token");
  const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN");

  if (!asaasTokenHeader || asaasTokenHeader !== ASAAS_WEBHOOK_TOKEN) {
    console.error("Webhook unauthorized. Token mismatch.");
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }

  try {
    const body = await req.json();
    console.log("Asaas Webhook received event:", body.event, "Payment ID:", body.payment?.id);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payment = body.payment;
    if (!payment) {
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const orderId = payment.externalReference;
    const paymentId = payment.id;

    if (!orderId) {
      console.log("No externalReference found in Asaas payload");
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Log do evento
    await supabase.from("payment_logs").insert({
      order_id: orderId,
      provider: "asaas",
      status: payment.status,
      payload: body,
    });

    // Mapear status Asaas para Power Cell
    let freightStatus = "pending";
    if (body.event === "PAYMENT_CONFIRMED" || body.event === "PAYMENT_RECEIVED") {
      freightStatus = "approved";
    } else if (body.event === "PAYMENT_REJECTED") {
      freightStatus = "rejected";
    } else if (body.event === "PAYMENT_DELETED" || body.event === "PAYMENT_CANCELLED") {
      freightStatus = "cancelled";
    }

    // Atualizar pedido
    const { data: updatedOrder, error: updateErr } = await supabase
      .from("orders")
      .update({
        freight_payment_status: freightStatus,
        payment_id: paymentId,
        payment_provider: "asaas"
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateErr) {
      console.error("Error updating order via webhook:", updateErr);
    }

    // Se aprovado, disparar geração de etiqueta
    if (freightStatus === "approved" && updatedOrder?.label_status !== "generated") {
      console.log("Payment approved! Triggering label for order:", orderId);
      
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
        console.log("Auto label generation result:", labelRes.status, labelData);
      } catch (e) {
        console.error("Auto label generation failed in webhook:", e);
      }
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("asaas-webhook error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
