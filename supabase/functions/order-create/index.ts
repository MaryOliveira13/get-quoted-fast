import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Explicit whitelist of fields allowed to be set by the customer
const ORDER_INSERT_WHITELIST = [
  "cpf",
  "customer_name",
  "customer_phone",
  "customer_email",
  "customer_cep",
  "customer_street",
  "customer_number",
  "customer_complement",
  "customer_district",
  "customer_city",
  "customer_uf",
  "brand",
  "model",
  "issue_description",
  "services",
  "shipping_option",
  "repair_estimate_total",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Create safe object from whitelist
    const body: any = {};
    for (const key of ORDER_INSERT_WHITELIST) {
      if (rawBody[key] !== undefined) {
        body[key] = rawBody[key];
      }
    }

    const {
      cpf, customer_name, customer_phone, brand, model, shipping_option
    } = body;

    if (!cpf || !customer_name || !customer_phone || !brand || !model || !shipping_option) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios faltando." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Server-side validation of shipping amount
    const shipping_amount = parseFloat(shipping_option.price || shipping_option.priceCents / 100 || 0);

    const tracking_token = crypto.randomUUID();

    const { data, error } = await supabase.from("orders").insert({
      ...body,
      // Overwrite/Force sensitive fields to safe defaults
      shipping_amount,
      freight_payment_status: "pending",
      label_status: "pending",
      payment_provider: "pagbank",
      payment_id: null,
      tracking_code: null,
      paid_at: null,
      status: "novo", // Default internal status
      tracking_token,
    }).select("id").single();

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: "Erro ao criar pedido.", details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ order_id: data.id, tracking_token }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("order-create error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
