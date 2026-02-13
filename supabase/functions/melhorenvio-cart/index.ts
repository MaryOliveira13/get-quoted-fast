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
    const { from, to, serviceId, package: pkg, insurance_value, internalReference } = await req.json();
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

    const shipmentPackage = {
      weight: pkg?.weight || 0.4,
      width: pkg?.width || 16,
      height: pkg?.height || 8,
      length: pkg?.length || 4,
    };

    const body = {
      service: parseInt(serviceId),
      from: {
        name: from.name,
        phone: from.phone?.replace(/\D/g, ""),
        email: from.email,
        document: from.cpf?.replace(/\D/g, ""),
        address: from.street,
        number: from.number,
        complement: from.complement || "",
        district: from.district,
        city: from.city,
        state_abbr: from.uf,
        postal_code: from.cep?.replace(/\D/g, ""),
        country_id: "BR",
      },
      to: {
        name: to.name,
        phone: to.phone?.replace(/\D/g, ""),
        email: to.email,
        document: to.document || "",
        address: to.street,
        number: to.number,
        complement: to.complement || "",
        district: to.district,
        city: to.city,
        state_abbr: to.state,
        postal_code: to.zip?.replace(/\D/g, ""),
        country_id: "BR",
      },
      products: [
        {
          name: internalReference || "Aparelho para reparo",
          quantity: 1,
          unitary_value: (insurance_value || 0),
        },
      ],
      volumes: [shipmentPackage],
      options: {
        insurance_value: insurance_value || 0,
        receipt: false,
        own_hand: false,
        non_commercial: true,
      },
    };

    const cartRes = await fetch(`${ME_BASE_URL}/api/v2/me/cart`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "PowerCell (powercell@email.com)",
      },
      body: JSON.stringify(body),
    });

    const cartData = await cartRes.json();

    if (!cartRes.ok) {
      console.error("Cart API error:", cartData);
      return new Response(JSON.stringify({ error: "Erro ao adicionar ao carrinho", details: cartData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      cartItemId: cartData.id,
      protocol: cartData.protocol,
      priceCents: Math.round(parseFloat(cartData.price || "0") * 100),
      service: cartData.service?.name || "",
      deadline: cartData.delivery_range || {},
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Cart error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
