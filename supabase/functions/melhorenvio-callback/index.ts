import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
      return new Response("<h1>Erro: código de autorização ausente</h1>", {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    const ME_BASE_URL = Deno.env.get("ME_BASE_URL")!;
    const ME_CLIENT_ID = Deno.env.get("ME_CLIENT_ID")!;
    const ME_CLIENT_SECRET = Deno.env.get("ME_CLIENT_SECRET")!;
    const ME_REDIRECT_URI = Deno.env.get("ME_REDIRECT_URI")!;

    // Exchange code for tokens
    const tokenRes = await fetch(`${ME_BASE_URL}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: ME_CLIENT_ID,
        client_secret: ME_CLIENT_SECRET,
        redirect_uri: ME_REDIRECT_URI,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return new Response(`<h1>Erro ao obter token</h1><pre>${JSON.stringify(tokenData, null, 2)}</pre>`, {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Save tokens to DB using service_role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    // Delete existing tokens and insert new ones
    await supabase.from("melhor_envio_tokens").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    
    const { error: insertError } = await supabase.from("melhor_envio_tokens").insert({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error("DB insert error:", insertError);
      return new Response("<h1>Erro ao salvar token</h1>", {
        status: 500,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Redirect to admin page with success
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin/integracoes?connected=true" },
    });
  } catch (error) {
    console.error("Callback error:", error);
    return new Response(`<h1>Erro interno</h1><pre>${error}</pre>`, {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
});
