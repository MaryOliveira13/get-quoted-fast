import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
    const ASAAS_ENVIRONMENT = Deno.env.get("ASAAS_ENVIRONMENT") || "production";
    const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

    if (!ASAAS_API_KEY || !ASAAS_WEBHOOK_TOKEN) {
       return new Response(JSON.stringify({ error: "Missing ASAAS_API_KEY or ASAAS_WEBHOOK_TOKEN" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
    
    const ASAAS_BASE_URL = ASAAS_ENVIRONMENT === "sandbox"
        ? "https://sandbox.asaas.com/api/v3"
        : "https://api.asaas.com/api/v3";

    console.log(`Configuring webhook for environment: ${ASAAS_ENVIRONMENT} URL: ${ASAAS_BASE_URL}`);

    const webhookUrl = `${SUPABASE_URL}/functions/v1/asaas-webhook`;

    // 1. Listar webhooks existentes
    const listRes = await fetch(`${ASAAS_BASE_URL}/webhook`, {
      headers: { access_token: ASAAS_API_KEY },
    });
    
    const listText = await listRes.text();
    console.log("Asaas list response text:", listText);

    if (!listRes.ok) {
        return new Response(JSON.stringify({ error: "Erro ao listar webhooks no Asaas", status: listRes.status, details: listText }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    let listData;
    try {
        listData = JSON.parse(listText);
    } catch (e) {
        return new Response(JSON.stringify({ error: "Asaas API returned non-JSON response", details: listText }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    let webhookExists = false;
    if (listData.data) {
        webhookExists = listData.data.some((w: any) => w.url === webhookUrl);
    }

    if (webhookExists) {
        return new Response(JSON.stringify({ message: "Webhook Asaas já configurado.", env: ASAAS_ENVIRONMENT }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // 2. Criar webhook
    const webhookBody = {
      url: webhookUrl,
      email: "financeiro@powercell.com.br", 
      enabled: true,
      interrupted: false,
      apiVersion: 3,
      authToken: ASAAS_WEBHOOK_TOKEN,
      events: [
        "PAYMENT_CONFIRMED",
        "PAYMENT_RECEIVED",
        "PAYMENT_REJECTED",
        "PAYMENT_CANCELLED",
        "PAYMENT_DELETED",
        "PAYMENT_AWAITING_RISK_ANALYSIS",
        "PAYMENT_APPROVED_BY_RISK_ANALYSIS",
        "PAYMENT_REPROVED_BY_RISK_ANALYSIS"
      ]
    };

    const createRes = await fetch(`${ASAAS_BASE_URL}/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify(webhookBody),
    });

    const createText = await createRes.text();
    console.log("Asaas create response text:", createText);

    if (!createRes.ok) {
        return new Response(JSON.stringify({ error: "Erro ao configurar webhook no Asaas", status: createRes.status, details: createText }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ message: "Webhook Asaas configurado com sucesso!", env: ASAAS_ENVIRONMENT }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
