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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("melhor_envio_tokens")
      .select("access_token, updated_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data?.access_token) {
      return json({ connected: false });
    }

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
