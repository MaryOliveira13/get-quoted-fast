import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get last webhook log
    const { data: lastLog } = await supabase
      .from("payment_logs")
      .select("created_at, status, payload")
      .eq("provider", "asaas")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const value = Deno.env.get("ASAAS_API_KEY");
    const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN");

    const stats = {
      environment: "production",
      baseUrl: "https://api.asaas.com/v3",
      apiKeyConfigured: !!value,
      webhookTokenConfigured: !!ASAAS_WEBHOOK_TOKEN,
      lastWebhookEvent: lastLog?.payload?.event || null,
      lastWebhookTime: lastLog?.created_at || null,
      lastWebhookStatus: 200, 
      lastWebhookError: null
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
