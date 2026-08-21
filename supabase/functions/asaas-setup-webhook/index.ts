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
    const ASAAS_ENVIRONMENT = "production";
    const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

    if (!ASAAS_API_KEY || !ASAAS_WEBHOOK_TOKEN) {
       return new Response(JSON.stringify({ error: "Missing ASAAS_API_KEY or ASAAS_WEBHOOK_TOKEN" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
    
    // Environment-based URL selection
    const ASAAS_BASE_URL = ASAAS_ENVIRONMENT === "production" 
      ? "https://api.asaas.com/v3" 
      : "https://api-sandbox.asaas.com/v3";
    const webhookUrl = `${SUPABASE_URL}/functions/v1/asaas-webhook`;

    console.log(`Configuring webhook for environment: ${ASAAS_ENVIRONMENT} URL: ${ASAAS_BASE_URL}`);

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

    return new Response(JSON.stringify({ message: "Webhook Asaas configurado com sucesso!", env: ASAAS_ENVIRONMENT, details: createText }), {
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
