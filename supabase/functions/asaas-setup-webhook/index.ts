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
    
    // In V3, global webhook configuration is /webhook.
    // However, some versions of the API might be restricted by user permissions.
    
    const ASAAS_BASE_URL = ASAAS_ENVIRONMENT === "sandbox"
        ? "https://sandbox.asaas.com/api/v3"
        : "https://api.asaas.com/api/v3";

    const webhookUrl = `${SUPABASE_URL}/functions/v1/asaas-webhook`;

    // Let's try to verify if the key is valid first by fetching profile or customers
    const profileRes = await fetch(`${ASAAS_BASE_URL}/customers?limit=1`, {
        headers: { access_token: ASAAS_API_KEY }
    });
    const profileText = await profileRes.text();
    console.log("Profile check status:", profileRes.status, profileText);

    if (!profileRes.ok) {
        return new Response(JSON.stringify({ error: "API Key inválida ou ambiente incorreto", status: profileRes.status, details: profileText }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

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
        "PAYMENT_DELETED"
      ]
    };

    // Try /webhook
    console.log(`Attempting /webhook for environment: ${ASAAS_ENVIRONMENT}`);
    const res1 = await fetch(`${ASAAS_BASE_URL}/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify(webhookBody),
    });

    const text1 = await res1.text();
    console.log("/webhook response:", res1.status, text1);

    if (res1.ok) {
        return new Response(JSON.stringify({ message: "Webhook Asaas configurado com sucesso!", path: "/webhook", env: ASAAS_ENVIRONMENT }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Try /webhook/setting (another common pattern in some Asaas API versions)
    console.log(`Attempting /webhook/setting for environment: ${ASAAS_ENVIRONMENT}`);
    const res2 = await fetch(`${ASAAS_BASE_URL}/webhook/setting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify(webhookBody),
    });
    const text2 = await res2.text();
    console.log("/webhook/setting response:", res2.status, text2);
    
    if (res2.ok) {
        return new Response(JSON.stringify({ message: "Webhook Asaas configurado com sucesso!", path: "/webhook/setting", env: ASAAS_ENVIRONMENT }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ error: "Erro ao configurar webhook no Asaas", status: res1.status, details: text1 }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
