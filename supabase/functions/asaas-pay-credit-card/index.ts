import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ASAAS_BASE_URL = "https://api.asaas.com/v3";

function asaasHeaders() {
  return {
    accept: "application/json",
    "content-type": "application/json",
    "User-Agent": "PowerCell/1.0",
    access_token: (Deno.env.get("ASAAS_PRODUCTION_API_KEY_V2") ?? "").trim(),
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function fail(stage: string, httpStatus: number, message: string, code?: string) {
  return json({ success: false, stage, httpStatus, code: code ?? null, message }, httpStatus);
}

function asaasError(data: any): { code: string | null; message: string } {
  const first = data?.errors?.[0];
  return {
    code: first?.code ?? null,
    message: first?.description ?? "Pagamento não autorizado pelo gateway.",
  };
}

function mapStatus(s?: string): "approved" | "pending" | "rejected" {
  switch (s) {
    case "CONFIRMED":
    case "RECEIVED":
    case "RECEIVED_IN_CASH":
      return "approved";
    case "PENDING":
    case "AWAITING_RISK_ANALYSIS":
      return "pending";
    default:
      return "rejected";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!(Deno.env.get("ASAAS_PRODUCTION_API_KEY_V2") ?? "").trim()) {
      return fail("authentication", 500, "ASAAS_PRODUCTION_API_KEY_V2 não configurada.");
    }

    const body = await req.json();
    const { order_id, tracking_token, card_data, installments } = body ?? {};

    if (!order_id || !card_data) {
      return fail("creditCard", 400, "order_id e dados do cartão são obrigatórios.");
    }

    const installmentCount = Math.max(1, Math.min(12, Number(installments) || 1));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .maybeSingle();

    if (orderErr || !order) return fail("creditCard", 404, "Pedido não encontrado.");
    if (tracking_token && order.tracking_token !== tracking_token) {
      return fail("creditCard", 403, "Token inválido para este pedido.");
    }
    if (["approved", "paid"].includes(order.freight_payment_status)) {
      return fail("creditCard", 400, "O frete deste pedido já foi pago.");
    }

    const amount = Number(order.shipping_amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return fail("creditCard", 400, "Valor do frete inválido para este pedido.");
    }

    // ---------- CLIENTE ----------
    let customerId: string | null = order.asaas_customer_id || null;
    if (customerId) {
      const checkRes = await fetch(`${ASAAS_BASE_URL}/customers/${customerId}`, {
        headers: asaasHeaders(),
      });
      if (!checkRes.ok) customerId = null;
    }

    if (!customerId) {
      const cpf = (order.cpf || "").replace(/\D/g, "");
      const phone = (order.customer_phone || "").replace(/\D/g, "");
      const customerBody: Record<string, unknown> = {
        name: order.customer_name || "Cliente Power Cell",
        externalReference: order.id,
      };
      if (cpf) customerBody.cpfCnpj = cpf;
      if (order.customer_email) customerBody.email = order.customer_email;
      if (phone) customerBody.mobilePhone = phone;

      const createCustomerRes = await fetch(`${ASAAS_BASE_URL}/customers`, {
        method: "POST",
        headers: asaasHeaders(),
        body: JSON.stringify(customerBody),
      });
      const customerData = await createCustomerRes.json().catch(() => ({}));
      if (!createCustomerRes.ok || !customerData?.id) {
        const e = asaasError(customerData);
        console.error("Asaas customer error", createCustomerRes.status, e.code);
        return fail("customer", createCustomerRes.status || 500, e.message, e.code ?? undefined);
      }
      customerId = customerData.id;
      await supabase.from("orders").update({ asaas_customer_id: customerId }).eq("id", order.id);
    }

    // ---------- COBRANÇA CARTÃO ----------
    const remoteIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "";

    const holderPhone = (order.customer_phone || "").replace(/\D/g, "");
    const paymentBody: Record<string, unknown> = {
      customer: customerId,
      billingType: "CREDIT_CARD",
      dueDate: new Date().toISOString().split("T")[0],
      description: "Frete do pedido Power Cell",
      externalReference: order.id,
      creditCard: {
        holderName: card_data.holderName,
        number: String(card_data.number || "").replace(/\D/g, ""),
        expiryMonth: String(card_data.expiryMonth || "").padStart(2, "0"),
        expiryYear: String(card_data.expiryYear || ""),
        ccv: String(card_data.ccv || ""),
      },
      creditCardHolderInfo: {
        name: card_data.holderName,
        email: order.customer_email || undefined,
        cpfCnpj: String(card_data.holderCpf || order.cpf || "").replace(/\D/g, ""),
        postalCode: (order.customer_cep || "").replace(/\D/g, ""),
        addressNumber: order.customer_number || "SN",
        phone: holderPhone || undefined,
      },
    };
    if (remoteIp) paymentBody.remoteIp = remoteIp;

    if (installmentCount > 1) {
      paymentBody.installmentCount = installmentCount;
      paymentBody.totalValue = amount;
    } else {
      paymentBody.value = amount;
    }

    const createRes = await fetch(`${ASAAS_BASE_URL}/payments`, {
      method: "POST",
      headers: asaasHeaders(),
      body: JSON.stringify(paymentBody),
    });
    const payment = await createRes.json().catch(() => ({}));

    const brand = payment?.creditCard?.creditCardBrand ?? null;
    const last4 = payment?.creditCard?.creditCardNumber ?? null;

    await supabase.from("payment_logs").insert({
      order_id: order.id,
      provider: "asaas",
      status: payment?.status ?? "error",
      payload: {
        stage: "creditCard",
        payment_id: payment?.id ?? null,
        status: payment?.status ?? null,
        billingType: "CREDIT_CARD",
        installments: installmentCount,
        totalValue: amount,
        card_brand: brand,
        card_last4: last4,
        error_code: payment?.errors?.[0]?.code ?? null,
      },
    });

    if (!createRes.ok || !payment?.id) {
      const e = asaasError(payment);
      console.error("Asaas credit card error", createRes.status, e.code);
      return fail("creditCard", createRes.status || 400, e.message, e.code ?? undefined);
    }

    const status = mapStatus(payment.status);

    await supabase
      .from("orders")
      .update({
        payment_id: payment.id,
        payment_provider: "asaas",
        freight_payment_status: status,
        payment_external_reference: order.id,
        payment_created_at: new Date().toISOString(),
        payment_billing_type: "CREDIT_CARD",
        payment_installments: installmentCount,
        payment_total_value: amount,
        card_brand: brand,
        card_last4: last4,
      })
      .eq("id", order.id);

    if (status === "approved" && order.label_status !== "generated") {
      try {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-label`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ order_id: order.id }),
        });
      } catch (e) {
        console.error("Erro ao disparar etiqueta:", e);
      }
    }

    return json({
      success: true,
      paymentId: payment.id,
      status,
      asaasStatus: payment.status,
      installments: installmentCount,
      value: amount,
      cardBrand: brand,
      cardLast4: last4,
      invoiceUrl: payment.invoiceUrl ?? null,
    });
  } catch (err) {
    console.error("asaas-pay-credit-card error:", err);
    return fail("creditCard", 500, "Erro interno ao processar o cartão.");
  }
});
