import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { order_id, card_data } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: order, error: orderErr } = await supabase.from("orders").select("*").eq("id", order_id).single();
    if (orderErr || !order) throw new Error("Pedido não encontrado");

    const PAGBANK_TOKEN = Deno.env.get("PAGBANK_TOKEN");
    const ENV = Deno.env.get("PAGBANK_ENVIRONMENT") || "sandbox";
    const API_URL = ENV === "sandbox" ? "https://sandbox.api.pagseguro.com" : "https://api.pagseguro.com";

    const amountCents = Math.round(order.shipping_amount * 100);

    const body = {
      reference_id: order_id,
      customer: {
        name: order.customer_name,
        email: order.customer_email || "cliente@powercell.com.br",
        tax_id: order.cpf.replace(/\D/g, ""),
        phones: [{ country: "55", area: order.customer_phone.replace(/\D/g, "").substring(0, 2), number: order.customer_phone.replace(/\D/g, "").substring(2), type: "MOBILE" }]
      },
      items: [{ reference_id: `FRETE-${order_id}`, name: "Frete Power Cell", quantity: 1, unit_amount: amountCents }],
      charges: [{
        reference_id: `CHARGE-${order_id}`,
        description: "Frete Power Cell",
        amount: { value: amountCents, currency: "BRL" },
        payment_method: {
          type: "CREDIT_CARD",
          installments: 1,
          capture: true,
          card: {
            number: card_data.number.replace(/\s/g, ""),
            exp_month: card_data.exp_month,
            exp_year: card_data.exp_year,
            security_code: card_data.cvv,
            holder: { name: card_data.holder_name }
          }
        },
        notification_urls: [`${Deno.env.get("SUPABASE_URL")}/functions/v1/pagbank-webhook`]
      }]
    };

    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${PAGBANK_TOKEN}` },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));

    const status = data.charges?.[0]?.status;
    return new Response(JSON.stringify({ status }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
