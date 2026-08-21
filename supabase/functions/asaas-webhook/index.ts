import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token",
};

const ASAAS_BASE_URL = "https://api.asaas.com/v3";

function asaasHeaders() {
  return {
    accept: "application/json",
    "content-type": "application/json",
    "User-Agent": "PowerCell/1.0",
    access_token: (Deno.env.get("ASAAS_API_KEY") ?? "").trim(),
  };
}

const APPROVED_EVENTS = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED", "PAYMENT_APPROVED_BY_RISK_ANALYSIS"];
const PENDING_EVENTS = ["PAYMENT_AWAITING_RISK_ANALYSIS", "PAYMENT_CREATED", "PAYMENT_UPDATED"];
const REJECTED_EVENTS = [
  "PAYMENT_REPROVED_BY_RISK_ANALYSIS",
  "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED",
  "PAYMENT_REJECTED",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const tokenHeader = req.headers.get("asaas-access-token");
  const expected = Deno.env.get("ASAAS_WEBHOOK_TOKEN");
  if (!expected || !tokenHeader || tokenHeader !== expected) {
    console.error("Webhook unauthorized: token mismatch");
    return new Response(JSON.stringify({ success: false, stage: "authentication", message: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const event: string = body?.event ?? "";
    const payment = body?.payment;
    console.log("Asaas webhook event:", event, "payment:", payment?.id);

    if (!payment?.id) {
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Localizar o pedido por payment.id ou externalReference
    let order: any = null;
    const byPayment = await supabase.from("orders").select("*").eq("payment_id", payment.id).maybeSingle();
    order = byPayment.data;

    if (!order && payment.externalReference) {
      const byRef = await supabase
        .from("orders")
        .select("*")
        .eq("id", payment.externalReference)
        .maybeSingle();
      order = byRef.data;
    }

    if (!order) {
      console.log("Webhook: order not found for payment", payment.id);
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    await supabase.from("payment_logs").insert({
      order_id: order.id,
      provider: "asaas",
      status: payment.status ?? event,
      payload: { event, payment_id: payment.id, status: payment.status, stage: "webhook" },
    });

    let newStatus: string | null = null;
    if (APPROVED_EVENTS.includes(event)) newStatus = "approved";
    else if (REJECTED_EVENTS.includes(event)) newStatus = "rejected";
    else if (event === "PAYMENT_REFUNDED") newStatus = "refunded";
    else if (event === "PAYMENT_OVERDUE") newStatus = "overdue";
    else if (event === "PAYMENT_DELETED") newStatus = "cancelled";
    else if (PENDING_EVENTS.includes(event)) newStatus = "pending";

    if (!newStatus) {
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Confirmar diretamente no Asaas antes de aprovar
    if (newStatus === "approved") {
      const verifyRes = await fetch(`${ASAAS_BASE_URL}/payments/${payment.id}`, {
        headers: asaasHeaders(),
      });
      const verified = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok || !["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"].includes(verified?.status)) {
        console.error("Webhook: payment not confirmed on Asaas", verifyRes.status, verified?.status);
        return new Response("OK", { status: 200, headers: corsHeaders });
      }
    }

    // Idempotência: não reprocessar o mesmo status
    if (order.freight_payment_status === newStatus && newStatus !== "approved") {
      return new Response("OK", { status: 200, headers: corsHeaders });
    }
    if (
      newStatus === "pending" &&
      ["approved", "paid", "refunded"].includes(order.freight_payment_status)
    ) {
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    await supabase
      .from("orders")
      .update({
        freight_payment_status: newStatus,
        payment_id: payment.id,
        payment_provider: "asaas",
        payment_external_reference: payment.externalReference ?? order.id,
      })
      .eq("id", order.id);

    if (newStatus === "approved" && order.label_status !== "generated") {
      try {
        const labelRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-label`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ order_id: order.id }),
        });
        console.log("Label generation status:", labelRes.status);
      } catch (e) {
        console.error("Auto label generation failed:", e);
      }
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("asaas-webhook error:", error);
    return new Response(JSON.stringify({ success: false, stage: "payment", message: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
