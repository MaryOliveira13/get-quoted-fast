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
    const {
      order_id,
      tracking_token,
      card_data,
    } = body;

    if (!order_id || !card_data) {
      return new Response(
        JSON.stringify({ error: "order_id e card_data são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY")!;
    const ASAAS_ENVIRONMENT = Deno.env.get("ASAAS_ENVIRONMENT") || "sandbox";
    const ASAAS_BASE_URL =
      ASAAS_ENVIRONMENT === "production"
        ? "https://www.asaas.com/api/v3"
        : "https://sandbox.asaas.com/api/v3";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Validar pedido e tracking_token
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

    if (tracking_token && order.tracking_token !== tracking_token) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.freight_payment_status === "approved" || order.freight_payment_status === "paid") {
      return new Response(JSON.stringify({ error: "Frete já foi pago" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amount = Number(order.shipping_amount);

    // 2. Criar ou buscar cliente no Asaas
    let asaasCustomerId = order.asaas_customer_id;
    if (!asaasCustomerId) {
        const searchRes = await fetch(`${ASAAS_BASE_URL}/customers?email=${encodeURIComponent(order.customer_email || "")}`, {
            headers: { access_token: ASAAS_API_KEY },
        });
        const searchData = await searchRes.json();
        
        if (searchData.data && searchData.data.length > 0) {
            asaasCustomerId = searchData.data[0].id;
        } else {
            const customerBody = {
                name: order.customer_name || "Cliente Power Cell",
                email: order.customer_email || undefined,
                cpfCnpj: order.cpf?.replace(/\D/g, "") || undefined,
                mobilePhone: order.customer_phone?.replace(/\D/g, "") || undefined,
            };
            const createCustomerRes = await fetch(`${ASAAS_BASE_URL}/customers`, {
                method: "POST",
                headers: { "Content-Type": "application/json", access_token: ASAAS_API_KEY },
                body: JSON.stringify(customerBody),
            });
            const customerData = await createCustomerRes.json();
            if (!createCustomerRes.ok) throw new Error("Erro ao criar cliente Asaas");
            asaasCustomerId = customerData.id;
        }
        await supabase.from("orders").update({ asaas_customer_id: asaasCustomerId }).eq("id", order_id);
    }

    // 3. Criar cobrança via Cartão de Crédito
    const dueDate = new Date().toISOString().split("T")[0];
    
    // Obter IP do pagador (via headers da Edge Function)
    const remoteIp = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    const paymentBody = {
      customer: asaasCustomerId,
      billingType: "CREDIT_CARD",
      value: amount,
      dueDate: dueDate,
      externalReference: order_id,
      description: `Frete Power Cell - ${order.brand} ${order.model}`,
      creditCard: {
        holderName: card_data.holderName,
        number: card_data.number.replace(/\s/g, ""),
        expiryMonth: card_data.expiryMonth,
        expiryYear: card_data.expiryYear,
        ccv: card_data.ccv,
      },
      creditCardHolderInfo: {
        name: card_data.holderName,
        email: order.customer_email,
        cpfCnpj: card_data.holderCpf.replace(/\D/g, ""),
        postalCode: order.customer_cep?.replace(/\D/g, ""),
        addressNumber: order.customer_number || "SN",
        mobilePhone: order.customer_phone?.replace(/\D/g, ""),
      },
      remoteIp: remoteIp,
    };

    const createPaymentRes = await fetch(`${ASAAS_BASE_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify(paymentBody),
    });

    const paymentData = await createPaymentRes.json();
    
    // LOG sanitizado
    await supabase.from("payment_logs").insert({
        order_id: order_id,
        provider: "asaas",
        status: paymentData.status || "error",
        payload: { 
            payment_id: paymentData.id, 
            status: paymentData.status, 
            billingType: "CREDIT_CARD",
            errors: paymentData.errors 
        }
    });

    if (!createPaymentRes.ok) {
      console.error("Erro no pagamento Asaas:", paymentData);
      return new Response(JSON.stringify({ 
          error: paymentData.errors?.[0]?.description || "Pagamento recusado.",
          status: "rejected"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Tratar sucesso
    if (paymentData.status === "CONFIRMED" || paymentData.status === "RECEIVED") {
        await supabase.from("orders").update({
            payment_id: paymentData.id,
            payment_provider: "asaas",
            freight_payment_status: "approved",
        }).eq("id", order_id);

        // Disparar etiqueta
        try {
            fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-label`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                },
                body: JSON.stringify({ order_id }),
            });
        } catch (e) {
            console.error("Erro ao disparar etiqueta:", e);
        }
    }

    return new Response(
      JSON.stringify({
        payment_id: paymentData.id,
        status: paymentData.status === "CONFIRMED" || paymentData.status === "RECEIVED" ? "approved" : "pending",
        details: paymentData.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("asaas-pay-credit-card error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
