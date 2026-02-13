import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getValidAccessToken(supabase: any): Promise<string | null> {
  const ME_BASE_URL = Deno.env.get("ME_BASE_URL")!;
  const ME_CLIENT_ID = Deno.env.get("ME_CLIENT_ID")!;
  const ME_CLIENT_SECRET = Deno.env.get("ME_CLIENT_SECRET")!;

  const { data: tokens, error } = await supabase
    .from("melhor_envio_tokens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !tokens) return null;

  const expiresAt = new Date(tokens.expires_at).getTime();
  if (Date.now() < expiresAt - 5 * 60 * 1000) {
    return tokens.access_token;
  }

  const refreshRes = await fetch(`${ME_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: ME_CLIENT_ID,
      client_secret: ME_CLIENT_SECRET,
      refresh_token: tokens.refresh_token,
    }),
  });

  const refreshData = await refreshRes.json();
  if (!refreshRes.ok || !refreshData.access_token) return null;

  const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();
  await supabase.from("melhor_envio_tokens").update({
    access_token: refreshData.access_token,
    refresh_token: refreshData.refresh_token,
    expires_at: newExpiresAt,
  }).eq("id", tokens.id);

  return refreshData.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { from, insurance_value, package: pkg } = await req.json();
    const STORE_POSTAL_CODE = Deno.env.get("STORE_POSTAL_CODE");
    const ME_BASE_URL = Deno.env.get("ME_BASE_URL")!;

    if (!STORE_POSTAL_CODE) {
      return new Response(JSON.stringify({ error: "CEP da loja não configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const accessToken = await getValidAccessToken(supabase);
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Melhor Envio não conectado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default package for cellphones
    const shipmentPackage = {
      weight: pkg?.weight || 0.4,
      width: pkg?.width || 16,
      height: pkg?.height || 8,
      length: pkg?.length || 4,
    };

    const body = {
      from: { postal_code: from?.postal_code?.replace(/\D/g, "") },
      to: { postal_code: STORE_POSTAL_CODE.replace(/\D/g, "") },
      package: shipmentPackage,
      options: {
        insurance_value: insurance_value || 0,
        receipt: false,
        own_hand: false,
      },
    };

    const quoteRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "PowerCell (powercell@email.com)",
      },
      body: JSON.stringify(body),
    });

    const quoteData = await quoteRes.json();

    if (!quoteRes.ok) {
      console.error("Quote API error:", quoteData);
      return new Response(JSON.stringify({ error: "Erro ao cotar frete", details: quoteData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize response - filter only valid services, return ALL
    const options = (Array.isArray(quoteData) ? quoteData : [])
      .filter((s: any) => !s.error && s.price && parseFloat(s.price) > 0)
      .map((s: any) => ({
        serviceId: String(s.id),
        serviceName: s.name,
        companyName: s.company?.name || "Transportadora",
        priceCents: Math.round(parseFloat(s.price) * 100),
        deliveryMinDays: s.delivery_range?.min || 0,
        deliveryMaxDays: s.delivery_range?.max || 0,
        currency: s.currency || "BRL",
      }))
      .sort((a: any, b: any) => a.priceCents - b.priceCents);

    return new Response(JSON.stringify({ options }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Quote error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
