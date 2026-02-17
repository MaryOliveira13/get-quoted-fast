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
  if (!res.ok || !data.access_token) {
    console.error("PayPal auth error:", data);
    throw new Error("Falha na autenticação PayPal");
  }
  return data.access_token;
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
      .select("shipping_amount")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Pedido não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amount = Number(order.shipping_amount).toFixed(2);
    const appBaseUrl = Deno.env.get("APP_BASE_URL") || "https://get-quoted-fast.lovable.app";

    const paypalToken = await getPayPalAccessToken();
    const base = Deno.env.get("PAYPAL_BASE_URL")!;

    const ppRes = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paypalToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: order_id,
          custom_id: order_id,
          invoice_id: order_id,
          amount: {
            currency_code: "BRL",
            value: amount,
          },
          description: "Frete de envio - Power Cell",
        }],
        application_context: {
          brand_name: "Power Cell",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${appBaseUrl}/frete-pago?order_id=${order_id}`,
          cancel_url: `${appBaseUrl}/frete-cancelado?order_id=${order_id}`,
        },
      }),
    });

    const ppData = await ppRes.json();
    if (!ppRes.ok) {
      console.error("PayPal create order error:", JSON.stringify(ppData));
      return new Response(JSON.stringify({ error: "Erro ao criar ordem PayPal", details: ppData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save paypal_order_id
    await supabase.from("orders").update({
      paypal_order_id: ppData.id,
    }).eq("id", order_id);

    const approvalLink = ppData.links?.find((l: any) => l.rel === "approve")?.href;

    return new Response(JSON.stringify({
      paypal_order_id: ppData.id,
      approval_url: approvalLink,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("paypal-create-order error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
