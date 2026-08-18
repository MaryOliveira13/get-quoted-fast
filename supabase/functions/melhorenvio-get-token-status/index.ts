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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Não autenticado" }, 401);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Validate User JWT
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return json({ error: "Sessão inválida" }, 401);
    }

    // 2. Check Admin Role server-side
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return json({ error: "Acesso negado: Requer role admin" }, 403);
    }

    const { data, error } = await supabaseAdmin
      .from("melhor_envio_tokens")
      .select("access_token, updated_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data?.access_token) {
      return json({ connected: false });
    }

    // Return only metadata, never the full token
    return json({
      connected: true,
      tokenPrefix: data.access_token.slice(0, 8) + "...",
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error("get-token-status error:", error);
    return json({ connected: false, error: String(error) }, 500);
  }
});
