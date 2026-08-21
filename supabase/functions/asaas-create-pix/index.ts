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
    const { order_id, tracking_token, billing_type } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "order_id é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY")!;
    const ASAAS_ENVIRONMENT = "production";
    const ASAAS_BASE_URL = ASAAS_ENVIRONMENT === "production" 
      ? "https://api.asaas.com/v3" 
      : "https://api-sandbox.asaas.com/v3";

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
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Valor do frete inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
          notificationDisabled: true,
        };

        const createCustomerRes = await fetch(`${ASAAS_BASE_URL}/customers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            access_token: ASAAS_API_KEY,
          },
          body: JSON.stringify(customerBody),
        });

        const customerData = await createCustomerRes.json();
        if (!createCustomerRes.ok) {
          console.error("Erro ao criar cliente Asaas:", customerData);
          throw new Error("Erro ao criar cliente no gateway de pagamento");
        }
        asaasCustomerId = customerData.id;
      }

      await supabase
        .from("orders")
        .update({ asaas_customer_id: asaasCustomerId })
        .eq("id", order_id);
    }

    const type = billing_type || "PIX";

    // 3. Verificar se já existe cobrança pendente para este pedido e tipo
    if (order.payment_id && order.payment_provider === "asaas") {
        const checkPaymentRes = await fetch(`${ASAAS_BASE_URL}/payments/${order.payment_id}`, {
            headers: { access_token: ASAAS_API_KEY },
        });
        if (checkPaymentRes.ok) {
            const paymentData = await checkPaymentRes.json();
            if (paymentData.billingType === type && paymentData.status === "PENDING") {
                // Reutilizar
                let responseData: any = {
                    payment_id: paymentData.id,
                    status: paymentData.status,
                    expirationDate: paymentData.dueDate,
                    invoiceUrl: paymentData.invoiceUrl,
                };

                if (type === "PIX") {
                    const qrRes = await fetch(`${ASAAS_BASE_URL}/payments/${paymentData.id}/pixQrCode`, {
                        headers: { access_token: ASAAS_API_KEY },
                    });
                    const qrData = await qrRes.json();
                    responseData.qr_code_base64 = qrData.encodedImage;
                    responseData.qr_code = qrData.payload;
                }
                
                return new Response(JSON.stringify(responseData), {
                    status: 200,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
        }
    }

    // 4. Criar cobrança
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const paymentBody = {
      customer: asaasCustomerId,
      billingType: type,
      value: amount,
      dueDate: dueDate.toISOString().split("T")[0],
      externalReference: order_id,
      description: `Frete Power Cell - ${order.brand} ${order.model}`,
      postalService: false,
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
    if (!createPaymentRes.ok) {
      console.error("Erro ao criar pagamento Asaas:", paymentData);
      return new Response(JSON.stringify({ error: paymentData.errors?.[0]?.description || "Erro ao criar cobrança" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let responseData: any = {
      payment_id: paymentData.id,
      status: paymentData.status,
      expirationDate: paymentData.dueDate,
      invoiceUrl: paymentData.invoiceUrl,
    };

    // 5. Se for PIX, buscar QR Code
    if (type === "PIX") {
      const qrRes = await fetch(`${ASAAS_BASE_URL}/payments/${paymentData.id}/pixQrCode`, {
        headers: { access_token: ASAAS_API_KEY },
      });
      const qrData = await qrRes.json();
      responseData.qr_code_base64 = qrData.encodedImage;
      responseData.qr_code = qrData.payload;
    }

    // 6. Atualizar pedido
    await supabase
      .from("orders")
      .update({
        payment_id: paymentData.id,
        payment_provider: "asaas",
        freight_payment_status: "pending",
      })
      .eq("id", order_id);

    return new Response(
      JSON.stringify(responseData),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("asaas-create-pix error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
