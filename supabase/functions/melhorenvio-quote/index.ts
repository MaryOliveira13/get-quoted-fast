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

  if (error || !tokens) {
    console.error("No token found:", error?.message);
    return null;
  }

  const expiresAt = new Date(tokens.expires_at).getTime();
  if (Date.now() < expiresAt - 5 * 60 * 1000) {
    return tokens.access_token;
  }

  console.log("Token expired, refreshing...");
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
    const body = await req.json();
    const STORE_POSTAL_CODE = Deno.env.get("STORE_POSTAL_CODE");
    const ME_BASE_URL = Deno.env.get("ME_BASE_URL")!;

    console.log("quote: ME_BASE_URL =", ME_BASE_URL);
    console.log("quote: STORE_POSTAL_CODE =", STORE_POSTAL_CODE);

    if (!STORE_POSTAL_CODE) {
      return json({ error: "CEP da loja não configurado" }, 500);
    }

    const rawCep = String(body.from?.postal_code || body.customerPostalCode || "").replace(/\D/g, "");
    console.log("quote: rawCep =", rawCep);
    if (rawCep.length !== 8) {
      return json({ error: "CEP inválido. Informe 8 dígitos." }, 400);
    }

    const storeCep = STORE_POSTAL_CODE.replace(/\D/g, "");
    const insuranceValue = body.insurance_value ?? body.insuranceValue ?? 1500;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const accessToken = await getValidAccessToken(supabase);
    console.log("quote: tokenExists =", Boolean(accessToken));
    if (accessToken) console.log("quote: tokenPrefix =", accessToken.slice(0, 10) + "...");

    if (!accessToken) {
      return json({
        error: "Melhor Envio não conectado. Acesse /admin/integracoes e clique em Conectar Melhor Envio.",
        action: "connect",
      }, 401);
    }

    const meBody = {
      from: { postal_code: rawCep },
      to: { postal_code: storeCep },
      products: [
        {
          id: "smartphone",
          width: 11,
          height: 4,
          length: 18,
          weight: 0.35,
          insurance_value: insuranceValue,
          quantity: 1,
        },
      ],
      options: {
        receipt: false,
        own_hand: false,
      },
    };

    console.log("quote: calling ME calculate, body:", JSON.stringify(meBody));

    const quoteRes = await fetch(`${ME_BASE_URL}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "PowerCell (powercell@email.com)",
      },
      body: JSON.stringify(meBody),
    });

    const quoteText = await quoteRes.text();
    console.log("quote: ME response status =", quoteRes.status);
    console.log("quote: ME response body =", quoteText.slice(0, 500));

    let quoteData: any;
    try {
      quoteData = JSON.parse(quoteText);
    } catch {
      console.error("ME non-JSON response:", quoteRes.status, quoteText.slice(0, 500));
      const friendlyMsg = quoteRes.status === 403
        ? "Acesso negado pelo Melhor Envio (403). Verifique se o token tem o escopo 'shipping-calculate' e se ME_BASE_URL corresponde ao ambiente do token (sandbox vs produção)."
        : `Melhor Envio retornou status ${quoteRes.status} com resposta inesperada.`;
      return json({ error: "Falha ao cotar frete", details: friendlyMsg }, 502);
    }

    if (!quoteRes.ok) {
      console.error("ME error:", quoteRes.status, quoteData);
      const details = quoteData?.message || quoteData?.error || JSON.stringify(quoteData);
      return json({ error: "Falha ao cotar frete", details }, quoteRes.status >= 500 ? 502 : 422);
    }

    const allServices = Array.isArray(quoteData) ? quoteData : [];

    const options = allServices
      .map((s: any) => {
        const hasError = !!s.error;
        const price = s.custom_price ? parseFloat(s.custom_price) : parseFloat(s.price || "0");
        const deliveryMin = s.custom_delivery_time ?? s.delivery_time ?? s.delivery_range?.min ?? 0;
        const deliveryMax = s.delivery_range?.max ?? deliveryMin;

        return {
          serviceId: String(s.id),
          serviceName: s.name || "Serviço",
          companyName: s.company?.name || "Transportadora",
          companyLogo: s.company?.picture || null,
          priceCents: hasError ? 0 : Math.round(price * 100),
          deliveryMinDays: hasError ? 0 : deliveryMin,
          deliveryMaxDays: hasError ? 0 : deliveryMax,
          currency: s.currency || "BRL",
          unavailable: hasError,
          unavailableReason: hasError ? s.error : null,
        };
      })
      .sort((a: any, b: any) => {
        if (a.unavailable !== b.unavailable) return a.unavailable ? 1 : -1;
        return a.priceCents - b.priceCents;
      });

    console.log(`quote: returning ${options.length} shipping options`);
    return json({ options });
  } catch (error) {
    console.error("Quote error:", error);
    return json({ error: String(error) }, 500);
  }
});
