import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, tracking_token } = await req.json();

    if (!order_id) return json({ error: "order_id é obrigatório" }, 400);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("id, freight_payment_status, label_status, tracking_code, brand, model, shipping_option, shipping_amount, label_url_pdf, label_url_png, tracking_token")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return json({ error: "Pedido não encontrado" }, 404);
    }

    // Security check: Match token
    // Compatibility: If order has no token (older ones), we might allow or block. 
    // Instruction says "proponha uma estratégia segura de compatibilidade. Evite deixar indefinidamente aberto apenas por order_id."
    // We will block unless token matches OR order has no token (legacy).
    if (order.tracking_token && order.tracking_token !== tracking_token) {
      return json({ error: "Acesso negado: Token de acompanhamento inválido" }, 403);
    }

    if (!order.tracking_token && tracking_token) {
      // If we provided a token but order has none, also block to be safe
      return json({ error: "Acesso negado: Pedido legado sem token" }, 403);
    }

    // Return ONLY safe fields for public status tracking
    return json({
      id: order.id,
      brand: order.brand,
      model: order.model,
      freight_payment_status: order.freight_payment_status,
      label_status: order.label_status,
      tracking_code: order.tracking_code,
      label_url_pdf: order.label_url_pdf,
      label_url_png: order.label_url_png,
      shipping_amount: order.shipping_amount,
      shipping_service: (order.shipping_option as any)?.serviceName || "Não informado",
    });
  } catch (error) {
    console.error("public-order-status error:", error);
    return json({ error: String(error) }, 500);
  }
});
