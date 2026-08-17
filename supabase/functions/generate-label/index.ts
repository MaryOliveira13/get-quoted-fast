import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getValidAccessToken(supabase: any): Promise<string | null> {
  const ME_BASE_URL = Deno.env.get("ME_BASE_URL")!;
  const ME_CLIENT_ID = Deno.env.get("ME_CLIENT_ID")!;
  const ME_CLIENT_SECRET = Deno.env.get("ME_CLIENT_SECRET")!;

  const { data: tokens, error } = await supabase
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
  await supabase.from("melhor_envio_tokens").update({
    access_token: refreshData.access_token,
    refresh_token: refreshData.refresh_token,
    expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
  }).eq("id", tokens.id);
  return refreshData.access_token;
}

const ME_HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  Accept: "application/json",
  "User-Agent": "PowerCell (powercell@email.com)",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, cartItemId: legacyCartItemId } = await req.json();
    const targetOrderId = order_id;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // If called with order_id, load order and use its melhor_envio_shipment_id
    let shipmentId = legacyCartItemId;
    let orderId = targetOrderId;

    if (orderId) {
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderErr || !order) {
        return new Response(JSON.stringify({ error: "Pedido não encontrado" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (order.freight_payment_status !== "approved") {
        return new Response(JSON.stringify({ error: "Frete ainda não foi pago" }), {
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

      // Need to create the shipment in Melhor Envio first via cart + checkout
      shipmentId = order.melhor_envio_shipment_id;

      // If no shipment yet, we need to create cart + checkout
      if (!shipmentId) {
        const accessToken = await getValidAccessToken(supabase);
        if (!accessToken) {
          await supabase.from("orders").update({ label_status: "failed" }).eq("id", orderId);
          return new Response(JSON.stringify({ error: "Melhor Envio não conectado" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const ME_BASE_URL = Deno.env.get("ME_BASE_URL")!;
        const STORE_POSTAL_CODE = Deno.env.get("STORE_POSTAL_CODE") || "15044740";
        const shippingOpt = order.shipping_option as any || {};

        // Add to cart
        const cartBody = {
          service: parseInt(shippingOpt.serviceId || shippingOpt.service_id || "1"),
          from: { postal_code: order.customer_cep?.replace(/\D/g, "") || "" },
          to: { postal_code: STORE_POSTAL_CODE },
          products: [{
            name: `${order.brand} ${order.model}`,
            quantity: 1,
            unitary_value: order.shipping_amount || 0,
          }],
          volumes: [{
            height: 4,
            width: 18,
            length: 11,
            weight: 0.35,
          }],
          options: {
            insurance_value: 1500,
            non_commercial: true,
          },
        };

        console.log("Cart body:", JSON.stringify(cartBody));

        const cartRes = await fetch(`${ME_BASE_URL}/api/v2/me/cart`, {
          method: "POST",
          headers: ME_HEADERS(accessToken),
          body: JSON.stringify(cartBody),
        });

        const cartData = await cartRes.json();
        console.log("Cart response status:", cartRes.status);

        if (!cartRes.ok || !cartData.id) {
          console.error("Cart error:", JSON.stringify(cartData).slice(0, 500));
          await supabase.from("orders").update({ label_status: "failed" }).eq("id", orderId);
          return new Response(JSON.stringify({ error: "Erro ao adicionar ao carrinho ME", details: cartData }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        shipmentId = cartData.id;

        // Checkout (purchase the shipment)
        const checkoutRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/checkout`, {
          method: "POST",
          headers: ME_HEADERS(accessToken),
          body: JSON.stringify({ orders: [shipmentId] }),
        });

        const checkoutData = await checkoutRes.json();
        console.log("Checkout response status:", checkoutRes.status);

        if (!checkoutRes.ok) {
          console.error("Checkout error:", JSON.stringify(checkoutData).slice(0, 500));
          await supabase.from("orders").update({ label_status: "failed" }).eq("id", orderId);
          return new Response(JSON.stringify({ error: "Erro no checkout ME", details: checkoutData }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Save shipment id
        await supabase.from("orders").update({
          melhor_envio_shipment_id: shipmentId,
        }).eq("id", orderId);
      }
    }

    if (!shipmentId) {
      return new Response(JSON.stringify({ error: "Nenhum ID de envio disponível" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ME_BASE_URL = Deno.env.get("ME_BASE_URL")!;
    const accessToken = await getValidAccessToken(supabase);
    if (!accessToken) {
      if (orderId) await supabase.from("orders").update({ label_status: "failed" }).eq("id", orderId);
      return new Response(JSON.stringify({ error: "Melhor Envio não conectado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate label
    const generateRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/generate`, {
      method: "POST",
      headers: ME_HEADERS(accessToken),
      body: JSON.stringify({ orders: [shipmentId] }),
    });
    const generateData = await generateRes.json();
    console.log("Generate label status:", generateRes.status);

    if (!generateRes.ok) {
      console.error("Generate error:", JSON.stringify(generateData).slice(0, 500));
      if (orderId) await supabase.from("orders").update({ label_status: "failed" }).eq("id", orderId);
      return new Response(JSON.stringify({ error: "Erro ao gerar etiqueta", details: generateData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Print label (PDF)
    const printRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/print`, {
      method: "POST",
      headers: ME_HEADERS(accessToken),
      body: JSON.stringify({ orders: [shipmentId], mode: "private" }),
    });
    const printData = await printRes.json();
    const labelUrlPdf = printData?.url || "";

    // Try PNG preview
    let labelUrlPng = "";
    try {
      const previewRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/preview`, {
        method: "POST",
        headers: ME_HEADERS(accessToken),
        body: JSON.stringify({ orders: [shipmentId] }),
      });
      if (previewRes.ok) {
        const previewData = await previewRes.json();
        labelUrlPng = previewData?.url || "";
      }
    } catch (e) {
      console.log("PNG preview not available");
    }

    // Get tracking
    const trackingRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/tracking`, {
      method: "POST",
      headers: ME_HEADERS(accessToken),
      body: JSON.stringify({ orders: [shipmentId] }),
    });
    const trackingData = await trackingRes.json();
    const trackingCode = trackingData?.[shipmentId]?.tracking || "";

    // Update order
    if (orderId) {
      await supabase.from("orders").update({
        label_url_pdf: labelUrlPdf,
        label_url_png: labelUrlPng || null,
        tracking_code: trackingCode,
        melhor_envio_shipment_id: shipmentId,
        label_status: "generated",
      }).eq("id", orderId);
    }

    return new Response(JSON.stringify({
      label_url_pdf: labelUrlPdf,
      label_url_png: labelUrlPng,
      tracking_code: trackingCode,
      shipment_id: shipmentId,
      protocol: generateData?.[shipmentId]?.protocol || "",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-label error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
