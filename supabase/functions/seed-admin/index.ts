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

  // Check if admin already exists
  const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
  const adminExists = existing?.users?.some(u => u.email === "admin@powercell.com.br");

  if (adminExists) {
    return new Response(JSON.stringify({ message: "Admin already exists" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@powercell.com.br",
    password: "PowerCell@2026",
    email_confirm: true,
    user_metadata: { full_name: "Administrador" },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Update profile role to admin
  await supabaseAdmin.from("profiles").update({ role: "admin" }).eq("id", data.user.id);

  return new Response(JSON.stringify({ message: "Admin created", id: data.user.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
