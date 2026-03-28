import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const admins = [
    { email: "admin@powercell.com.br", password: "PowerCell@2026", name: "Administrador" },
    { email: "vinicius@admin.com", password: "88125629VGs@", name: "Vinicius Admin" },
  ];

  const results: any[] = [];

  for (const admin of admins) {
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
    const alreadyExists = existing?.users?.some(u => u.email === admin.email);

    if (alreadyExists) {
      results.push({ email: admin.email, status: "already exists" });
      continue;
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true,
      user_metadata: { full_name: admin.name },
    });

    if (error) {
      results.push({ email: admin.email, status: "error", message: error.message });
      continue;
    }

    await supabaseAdmin.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
    results.push({ email: admin.email, status: "created", id: data.user.id });
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
