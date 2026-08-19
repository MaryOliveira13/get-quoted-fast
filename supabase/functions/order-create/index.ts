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
    const {
      cpf, customer_name, customer_phone, customer_email,
      customer_cep, customer_street, customer_number, customer_complement,
      customer_district, customer_city, customer_uf,
      brand, model, issue_description, services,
      shipping_option, repair_estimate_total,
    } = body;

    if (!cpf || !customer_name || !customer_phone || !brand || !model || !shipping_option) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios faltando." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shipping_amount = parseFloat(shipping_option.price || shipping_option.priceCents / 100 || 0);

    const tracking_token = crypto.randomUUID();

    const { data, error } = await supabase.from("orders").insert({
      cpf,
      customer_name,
      customer_phone,
      customer_email: customer_email || null,
      customer_cep: customer_cep || null,
      customer_street: customer_street || null,
      customer_number: customer_number || null,
      customer_complement: customer_complement || null,
      customer_district: customer_district || null,
      customer_city: customer_city || null,
      customer_uf: customer_uf || null,
      brand,
      model,
      issue_description: issue_description || null,
      services: services || [],
      shipping_option,
      shipping_amount,
      repair_estimate_total: repair_estimate_total || 0,
      freight_payment_status: "pending",
      label_status: "pending",
      payment_provider: "asaas",
      tracking_token,
    }).select("id, tracking_token").single();

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: "Erro ao criar pedido.", details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ order_id: data.id, tracking_token: data.tracking_token }), {
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
