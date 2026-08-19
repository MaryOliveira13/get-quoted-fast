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
    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY")!;
    const ASAAS_ENVIRONMENT = Deno.env.get("ASAAS_ENVIRONMENT") || "sandbox";
    const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    
    const ASAAS_BASE_URL =
      ASAAS_ENVIRONMENT === "production"
        ? "https://www.asaas.com/api/v3"
        : "https://sandbox.asaas.com/api/v3";

    const webhookUrl = `${SUPABASE_URL}/functions/v1/asaas-webhook`;

    // 1. Listar webhooks existentes
    const listRes = await fetch(`${ASAAS_BASE_URL}/webhook`, {
      headers: { access_token: ASAAS_API_KEY },
    });
    const listData = await listRes.json();

    let webhookExists = false;
    if (listData.data) {
        webhookExists = listData.data.some((w: any) => w.url === webhookUrl);
    }

    if (webhookExists) {
        return new Response(JSON.stringify({ message: "Webhook Asaas já configurado." }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // 2. Criar webhook
    const webhookBody = {
      url: webhookUrl,
      email: "financeiro@powercell.com.br", // Fallback email
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

    const createData = await createRes.json();

    if (!createRes.ok) {
        console.error("Erro ao configurar webhook Asaas:", createData);
        return new Response(JSON.stringify({ error: "Erro ao configurar webhook no Asaas", details: createData }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ message: "Webhook Asaas configurado com sucesso!", data: createData }), {
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
