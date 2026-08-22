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
    access_token: (Deno.env.get("ASAAS_API_KEY") ?? "").trim(),
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function fail(
  stage: string,
  httpStatus: number,
  message: string,
  code?: string,
) {
  return json({ success: false, stage, httpStatus, code: code ?? null, message }, httpStatus);
}

function asaasError(data: any): { code: string | null; message: string } {
  const first = data?.errors?.[0];
  return {
    code: first?.code ?? null,
    message: first?.description ?? "Falha na comunicação com o gateway de pagamento.",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!(Deno.env.get("ASAAS_API_KEY") ?? "").trim()) {
      return fail("authentication", 500, "ASAAS_API_KEY não configurada.");
    }

    const { order_id, tracking_token, billing_type } = await req.json();
    if (!order_id) return fail("payment", 400, "order_id é obrigatório.");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .maybeSingle();

    if (orderErr || !order) return fail("payment", 404, "Pedido não encontrado.");
    if (tracking_token && order.tracking_token !== tracking_token) {
      return fail("payment", 403, "Token inválido para este pedido.");
    }
    if (["approved", "paid"].includes(order.freight_payment_status)) {
      return fail("payment", 400, "O frete deste pedido já foi pago.");
    }

    const amount = Number(order.shipping_amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return fail("payment", 400, "Valor do frete inválido para este pedido.");
    }

    const type: string = billing_type || "PIX";

    // ---------- CLIENTE ----------
    let customerId: string | null = order.asaas_customer_id || null;

    if (customerId) {
      const checkRes = await fetch(`${ASAAS_BASE_URL}/customers/${customerId}`, {
        headers: asaasHeaders(),
      });
      if (!checkRes.ok) {
        // ID antigo (ex.: sandbox) — descartar
        customerId = null;
      }
    }

    if (!customerId) {
      const cpf = (order.cpf || "").replace(/\D/g, "");
      const phone = (order.customer_phone || "").replace(/\D/g, "");
      const customerBody: Record<string, unknown> = {
        name: order.customer_name || "Cliente Power Cell",
        externalReference: order.id,
      };
      if (cpf && cpf.length >= 11) {
        customerBody.cpfCnpj = cpf;
      }
      if (order.customer_email) customerBody.email = order.customer_email;
      if (phone) customerBody.mobilePhone = phone;

      const createCustomerRes = await fetch(`${ASAAS_BASE_URL}/customers`, {
        method: "POST",
        headers: asaasHeaders(),
        body: JSON.stringify(customerBody, null, 2),
      });
      console.log("Asaas Customer Body:", JSON.stringify(customerBody));
      const customerData = await createCustomerRes.json().catch(() => ({}));
      if (!createCustomerRes.ok || !customerData?.id) {
        const e = asaasError(customerData);
        console.error("Asaas customer error", createCustomerRes.status, e.code);
        return fail("customer", createCustomerRes.status || 500, e.message, e.code ?? undefined);
      }
      customerId = customerData.id;
      await supabase.from("orders").update({ asaas_customer_id: customerId }).eq("id", order.id);
    }

    // ---------- REUTILIZAR COBRANÇA PENDENTE ----------
    let payment: any = null;
    if (order.payment_id && order.payment_provider === "asaas") {
      const existingRes = await fetch(`${ASAAS_BASE_URL}/payments/${order.payment_id}`, {
        headers: asaasHeaders(),
      });
      if (existingRes.ok) {
        const existing = await existingRes.json();
        if (existing?.billingType === type && existing?.status === "PENDING") {
          payment = existing;
        }
      }
    }

    // ---------- CRIAR COBRANÇA ----------
    if (!payment) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);

      const paymentBody = {
        customer: customerId,
        billingType: type,
        value: amount,
        dueDate: dueDate.toISOString().split("T")[0],
        description: "Frete do pedido Power Cell",
        externalReference: order.id,
      };

      const createRes = await fetch(`${ASAAS_BASE_URL}/payments`, {
        method: "POST",
        headers: asaasHeaders(),
        body: JSON.stringify(paymentBody),
      });
      const created = await createRes.json().catch(() => ({}));
      if (!createRes.ok || !created?.id) {
        const e = asaasError(created);
        console.error("Asaas payment error", createRes.status, e.code);
        return fail("payment", createRes.status || 500, e.message, e.code ?? undefined);
      }
      payment = created;

      await supabase
        .from("orders")
        .update({
          payment_id: payment.id,
          payment_provider: "asaas",
          freight_payment_status: "pending",
          payment_external_reference: order.id,
          payment_created_at: new Date().toISOString(),
          payment_billing_type: type,
          payment_total_value: amount,
        })
        .eq("id", order.id);

      await supabase.from("payment_logs").insert({
        order_id: order.id,
        provider: "asaas",
        status: payment.status,
        payload: { payment_id: payment.id, billingType: type, value: amount, stage: "created" },
      });
    }

    // ---------- QR CODE PIX ----------
    let encodedImage: string | null = null;
    let payload: string | null = null;
    let expirationDate: string | null = payment.dueDate ?? null;

    if (type === "PIX") {
      const qrRes = await fetch(`${ASAAS_BASE_URL}/payments/${payment.id}/pixQrCode`, {
        headers: asaasHeaders(),
      });
      const qr = await qrRes.json().catch(() => ({}));
      if (!qrRes.ok || !qr?.payload) {
        const e = asaasError(qr);
        console.error("Asaas pixQrCode error", qrRes.status, e.code);
        return fail("pixQrCode", qrRes.status || 500, e.message, e.code ?? undefined);
      }
      encodedImage = qr.encodedImage ?? null;
      payload = qr.payload;
      expirationDate = qr.expirationDate ?? expirationDate;
    }

    return json({
      success: true,
      paymentId: payment.id,
      encodedImage,
      payload,
      expirationDate,
      invoiceUrl: payment.invoiceUrl ?? null,
      status: payment.status ?? "PENDING",
      value: amount,
      // compat com clientes antigos
      payment_id: payment.id,
      qr_code: payload,
      qr_code_base64: encodedImage,
    });
  } catch (err) {
    console.error("asaas-create-pix error:", err);
    return fail("payment", 500, "Erro interno ao criar a cobrança.");
  }
});
