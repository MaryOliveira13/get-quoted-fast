import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, MessageSquare, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface Pedido {
  id: string;
  codigo: string | null;
  nome: string | null;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  cep: string | null;
  rua: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  marca: string | null;
  modelo: string | null;
  servico: string | null;
  valor: number | null;
  acessorios: string | null;
  problema: string | null;
  frete_nome: string | null;
  frete_valor: number | null;
  status: string | null;
  freight_payment_status: string | null;
  payment_id: string | null;
  payment_provider: string | null;
  created_at: string | null;
}

interface FotoPedido {
  id: string;
  url: string;
}

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluido" },
  { value: "cancelado", label: "Cancelado" },
];

function statusBadge(status: string | null) {
  const s = status || "pendente";
  const map: Record<string, { bg: string; text: string; label: string }> = {
    pendente: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Pendente" },
    em_andamento: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Em andamento" },
    concluido: { bg: "bg-green-500/20", text: "text-green-400", label: "Concluido" },
    cancelado: { bg: "bg-red-500/20", text: "text-red-400", label: "Cancelado" },
  };
  const style = map[s] || map.pendente;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

export default function AdminOrders() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [fotos, setFotos] = useState<FotoPedido[]>([]);
  const [loadingFotos, setLoadingFotos] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar pedidos");
      console.error(error);
    } else {
      setPedidos(data || []);
    }
    setLoading(false);
  };

  const openDetail = async (p: Pedido) => {
    setSelected(p);
    setLoadingFotos(true);
    const { data } = await supabase
      .from("fotos_pedido")
      .select("id, url")
      .eq("pedido_id", p.id);
    setFotos(data || []);
    setLoadingFotos(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selected) return;
    setUpdatingStatus(true);
    const { error } = await supabase
      .from("pedidos")
      .update({ status: newStatus } as any)
      .eq("id", selected.id);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success("Status atualizado!");
      setSelected({ ...selected, status: newStatus });
      setPedidos((prev) =>
        prev.map((p) => (p.id === selected.id ? { ...p, status: newStatus } : p))
      );
    }
    setUpdatingStatus(false);
  };

  const sendWhatsApp = (phone: string | null, nome: string | null) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    const msg = `Ola ${nome || "cliente"}, aqui e a Power Cell! Estamos entrando em contato sobre seu pedido.`;
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
    try {
      window.top!.location.href = url;
    } catch {
      window.open(url, "_blank");
    }
  };

  const filtered = pedidos.filter((p) => {
    if (statusFilter !== "todos" && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchCode = p.codigo?.toLowerCase().includes(q);
      const matchName = p.nome?.toLowerCase().includes(q);
      if (!matchCode && !matchName) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold font-[Montserrat] uppercase tracking-wide">Pedidos Recebidos</h1>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou codigo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Nenhum pedido encontrado.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => openDetail(p)}
                className="w-full text-left rounded-xl border bg-card p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-sm" style={{ color: "#FF6B00" }}>
                    {p.codigo || "---"}
                  </span>
                  {statusBadge(p.status)}
                </div>
                <p className="text-sm font-medium truncate">{p.nome || "Sem nome"}</p>
                <p className="text-xs text-muted-foreground">
                  {p.marca} {p.modelo} — {p.servico}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">
                    {p.frete_nome ? `${p.frete_nome}: R$ ${(p.frete_valor || 0).toFixed(2).replace(".", ",")}` : "Frete: --"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString("pt-BR") : ""}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="font-mono" style={{ color: "#FF6B00" }}>{selected.codigo}</span>
                  {statusBadge(selected.status)}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Client */}
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-muted-foreground">Cliente</h4>
                  <p className="text-sm">{selected.nome}</p>
                  <p className="text-sm text-muted-foreground">CPF: {selected.cpf}</p>
                  <p className="text-sm text-muted-foreground">Tel: {selected.telefone}</p>
                  <p className="text-sm text-muted-foreground">{selected.email}</p>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-muted-foreground">Endereco</h4>
                  <p className="text-sm">{selected.rua}</p>
                  <p className="text-sm text-muted-foreground">
                    {selected.bairro} — {selected.cidade}/{selected.uf}
                  </p>
                  <p className="text-sm text-muted-foreground">CEP: {selected.cep}</p>
                </div>

                {/* Device */}
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-muted-foreground">Aparelho</h4>
                  <p className="text-sm">{selected.marca} {selected.modelo}</p>
                  <p className="text-sm text-muted-foreground">Servico: {selected.servico}</p>
                  <p className="text-sm text-muted-foreground">
                    Valor: R$ {(selected.valor || 0).toFixed(2).replace(".", ",")}
                  </p>
                  {selected.acessorios && (
                    <p className="text-sm text-muted-foreground">Acessorios: {selected.acessorios}</p>
                  )}
                  {selected.problema && (
                    <p className="text-sm text-muted-foreground">Problema: {selected.problema}</p>
                  )}
                </div>

                {/* Pagamento */}
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-muted-foreground">Pagamento do Frete</h4>
                  <p className="text-sm">
                    Provedor: <span className="capitalize">{selected.payment_provider || "N/A"}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status Financeiro: {statusBadge(selected.freight_payment_status)}
                  </p>
                  {selected.payment_id && (
                    <p className="text-xs text-muted-foreground font-mono">
                      ID Transação: {selected.payment_id}
                    </p>
                  )}
                  {selected.frete_nome && (
                    <p className="text-sm">
                      {selected.frete_nome}: R$ {(selected.frete_valor || 0).toFixed(2).replace(".", ",")}
                    </p>
                  )}
                </div>

                {/* Photos */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">Fotos</h4>
                  {loadingFotos ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : fotos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma foto enviada.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {fotos.map((f) => (
                        <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={f.url}
                            alt="Foto do aparelho"
                            className="w-20 h-20 rounded-lg object-cover border border-border hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-muted-foreground">Alterar status</label>
                    <Select
                      value={selected.status || "pendente"}
                      onValueChange={handleStatusChange}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="whatsapp"
                    className="w-full gap-2"
                    onClick={() => sendWhatsApp(selected.telefone, selected.nome)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Enviar WhatsApp para cliente
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
