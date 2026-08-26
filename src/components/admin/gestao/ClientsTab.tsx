import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, KeyRound, MailCheck, Ban, ShieldCheck, History, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatBRL } from "@/lib/money";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
  blocked: boolean;
  role: string;
  orders_count: number;
  orcamentos_count: number;
}

const PER_PAGE = 20;

async function callAdmin(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("admin-users", { body });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as any;
}

export default function ClientsTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [historyUser, setHistoryUser] = useState<AdminUser | null>(null);
  const [history, setHistory] = useState<{ orders: any[]; orcamentos: any[] } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await callAdmin({ action: "list", page, perPage: PER_PAGE, search, status });
      setUsers(res.users ?? []);
      setTotal(res.total ?? 0);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const act = async (u: AdminUser, body: Record<string, unknown>, successMsg: string) => {
    setBusyId(u.id);
    try {
      await callAdmin({ ...body, userId: u.id });
      toast.success(successMsg);
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Ação não permitida");
    } finally {
      setBusyId(null);
    }
  };

  const openHistory = async (u: AdminUser) => {
    setHistoryUser(u);
    setHistory(null);
    try {
      const res = await callAdmin({ action: "history", userId: u.id, email: u.email });
      setHistory({ orders: res.orders ?? [], orcamentos: res.orcamentos ?? [] });
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao carregar histórico");
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nome, e-mail ou telefone..." className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="sm:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="blocked">Bloqueados</SelectItem>
            <SelectItem value="unconfirmed">E-mail não confirmado</SelectItem>
            <SelectItem value="admin">Administradores</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">{total} contas</p>

      <div className="rounded-xl border border-border overflow-hidden">
        {loading && <p className="p-4 text-sm text-muted-foreground">Carregando...</p>}
        {!loading && users.length === 0 && <p className="p-4 text-sm text-muted-foreground">Nenhuma conta encontrada.</p>}
        {users.map((u) => (
          <div key={u.id} className="px-4 py-3 border-b border-border last:border-b-0 flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground truncate">{u.full_name || "Sem nome"}</p>
                {u.role === "admin" && <Badge className="gap-1"><ShieldCheck className="w-3 h-3" /> Admin</Badge>}
                {u.blocked && <Badge variant="destructive">Bloqueado</Badge>}
                {!u.email_confirmed && <Badge variant="secondary">E-mail pendente</Badge>}
              </div>
              <p className="text-xs text-muted-foreground truncate">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
              <p className="text-[11px] text-muted-foreground">
                Cadastro {new Date(u.created_at).toLocaleDateString("pt-BR")} ·{" "}
                {u.last_sign_in_at ? `último acesso ${new Date(u.last_sign_in_at).toLocaleDateString("pt-BR")}` : "nunca acessou"} ·{" "}
                {u.orders_count} pedidos · {u.orcamentos_count} orçamentos
              </p>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <Button size="sm" variant="ghost" className="gap-1" disabled={busyId === u.id} onClick={() => openHistory(u)}>
                <History className="w-4 h-4" /> Histórico
              </Button>
              <Button size="sm" variant="ghost" className="gap-1" disabled={busyId === u.id}
                onClick={() => act(u, { action: "reset_password" }, "E-mail de redefinição enviado")}>
                <KeyRound className="w-4 h-4" /> Senha
              </Button>
              {!u.email_confirmed && (
                <Button size="sm" variant="ghost" className="gap-1" disabled={busyId === u.id}
                  onClick={() => act(u, { action: "resend_confirmation" }, "Confirmação reenviada")}>
                  <MailCheck className="w-4 h-4" /> Confirmar
                </Button>
              )}
              <Button size="sm" variant="ghost" className="gap-1" disabled={busyId === u.id}
                onClick={() => act(u, { action: u.blocked ? "unblock" : "block" }, u.blocked ? "Conta desbloqueada" : "Conta bloqueada")}>
                {u.blocked ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4 text-destructive" />}
                {u.blocked ? "Desbloquear" : "Bloquear"}
              </Button>
              <Button size="sm" variant="ghost" className="gap-1" disabled={busyId === u.id}
                onClick={() => act(u, { action: "set_role", role: u.role === "admin" ? "cliente" : "admin" },
                  u.role === "admin" ? "Função de administrador removida" : "Usuário promovido a administrador")}>
                <ShieldCheck className="w-4 h-4" /> {u.role === "admin" ? "Remover admin" : "Tornar admin"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
          <span className="text-xs text-muted-foreground">Página {page} de {pageCount}</span>
          <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
        </div>
      )}

      <Dialog open={!!historyUser} onOpenChange={(o) => !o && setHistoryUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{historyUser?.full_name || historyUser?.email}</DialogTitle></DialogHeader>
          {!history && <p className="text-sm text-muted-foreground">Carregando histórico...</p>}
          {history && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Pedidos ({history.orders.length})</h4>
                {history.orders.length === 0 && <p className="text-xs text-muted-foreground">Nenhum pedido.</p>}
                {history.orders.map((o) => (
                  <div key={o.id} className="text-xs text-muted-foreground border-b border-border py-2">
                    {new Date(o.created_at).toLocaleDateString("pt-BR")} · {o.brand} {o.model} · frete {formatBRL(Number(o.shipping_amount) * 100)} · {o.freight_payment_status}
                    {o.tracking_code ? ` · ${o.tracking_code}` : ""}
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Orçamentos ({history.orcamentos.length})</h4>
                {history.orcamentos.length === 0 && <p className="text-xs text-muted-foreground">Nenhum orçamento.</p>}
                {history.orcamentos.map((o) => (
                  <div key={o.id} className="text-xs text-muted-foreground border-b border-border py-2">
                    {new Date(o.created_at).toLocaleDateString("pt-BR")} · {o.marca} {o.modelo} · {formatBRL(Number(o.valor_total) * 100)} · {o.status}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
