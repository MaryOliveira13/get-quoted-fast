import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getPayPalAccessToken(): Promise<string> {
  const base = Deno.env.get("PAYPAL_BASE_URL")!;
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID")!;
  const secret = Deno.env.get("PAYPAL_CLIENT_SECRET")!;

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error("Falha na autenticação PayPal");
  return data.access_token;
}

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
    console.log("generate-label response:", JSON.stringify(data));
    return data;
  } catch (err) {
    console.error("generate-label call failed:", err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("paypal_order_id, freight_payment_status")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Pedido não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Already paid — skip capture
    if (order.freight_payment_status === "paid") {
      return new Response(JSON.stringify({ status: "already_paid" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order.paypal_order_id) {
      return new Response(JSON.stringify({ error: "PayPal order não encontrado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paypalToken = await getPayPalAccessToken();
    const base = Deno.env.get("PAYPAL_BASE_URL")!;

    const captureRes = await fetch(`${base}/v2/checkout/orders/${order.paypal_order_id}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paypalToken}`,
        "Content-Type": "application/json",
      },
    });

    const captureData = await captureRes.json();
    console.log("PayPal capture status:", captureRes.status, JSON.stringify(captureData).slice(0, 500));

    if (!captureRes.ok && captureRes.status !== 422) {
      return new Response(JSON.stringify({ error: "Erro ao capturar pagamento", details: captureData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const status = captureData.status;
    // 422 means already captured
    if (status === "COMPLETED" || captureRes.status === 422) {
      const captureId = captureData?.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;

      await supabase.from("orders").update({
        freight_payment_status: "paid",
        paypal_capture_id: captureId,
      }).eq("id", order_id);

      // Auto-generate label
      await callGenerateLabel(Deno.env.get("SUPABASE_URL")!, order_id);

      return new Response(JSON.stringify({ status: "paid", capture_id: captureId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Not completed
    await supabase.from("orders").update({
      freight_payment_status: "failed",
    }).eq("id", order_id);

    return new Response(JSON.stringify({ status: "failed", paypal_status: status }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("paypal-capture-order error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
