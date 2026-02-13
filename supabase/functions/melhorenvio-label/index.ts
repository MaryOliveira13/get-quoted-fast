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
  if (Date.now() < expiresAt - 5 * 60 * 1000) return tokens.access_token;

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
  await supabase.from("melhor_envio_tokens").update({
    access_token: refreshData.access_token,
    refresh_token: refreshData.refresh_token,
    expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
  }).eq("id", tokens.id);
  return refreshData.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cartItemId } = await req.json();
    const ME_BASE_URL = Deno.env.get("ME_BASE_URL")!;

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

    // Step 1: Generate label
    const generateRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "PowerCell (powercell@email.com)",
      },
      body: JSON.stringify({ orders: [cartItemId] }),
    });

    const generateData = await generateRes.json();
    if (!generateRes.ok) {
      console.error("Generate label error:", generateData);
      return new Response(JSON.stringify({ error: "Erro ao gerar etiqueta", details: generateData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Print label (get PDF URL)
    const printRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/print`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "PowerCell (powercell@email.com)",
      },
      body: JSON.stringify({ orders: [cartItemId] }),
    });

    const printData = await printRes.json();

    // Step 3: Get tracking
    const trackingRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/tracking`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "PowerCell (powercell@email.com)",
      },
      body: JSON.stringify({ orders: [cartItemId] }),
    });

    const trackingData = await trackingRes.json();

    const tracking = trackingData?.[cartItemId]?.tracking || "";
    const printUrl = printData?.url || "";

    return new Response(JSON.stringify({
      printUrl,
      tracking,
      protocol: generateData?.[cartItemId]?.protocol || "",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Label error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
