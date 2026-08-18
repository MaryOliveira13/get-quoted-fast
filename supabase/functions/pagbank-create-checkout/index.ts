import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { order_id } = body;

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "order_id é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const PAGBANK_TOKEN = Deno.env.get("PAGBANK_TOKEN");
    if (!PAGBANK_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Configuração ausente: PAGBANK_TOKEN" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const IS_SANDBOX = true; 
    const PAGBANK_API_URL = IS_SANDBOX
      ? "https://sandbox.api.pagseguro.com"
      : "https://api.pagseguro.com";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ error: "Pedido não encontrado" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (order.freight_payment_status === "approved") {
      return new Response(JSON.stringify({ error: "Frete já foi pago" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amount = Number(order.shipping_amount);
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Valor do frete inválido" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const amountCents = Math.round(amount * 100);
    const origin = req.headers.get("origin") || "https://get-quoted-fast.lovable.app";

    const pagbankBody = {
      reference_id: order_id,
      customer: {
        name: order.customer_name || "Cliente",
        email: order.customer_email || "cliente@powercell.com.br",
        tax_id: order.cpf?.replace(/\D/g, "") || "",
        phones: [
          {
            country: "55",
            area: order.customer_phone?.replace(/\D/g, "").substring(0, 2) || "00",
            number: order.customer_phone?.replace(/\D/g, "").substring(2, 11) || "000000000",
            type: "MOBILE",
          },
        ],
      },
      items: [
        {
          reference_id: `FRETE-${order_id}`,
          name: `Serviço Power Cell - Frete Pedido #${order_id.substring(0, 8)}`,
          quantity: 1,
          unit_amount: amountCents,
        },
      ],
      redirect_url: `${origin}/frete-pago?order_id=${order_id}`,
      notification_urls: [
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/pagbank-webhook`,
      ],
    };

    const pbRes = await fetch(`${PAGBANK_API_URL}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAGBANK_TOKEN}`,
      },
      body: JSON.stringify(pagbankBody),
    });

    const pbData = await pbRes.json();

    if (!pbRes.ok) {
      console.error("PagBank error:", JSON.stringify(pbData));
      return new Response(
        JSON.stringify({
          error: "Erro ao criar checkout no PagBank",
          details: pbData.error_messages || "Erro desconhecido",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payLink = pbData.links?.find((l: any) => l.rel === "PAY")?.href;

    if (!payLink) {
      return new Response(
        JSON.stringify({ error: "Link de pagamento não retornado pelo PagBank" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    await supabase
      .from("orders")
      .update({
        payment_id: pbData.id,
        payment_provider: "pagbank",
      })
      .eq("id", order_id);

    await supabase.from("payment_logs").insert({
      order_id,
      provider: "pagbank",
      status: "created",
      payload: { checkout_id: pbData.id, link: payLink },
    });

    return new Response(JSON.stringify({ redirect_url: payLink }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("pagbank-create-checkout error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
