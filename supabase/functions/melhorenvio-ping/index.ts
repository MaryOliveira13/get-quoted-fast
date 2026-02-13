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
  const ME_REDIRECT_URI = Deno.env.get("ME_REDIRECT_URI")!;

  const { data: tokens, error } = await supabase
    .from("melhor_envio_tokens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !tokens) return null;

  // Check if token is expired (with 5 min buffer)
  const expiresAt = new Date(tokens.expires_at).getTime();
  const now = Date.now();

  if (now < expiresAt - 5 * 60 * 1000) {
    return tokens.access_token;
  }

  // Refresh token
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
  if (!refreshRes.ok || !refreshData.access_token) {
    console.error("Refresh failed:", refreshData);
    return null;
  }

  const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();

  await supabase
    .from("melhor_envio_tokens")
    .update({
      access_token: refreshData.access_token,
      refresh_token: refreshData.refresh_token,
      expires_at: newExpiresAt,
    })
    .eq("id", tokens.id);

  return refreshData.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const accessToken = await getValidAccessToken(supabase);

    if (!accessToken) {
      return new Response(JSON.stringify({ connected: false, error: "Token não encontrado ou expirado" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ME_BASE_URL = Deno.env.get("ME_BASE_URL")!;
    const meRes = await fetch(`${ME_BASE_URL}/api/v2/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "User-Agent": "PowerCell (powercell@email.com)",
      },
    });

    const meData = await meRes.json();

    if (!meRes.ok) {
      return new Response(JSON.stringify({ connected: false, error: "API retornou erro", details: meData }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      connected: true,
      user: { name: meData.firstname + " " + meData.lastname, email: meData.email },
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Ping error:", error);
    return new Response(JSON.stringify({ connected: false, error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

export { getValidAccessToken };
