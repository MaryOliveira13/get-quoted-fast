import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessToken } = await req.json();

    if (!accessToken || typeof accessToken !== "string" || accessToken.trim().length < 20) {
      return json({ error: "Token inválido. Deve ter pelo menos 20 caracteres." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = accessToken.trim();
    const now = new Date().toISOString();
    // Set expires_at far in the future for manual tokens
    const farFuture = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    // Delete all existing tokens and insert new one
    await supabase.from("melhor_envio_tokens").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const { error: insertError } = await supabase.from("melhor_envio_tokens").insert({
      access_token: token,
      refresh_token: "",
      expires_at: farFuture,
    });

    if (insertError) {
      console.error("set-token: insert error", insertError);
      return json({ error: "Erro ao salvar token no banco." }, 500);
    }

    console.log("set-token: token saved, prefix =", token.slice(0, 10) + "...");
    return json({ ok: true });
  } catch (error) {
    console.error("set-token error:", error);
    return json({ error: String(error) }, 500);
  }
});
