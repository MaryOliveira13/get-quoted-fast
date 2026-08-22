import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ASAAS_BASE_URL = "https://api.asaas.com/v3";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("ASAAS_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ ok: false, error: "ASAAS_API_KEY não configurada no Secret." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(`${ASAAS_BASE_URL}/customers?limit=1`, {
      method: "GET",
      headers: {
        access_token: apiKey.trim(),
        "User-Agent": "PowerCell/1.0",
        "Content-Type": "application/json",
      },
    });

    const text = await res.text();
    let code: string | null = null;
    let description: string | null = null;
    try {
      const data = JSON.parse(text);
      if (data?.errors?.length) {
        code = data.errors[0]?.code ?? null;
        description = data.errors[0]?.description ?? null;
      }
    } catch (_e) {
      // Body not JSON
    }

    return new Response(
      JSON.stringify({
        ok: res.ok,
        http_status: res.status,
        code,
        description,
        base_url: ASAAS_BASE_URL,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
