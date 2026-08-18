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
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ error: "ID do pedido obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Authorization check
    const authHeader = req.headers.get("Authorization");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    let isAuthorized = false;

    // A) Check if it's a trusted internal call using service role key
    if (authHeader === `Bearer ${serviceRoleKey}`) {
      isAuthorized = true;
    } 
    // B) Check if it's an authenticated admin
    else if (authHeader) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
      if (user) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role === "admin") isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Load order and check pre-conditions
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("freight_payment_status, label_status, label_url_pdf, label_url_png, tracking_code, customer_cep, brand, model, shipping_amount, shipping_option, melhor_envio_shipment_id")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Pedido não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STATE CHECK: Payment must be approved
    if (order.freight_payment_status !== "approved") {
      return new Response(JSON.stringify({ error: "Pagamento pendente" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.label_status === "generated" && order.label_url_pdf) {
      return new Response(JSON.stringify({
        status: "already_generated",
        label_url_pdf: order.label_url_pdf,
        label_url_png: order.label_url_png,
        tracking_code: order.tracking_code,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MELHOR ENVIO LOGIC START
    const ME_BASE_URL = Deno.env.get("ME_BASE_URL")!;
    const ME_CLIENT_ID = Deno.env.get("ME_CLIENT_ID")!;
    const ME_CLIENT_SECRET = Deno.env.get("ME_CLIENT_SECRET")!;

    // Helper to get token
    async function getValidAccessToken() {
      const { data: tokens, error } = await supabaseAdmin
        .from("melhor_envio_tokens")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !tokens) return null;
      const expiresAt = new Date(tokens.expires_at).getTime();
      if (Date.now() < expiresAt - 5 * 60 * 1000) return tokens.access_token;

      const refreshRes = await fetch(`${ME_BASE_URL}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          grant_type: "refresh_token",
          client_id: ME_CLIENT_ID,
          client_secret: ME_CLIENT_SECRET,
          refresh_token: tokens.refresh_token,
        }),
      });
      const refreshData = await refreshRes.json();
      if (!refreshRes.ok || !refreshData.access_token) return null;
      await supabaseAdmin.from("melhor_envio_tokens").update({
        access_token: refreshData.access_token,
        refresh_token: refreshData.refresh_token,
        expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
      }).eq("id", tokens.id);
      return refreshData.access_token;
    }

    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      await supabaseAdmin.from("orders").update({ label_status: "failed" }).eq("id", order_id);
      return new Response(JSON.stringify({ error: "Melhor Envio não conectado" }), 401);
    }

    const ME_HEADERS = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "PowerCell (powercell@email.com)",
    };

    let shipmentId = order.melhor_envio_shipment_id;

    if (!shipmentId) {
      const STORE_POSTAL_CODE = Deno.env.get("STORE_POSTAL_CODE") || "15044740";
      const shippingOpt = order.shipping_option as any || {};

      const cartBody = {
        service: parseInt(shippingOpt.serviceId || shippingOpt.service_id || "1"),
        from: { postal_code: order.customer_cep?.replace(/\D/g, "") || "" },
        to: { postal_code: STORE_POSTAL_CODE },
        products: [{
          name: `${order.brand} ${order.model}`,
          quantity: 1,
          unitary_value: order.shipping_amount || 0,
        }],
        volumes: [{ height: 4, width: 18, length: 11, weight: 0.35 }],
        options: { insurance_value: 1500, non_commercial: true },
      };

      const cartRes = await fetch(`${ME_BASE_URL}/api/v2/me/cart`, {
        method: "POST",
        headers: ME_HEADERS,
        body: JSON.stringify(cartBody),
      });

      const cartData = await cartRes.json();
      if (!cartRes.ok || !cartData.id) {
        await supabaseAdmin.from("orders").update({ label_status: "failed" }).eq("id", order_id);
        return new Response(JSON.stringify({ error: "Erro no carrinho ME", details: cartData }), 500);
      }
      shipmentId = cartData.id;

      const checkoutRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/checkout`, {
        method: "POST",
        headers: ME_HEADERS,
        body: JSON.stringify({ orders: [shipmentId] }),
      });
      if (!checkoutRes.ok) {
        await supabaseAdmin.from("orders").update({ label_status: "failed" }).eq("id", order_id);
        return new Response(JSON.stringify({ error: "Erro no checkout ME" }), 500);
      }

      await supabaseAdmin.from("orders").update({ melhor_envio_shipment_id: shipmentId }).eq("id", order_id);
    }

    const generateRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/generate`, {
      method: "POST",
      headers: ME_HEADERS,
      body: JSON.stringify({ orders: [shipmentId] }),
    });
    if (!generateRes.ok) {
      await supabaseAdmin.from("orders").update({ label_status: "failed" }).eq("id", order_id);
      return new Response(JSON.stringify({ error: "Erro ao gerar etiqueta" }), 500);
    }

    const printRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/print`, {
      method: "POST",
      headers: ME_HEADERS,
      body: JSON.stringify({ orders: [shipmentId], mode: "private" }),
    });
    const printData = await printRes.json();
    const labelUrlPdf = printData?.url || "";

    let labelUrlPng = "";
    try {
      const previewRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/preview`, {
        method: "POST",
        headers: ME_HEADERS,
        body: JSON.stringify({ orders: [shipmentId] }),
      });
      if (previewRes.ok) {
        const previewData = await previewRes.json();
        labelUrlPng = previewData?.url || "";
      }
    } catch (e) { /* ignore */ }

    const trackingRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/tracking`, {
      method: "POST",
      headers: ME_HEADERS,
      body: JSON.stringify({ orders: [shipmentId] }),
    });
    const trackingData = await trackingRes.json();
    const trackingCode = trackingData?.[shipmentId]?.tracking || "";

    await supabaseAdmin.from("orders").update({
      label_url_pdf: labelUrlPdf,
      label_url_png: labelUrlPng || null,
      tracking_code: trackingCode,
      label_status: "generated",
    }).eq("id", order_id);

    return new Response(JSON.stringify({
      label_url_pdf: labelUrlPdf,
      label_url_png: labelUrlPng,
      tracking_code: trackingCode,
      shipment_id: shipmentId,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("generate-label error:", error);
    return new Response(JSON.stringify({ error: String(error) }), 500);
  }
});
