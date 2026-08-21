import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const BASE_URL = "https://api.asaas.com/v3";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("ASAAS_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ ok: false, error: "ASAAS_API_KEY não configurada" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(`${BASE_URL}/customers?limit=1`, {
      method: "GET",
      headers: {
        access_token: apiKey,
        "User-Agent": "PowerCell/1.0",
        "Content-Type": "application/json",
      },
    });

    const text = await res.text();
    let code: string | null = null;
    let description: string | null = null;
    try {
      const json = JSON.parse(text);
      if (json?.errors?.length) {
        code = json.errors[0]?.code ?? null;
        description = json.errors[0]?.description ?? null;
      }
    } catch (_e) {
      // non-json body
    }

    return new Response(
      JSON.stringify({
        ok: res.ok,
        http_status: res.status,
        code,
        description,
        base_url: BASE_URL,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : "erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
