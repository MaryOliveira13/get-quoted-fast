import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { order_id, payment_type, token, payment_method_id, issuer_id, installments, payer_email } = body;

    if (!order_id || !payment_type) {
      return new Response(JSON.stringify({ error: "order_id e payment_type são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Pedido não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.freight_payment_status === "approved") {
      return new Response(JSON.stringify({ error: "Frete já foi pago" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amount = Number(order.shipping_amount);
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Valor do frete inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build payment body for Mercado Pago
    const paymentBody: any = {
      transaction_amount: amount,
      external_reference: order_id,
      description: `Frete de envio - ${order.brand} ${order.model}`,
      payer: {
        email: payer_email || order.customer_email || "cliente@powercell.com.br",
        first_name: order.customer_name?.split(" ")[0] || "Cliente",
        last_name: order.customer_name?.split(" ").slice(1).join(" ") || "PowerCell",
        identification: {
          type: "CPF",
          number: order.cpf?.replace(/\D/g, "") || "",
        },
      },
    };

    if (payment_type === "pix") {
      paymentBody.payment_method_id = "pix";
    } else if (payment_type === "credit_card") {
      if (!token) {
        return new Response(JSON.stringify({ error: "Token do cartão é obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      paymentBody.token = token;
      paymentBody.payment_method_id = payment_method_id;
      paymentBody.issuer_id = issuer_id;
      paymentBody.installments = installments || 1;
    } else {
      return new Response(JSON.stringify({ error: "payment_type inválido (use 'pix' ou 'credit_card')" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create payment in Mercado Pago
    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "X-Idempotency-Key": `${order_id}-${payment_type}-${Date.now()}`,
      },
      body: JSON.stringify(paymentBody),
    });

    const mpData = await mpRes.json();
    console.log("MP payment response status:", mpRes.status, "id:", mpData.id, "status:", mpData.status);

    if (!mpRes.ok || mpData.error) {
      console.error("MP error:", JSON.stringify(mpData).slice(0, 1000));
      return new Response(JSON.stringify({ 
        error: "Erro ao criar pagamento no Mercado Pago",
        details: mpData.message || mpData.error || "Erro desconhecido",
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update order with MP payment ID
    await supabase.from("orders").update({
      mp_payment_id: String(mpData.id),
      mp_external_reference: order_id,
      payment_provider: "mercadopago",
    }).eq("id", order_id);

    // Log payment
    await supabase.from("payment_logs").insert({
      order_id,
      provider: "mercadopago",
      status: mpData.status,
      payload: { payment_id: mpData.id, status: mpData.status, payment_type },
    });

    // If card payment was immediately approved
    if (mpData.status === "approved") {
      await supabase.from("orders").update({
        freight_payment_status: "approved",
      }).eq("id", order_id);

      // Trigger label generation
      try {
        const labelRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-label`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ order_id }),
        });
        const labelData = await labelRes.json();
        console.log("Auto label generation:", labelRes.status, labelData);
      } catch (e) {
        console.error("Auto label generation failed:", e);
      }
    }

    // Build response
    const response: any = {
      payment_id: mpData.id,
      status: mpData.status,
      status_detail: mpData.status_detail,
    };

    if (payment_type === "pix") {
      const txData = mpData.point_of_interaction?.transaction_data;
      response.qr_code_base64 = txData?.qr_code_base64 || "";
      response.qr_code = txData?.qr_code || "";
      response.ticket_url = txData?.ticket_url || "";
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("mercadopago-create-payment error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
