import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_BASE_URL = Deno.env.get("APP_BASE_URL") ?? "";
const PRIMARY_ADMIN = "powercellimportsitauna@gmail.com";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  try {
    // ---- Authenticate caller
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "unauthorized" }, 401);
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);
    const caller = userData.user;

    // ---- Authorize: profiles.role must be admin (server-side)
    const { data: prof } = await admin.from("profiles").select("role").eq("id", caller.id).maybeSingle();
    if (prof?.role !== "admin") return json({ error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "");

    const audit = async (act: string, recordId: string | null, before: unknown, after: unknown) => {
      await admin.from("admin_audit_logs").insert({
        admin_id: caller.id,
        admin_email: caller.email,
        action: act,
        table_name: "auth.users",
        record_id: recordId,
        data_before: before ?? null,
        data_after: after ?? null,
      });
    };

    const countActiveAdmins = async () => {
      const { count } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      return count ?? 0;
    };

    if (action === "list") {
      const page = Math.max(1, Number(body?.page ?? 1));
      const perPage = Math.min(100, Number(body?.perPage ?? 20));
      const search = String(body?.search ?? "").trim().toLowerCase();
      const statusFilter = String(body?.status ?? "all");

      const { data: list, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;

      const { data: profiles } = await admin.from("profiles").select("id, full_name, role");
      const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

      let users = (list?.users ?? []).map((u: any) => {
        const p: any = profileMap.get(u.id);
        return {
          id: u.id,
          email: u.email ?? "",
          full_name: p?.full_name ?? u.user_metadata?.full_name ?? "",
          phone: u.phone ?? u.user_metadata?.phone ?? "",
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          email_confirmed: !!u.email_confirmed_at,
          blocked: !!u.banned_until && new Date(u.banned_until) > new Date(),
          role: p?.role ?? "cliente",
        };
      });

      if (search) {
        users = users.filter(
          (u) =>
            u.email.toLowerCase().includes(search) ||
            (u.full_name ?? "").toLowerCase().includes(search) ||
            (u.phone ?? "").toLowerCase().includes(search)
        );
      }
      if (statusFilter === "blocked") users = users.filter((u) => u.blocked);
      if (statusFilter === "active") users = users.filter((u) => !u.blocked);
      if (statusFilter === "unconfirmed") users = users.filter((u) => !u.email_confirmed);
      if (statusFilter === "admin") users = users.filter((u) => u.role === "admin");

      users.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      const total = users.length;
      const pageUsers = users.slice((page - 1) * perPage, page * perPage);

      // counts of orders / orcamentos
      const emails = pageUsers.map((u) => u.email).filter(Boolean);
      const { data: orders } = await admin
        .from("orders")
        .select("id, customer_email")
        .in("customer_email", emails.length ? emails : ["__none__"]);
      const { data: orcs } = await admin.from("orcamentos").select("id, created_by");

      const withCounts = pageUsers.map((u) => ({
        ...u,
        orders_count: (orders ?? []).filter((o: any) => o.customer_email === u.email).length,
        orcamentos_count: (orcs ?? []).filter((o: any) => o.created_by === u.id).length,
      }));

      return json({ users: withCounts, total, page, perPage });
    }

    if (action === "history") {
      const userId = String(body?.userId ?? "");
      const email = String(body?.email ?? "");
      const { data: orders } = await admin
        .from("orders")
        .select("id, created_at, brand, model, repair_estimate_total, shipping_amount, freight_payment_status, tracking_code")
        .eq("customer_email", email)
        .order("created_at", { ascending: false })
        .limit(50);
      const { data: orcamentos } = await admin
        .from("orcamentos")
        .select("id, created_at, marca, modelo, valor_total, status")
        .eq("created_by", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      return json({ orders: orders ?? [], orcamentos: orcamentos ?? [] });
    }

    const targetId = String(body?.userId ?? "");
    if (!targetId) return json({ error: "userId obrigatório" }, 400);
    const { data: targetRes } = await admin.auth.admin.getUserById(targetId);
    const target = targetRes?.user;
    if (!target) return json({ error: "Usuário não encontrado" }, 404);

    if (action === "reset_password") {
      const { error } = await admin.auth.admin.generateLink({
        type: "recovery",
        email: target.email!,
        options: { redirectTo: `${APP_BASE_URL}/auth/reset-password` },
      });
      if (error) throw error;
      await audit("reset_password_sent", targetId, null, { email: target.email });
      return json({ ok: true });
    }

    if (action === "resend_confirmation") {
      const { error } = await admin.auth.admin.generateLink({
        type: "signup",
        email: target.email!,
        password: crypto.randomUUID(),
        options: { redirectTo: `${APP_BASE_URL}/auth` },
      });
      if (error) throw error;
      await audit("resend_confirmation", targetId, null, { email: target.email });
      return json({ ok: true });
    }

    if (action === "block" || action === "unblock") {
      if (action === "block") {
        if (targetId === caller.id) return json({ error: "Você não pode bloquear sua própria conta" }, 400);
        if (target.email === PRIMARY_ADMIN) return json({ error: "A conta administrativa principal não pode ser bloqueada" }, 400);
      }
      const { error } = await admin.auth.admin.updateUserById(targetId, {
        ban_duration: action === "block" ? "876000h" : "none",
      });
      if (error) throw error;
      await audit(action === "block" ? "user_blocked" : "user_unblocked", targetId, null, { email: target.email });
      return json({ ok: true });
    }

    if (action === "set_role") {
      const role = String(body?.role ?? "");
      if (!["cliente", "admin"].includes(role)) return json({ error: "Função inválida" }, 400);
      if (targetId === caller.id && role !== "admin")
        return json({ error: "Você não pode remover sua própria função de administrador" }, 400);
      if (role !== "admin") {
        const { data: p } = await admin.from("profiles").select("role").eq("id", targetId).maybeSingle();
        if (p?.role === "admin" && (await countActiveAdmins()) <= 1)
          return json({ error: "Não é possível remover o último administrador ativo" }, 400);
        if (target.email === PRIMARY_ADMIN)
          return json({ error: "A conta administrativa principal deve permanecer administradora" }, 400);
      }
      const { data: before } = await admin.from("profiles").select("role").eq("id", targetId).maybeSingle();
      const { error } = await admin.from("profiles").update({ role }).eq("id", targetId);
      if (error) throw error;
      await admin.auth.admin.updateUserById(targetId, { app_metadata: { role } });
      await audit("user_role_changed", targetId, before, { role });
      return json({ ok: true });
    }

    return json({ error: "Ação desconhecida" }, 400);
  } catch (e) {
    console.error("admin-users error", e);
    return json({ error: (e as Error).message ?? "erro interno" }, 500);
  }
});
