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
    
    // Test base URLs
    const sandboxUrl = "https://sandbox.asaas.com/api/v3/customers?limit=1";
    const prodUrl = "https://api.asaas.com/api/v3/customers?limit=1";

    console.log("Testing with ASAAS_API_KEY (partially hidden)");
    
    const prodRes = await fetch(prodUrl, {
        headers: { access_token: ASAAS_API_KEY || "" }
    });
    const prodText = await prodRes.text();
    
    const sandRes = await fetch(sandboxUrl, {
        headers: { access_token: ASAAS_API_KEY || "" }
    });
    const sandText = await sandRes.text();

    return new Response(JSON.stringify({ 
        env_config: ASAAS_ENVIRONMENT,
        production: { status: prodRes.status, text: prodText },
        sandbox: { status: sandRes.status, text: sandText }
    }), {
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
