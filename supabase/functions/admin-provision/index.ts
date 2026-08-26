import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TARGET_EMAIL = "powercellimportsitauna@gmail.com";
const RESET_REDIRECT = "https://get-quoted-fast.lovable.app/auth/reset-password";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const steps: Record<string, unknown> = {};

  try {
    // 1. locate user
    let userId: string | null = null;
    let page = 1;
    while (page <= 10 && !userId) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      const found = data.users.find((u) => u.email?.toLowerCase() === TARGET_EMAIL);
      if (found) userId = found.id;
      if (data.users.length < 200) break;
      page++;
    }

    // 2. create if missing (random password, never returned/logged)
    if (!userId) {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      const tempPassword = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
      const { data, error } = await admin.auth.admin.createUser({
        email: TARGET_EMAIL,
        password: tempPassword,
        email_confirm: true,
        app_metadata: { role: "admin" },
      });
      if (error) throw error;
      userId = data.user.id;
      steps.user = "created";
    } else {
      steps.user = "already_existed";
    }

    // 3. app_metadata role
    const { error: metaError } = await admin.auth.admin.updateUserById(userId!, {
      app_metadata: { role: "admin" },
    });
    if (metaError) throw metaError;
    steps.app_metadata_role = "admin";

    // 4. profiles row with admin role
    const { error: profileError } = await admin
      .from("profiles")
      .upsert({ id: userId, role: "admin" }, { onConflict: "id" });
    if (profileError) throw profileError;
    steps.profile_role = "admin";

    // 5. send password-creation email
    const publicClient = createClient(url, anonKey, { auth: { persistSession: false } });
    const { error: mailError } = await publicClient.auth.resetPasswordForEmail(TARGET_EMAIL, {
      redirectTo: RESET_REDIRECT,
    });
    steps.reset_email = mailError ? `failed: ${mailError.message}` : "sent";

    return new Response(JSON.stringify({ ok: true, steps }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message, steps }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
