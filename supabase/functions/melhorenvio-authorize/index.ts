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
    const ME_BASE_URL = Deno.env.get("ME_BASE_URL");
    const ME_CLIENT_ID = Deno.env.get("ME_CLIENT_ID");
    const ME_REDIRECT_URI = Deno.env.get("ME_REDIRECT_URI");

    if (!ME_BASE_URL || !ME_CLIENT_ID || !ME_REDIRECT_URI) {
      return new Response(JSON.stringify({ error: "Melhor Envio não configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate random state for CSRF protection
    const state = crypto.randomUUID();

    const scopes = "cart-read cart-write companies-read companies-write coupons-read coupons-write notifications-read orders-read products-read products-write purchases-read shipping-calculate shipping-cancel shipping-checkout shipping-companies shipping-generate shipping-preview shipping-print shipping-share shipping-tracking ecommerce-shipping transactions-read users-read users-write webhooks-read webhooks-write";

    const authUrl = new URL(`${ME_BASE_URL}/oauth/authorize`);
    authUrl.searchParams.set("client_id", ME_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", ME_REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("state", state);

    return new Response(JSON.stringify({ authUrl: authUrl.toString(), state }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in melhorenvio-authorize:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
