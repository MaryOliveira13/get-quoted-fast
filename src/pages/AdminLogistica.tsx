import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PackageCheck, Truck, Loader2, Plus, ArrowUp, ArrowDown, Minus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface Recebimento {
  id: string;
  cliente_nome: string;
  cliente_telefone: string | null;
  marca: string | null;
  modelo: string | null;
  status_triagem: string;
  data_chegada: string;
  observacoes: string | null;
  pedido_code: string | null;
  problema: string | null;
  condicao_estetica: string[] | null;
  acessorios_entregues: string[] | null;
  valor_orcamento: number | null;
  forma_pagamento: string | null;
  prazo_dias: number | null;
  servico: string | null;
}

interface Envio {
  id: string;
  cliente_nome: string;
  marca: string | null;
  modelo: string | null;
  transportadora: string | null;
  codigo_rastreio: string | null;
  data_envio: string;
  observacoes: string | null;
  recebimento_id: string | null;
  servico: string | null;
  valor_cobrado: number | null;
  forma_pagamento: string | null;
  endereco_entrega: string | null;
}

const STATUS_OPTIONS = [
  { value: "aguardando", label: "Aguardando" },
  { value: "em_analise", label: "Em análise" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
  { value: "pronto_retirada", label: "Pronto para retirada" },
];

const SERVICO_OPTIONS = [
  "Troca de Tela",
  "Troca de Vidro",
  "Troca de Bateria",
  "Troca de Tampa Traseira",
  "Outro",
];

const CONDICAO_OPTIONS = [
  "Tela trincada",
  "Tela manchada",
  "Amassado",
  "Arranhões",
  "Sem danos visíveis",
  "Outro",
];

const ACESSORIOS_OPTIONS = [
  "Carregador",
  "Cabo",
  "Capinha",
  "Caixa original",
  "Nenhum",
];

const PAGAMENTO_OPTIONS = [
  "Dinheiro",
  "PIX",
  "Cartão de débito",
  "Cartão de crédito",
  "A combinar",
];

const PAGAMENTO_ENVIO_OPTIONS = [
  "Dinheiro",
  "PIX",
  "Cartão de débito",
  "Cartão de crédito",
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    aguardando: "bg-yellow-500/20 text-yellow-400",
    em_analise: "bg-blue-500/20 text-blue-400",
    em_andamento: "bg-purple-500/20 text-purple-400",
    concluido: "bg-green-500/20 text-green-400",
    pronto_retirada: "bg-primary/20 text-primary",
    em_triagem: "bg-blue-500/20 text-blue-400",
    aprovado: "bg-green-500/20 text-green-400",
    recusado: "bg-red-500/20 text-red-400",
  };
  const label: Record<string, string> = {
    aguardando: "Aguardando",
    em_analise: "Em análise",
    em_andamento: "Em andamento",
    concluido: "Concluído",
    pronto_retirada: "Pronto p/ retirada",
    em_triagem: "Em triagem",
    aprovado: "Aprovado",
    recusado: "Recusado",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[status] || map.aguardando}`}>
      {label[status] || status}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-2 pb-1 border-t border-border/40">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{children}</span>
    </div>
  );
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function AdminLogistica() {
  const [recebimentos, setRecebimentos] = useState<Recebimento[]>([]);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecForm, setShowRecForm] = useState(false);
  const [showEnvForm, setShowEnvForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "recebimentos" | "envios" } | null>(null);

  const [recMes, setRecMes] = useState(0);
  const [envMes, setEnvMes] = useState(0);
  const [recMesAnt, setRecMesAnt] = useState(0);
  const [envMesAnt, setEnvMesAnt] = useState(0);

  // === Recebimento form state ===
  const [recPedidoCode, setRecPedidoCode] = useState("");
  const [recNome, setRecNome] = useState("");
  const [recTelefone, setRecTelefone] = useState("");
  const [recMarca, setRecMarca] = useState("");
  const [recModelo, setRecModelo] = useState("");
  const [recServico, setRecServico] = useState("");
  const [recProblema, setRecProblema] = useState("");
  const [recCondicao, setRecCondicao] = useState<string[]>([]);
  const [recAcessorios, setRecAcessorios] = useState<string[]>([]);
  const [recValor, setRecValor] = useState("");
  const [recPagamento, setRecPagamento] = useState("");
  const [recPrazo, setRecPrazo] = useState("");
  const [recStatus, setRecStatus] = useState("aguardando");
  const [recObs, setRecObs] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  // === Envio form state ===
  const [envNome, setEnvNome] = useState("");
  const [envMarcaF, setEnvMarcaF] = useState("");
  const [envModeloF, setEnvModeloF] = useState("");
  const [envTransportadora, setEnvTransportadora] = useState("");
  const [envRastreio, setEnvRastreio] = useState("");
  const [envObs, setEnvObs] = useState("");
  const [envServico, setEnvServico] = useState("");
  const [envValorCobrado, setEnvValorCobrado] = useState("");
  const [envPagamento, setEnvPagamento] = useState("");
  const [envDataSaida, setEnvDataSaida] = useState(new Date().toISOString().split("T")[0]);
  const [envEndereco, setEnvEndereco] = useState("");
  const [envRecebimentoId, setEnvRecebimentoId] = useState<string | null>(null);
  const [envSearchTerm, setEnvSearchTerm] = useState("");
  const [envLinked, setEnvLinked] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    const [recRes, envRes] = await Promise.all([
      supabase.from("recebimentos").select("*").order("data_chegada", { ascending: false }).limit(100),
      supabase.from("envios").select("*").order("data_envio", { ascending: false }).limit(100),
    ]);

    const recs = (recRes.data as unknown as Recebimento[]) || [];
    const envs = (envRes.data as unknown as Envio[]) || [];
    setRecebimentos(recs);
    setEnvios(envs);

    const thisM = recs.filter((r) => r.data_chegada >= startOfMonth).length;
    const lastM = recs.filter((r) => r.data_chegada >= startOfLastMonth && r.data_chegada < startOfMonth).length;
    setRecMes(thisM);
    setRecMesAnt(lastM);

    const thisE = envs.filter((e) => e.data_envio >= startOfMonth).length;
    const lastE = envs.filter((e) => e.data_envio >= startOfLastMonth && e.data_envio < startOfMonth).length;
    setEnvMes(thisE);
    setEnvMesAnt(lastE);

    setLoading(false);
  };

  const TrendIcon = ({ current, previous }: { current: number; previous: number }) => {
    if (current > previous) return <ArrowUp className="w-3 h-3 text-green-400" />;
    if (current < previous) return <ArrowDown className="w-3 h-3 text-red-400" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  // Generate next pedido_code
  const generatePedidoCode = async () => {
    const { data } = await supabase.rpc("generate_recebimento_code");
    return data as string || "PC-000001";
  };

  const openRecForm = async () => {
    resetRecForm();
    const code = await generatePedidoCode();
    setRecPedidoCode(code);
    setShowRecForm(true);
  };

  const resetRecForm = () => {
    setRecPedidoCode("");
    setRecNome("");
    setRecTelefone("");
    setRecMarca("");
    setRecModelo("");
    setRecServico("");
    setRecProblema("");
    setRecCondicao([]);
    setRecAcessorios([]);
    setRecValor("");
    setRecPagamento("");
    setRecPrazo("");
    setRecStatus("aguardando");
    setRecObs("");
  };

  const resetEnvForm = () => {
    setEnvNome("");
    setEnvMarcaF("");
    setEnvModeloF("");
    setEnvTransportadora("");
    setEnvRastreio("");
    setEnvObs("");
    setEnvServico("");
    setEnvValorCobrado("");
    setEnvPagamento("");
    setEnvDataSaida(new Date().toISOString().split("T")[0]);
    setEnvEndereco("");
    setEnvRecebimentoId(null);
    setEnvSearchTerm("");
    setEnvLinked(false);
  };

  const saveRecebimento = async () => {
    if (!recNome) { toast.error("Informe o nome"); return; }
    setFormSaving(true);
    const { error } = await supabase.from("recebimentos").insert({
      cliente_nome: recNome,
      cliente_telefone: recTelefone || null,
      marca: recMarca || null,
      modelo: recModelo || null,
      servico: recServico || null,
      observacoes: recObs || null,
      pedido_code: recPedidoCode || null,
      problema: recProblema || null,
      condicao_estetica: recCondicao,
      acessorios_entregues: recAcessorios,
      valor_orcamento: recValor ? parseFloat(recValor) : 0,
      forma_pagamento: recPagamento || null,
      prazo_dias: recPrazo ? parseInt(recPrazo) : null,
      status_triagem: recStatus,
    } as any);
    if (error) toast.error("Erro ao salvar");
    else { toast.success("Recebimento registrado!"); resetRecForm(); setShowRecForm(false); fetchAll(); }
    setFormSaving(false);
  };

  const saveEnvio = async () => {
    if (!envNome) { toast.error("Informe o nome"); return; }
    setFormSaving(true);
    const { error } = await supabase.from("envios").insert({
      cliente_nome: envNome,
      marca: envMarcaF || null,
      modelo: envModeloF || null,
      transportadora: envTransportadora || null,
      codigo_rastreio: envRastreio || null,
      observacoes: envObs || null,
      recebimento_id: envRecebimentoId || null,
      servico: envServico || null,
      valor_cobrado: envValorCobrado ? parseFloat(envValorCobrado) : 0,
      forma_pagamento: envPagamento || null,
      data_envio: envDataSaida || new Date().toISOString(),
      endereco_entrega: envEndereco || null,
    } as any);
    if (error) toast.error("Erro ao salvar");
    else { toast.success("Envio registrado!"); resetEnvForm(); setShowEnvForm(false); fetchAll(); }
    setFormSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from(deleteTarget.type).delete().eq("id", deleteTarget.id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Registro excluído!");
      if (deleteTarget.type === "recebimentos") {
        setRecebimentos((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      } else {
        setEnvios((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      }
    }
    setDeleteTarget(null);
  };

  // Autocomplete for envio linking
  const filteredRecebimentos = useMemo(() => {
    if (!envSearchTerm) return [];
    const term = envSearchTerm.toLowerCase();
    return recebimentos.filter(
      (r) =>
        r.cliente_nome.toLowerCase().includes(term) ||
        (r.pedido_code && r.pedido_code.toLowerCase().includes(term))
    ).slice(0, 5);
  }, [envSearchTerm, recebimentos]);

  const selectRecebimentoForEnvio = (r: Recebimento) => {
    setEnvRecebimentoId(r.id);
    setEnvNome(r.cliente_nome);
    setEnvMarcaF(r.marca || "");
    setEnvModeloF(r.modelo || "");
    setEnvServico(r.servico || "");
    setEnvSearchTerm(r.pedido_code ? `${r.pedido_code} — ${r.cliente_nome}` : r.cliente_nome);
    setEnvLinked(true);
  };

  const unlinkRecebimento = () => {
    setEnvRecebimentoId(null);
    setEnvLinked(false);
    setEnvSearchTerm("");
  };

  const toggleCheckbox = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-[Montserrat] uppercase tracking-wide">Logística</h1>

      {/* Counters */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <PackageCheck className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-muted-foreground">Recebimentos (mês)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-[Montserrat] text-yellow-400">{recMes}</span>
            <TrendIcon current={recMes} previous={recMesAnt} />
            <span className="text-[10px] text-muted-foreground">vs {recMesAnt} mês ant.</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-green-400" />
            <span className="text-xs text-muted-foreground">Envios (mês)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-[Montserrat] text-green-400">{envMes}</span>
            <TrendIcon current={envMes} previous={envMesAnt} />
            <span className="text-[10px] text-muted-foreground">vs {envMesAnt} mês ant.</span>
          </div>
        </div>
      </div>

      {/* Two panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recebimentos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Recebimentos</h2>
            <Button size="sm" onClick={openRecForm} className="gap-1">
              <Plus className="w-3 h-3" /> Novo
            </Button>
          </div>
          {recebimentos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum recebimento.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {recebimentos.map((r) => (
                <div key={r.id} className="rounded-lg border border-border bg-secondary/50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {r.pedido_code && (
                        <span className="text-[10px] font-mono text-primary font-bold shrink-0">{r.pedido_code}</span>
                      )}
                      <span className="text-sm font-medium truncate">{r.cliente_nome}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge(r.status_triagem)}
                      <button onClick={() => setDeleteTarget({ id: r.id, type: "recebimentos" })} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.marca} {r.modelo}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(r.data_chegada).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Envios */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Envios</h2>
            <Button size="sm" onClick={() => { resetEnvForm(); setShowEnvForm(true); }} className="gap-1">
              <Plus className="w-3 h-3" /> Novo
            </Button>
          </div>
          {envios.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum envio.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {envios.map((e) => (
                <div key={e.id} className="rounded-lg border border-border bg-secondary/50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{e.cliente_nome}</span>
                    <div className="flex items-center gap-2">
                      {e.codigo_rastreio && (
                        <span className="text-[10px] font-mono text-primary">{e.codigo_rastreio}</span>
                      )}
                      <button onClick={() => setDeleteTarget({ id: e.id, type: "envios" })} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{e.marca} {e.modelo}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {e.transportadora && `${e.transportadora} — `}
                    {new Date(e.data_envio).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== RECEBIMENTO FORM MODAL ===== */}
      <Dialog open={showRecForm} onOpenChange={setShowRecForm}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Registrar Recebimento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Pedido Code */}
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-center">
              <span className="text-xs text-muted-foreground">ID do Pedido:</span>
              <span className="ml-2 text-sm font-bold font-mono text-primary">{recPedidoCode}</span>
            </div>

            {/* Cliente */}
            <Input placeholder="Nome do cliente *" value={recNome} onChange={(e) => setRecNome(e.target.value)} />

            <SectionTitle>Contato</SectionTitle>
            <Input
              placeholder="Telefone/WhatsApp (00) 00000-0000"
              value={recTelefone}
              onChange={(e) => setRecTelefone(formatPhone(e.target.value))}
            />

            <SectionTitle>Aparelho e Serviço</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Marca" value={recMarca} onChange={(e) => setRecMarca(e.target.value)} />
              <Input placeholder="Modelo" value={recModelo} onChange={(e) => setRecModelo(e.target.value)} />
            </div>

            <Select value={recServico} onValueChange={setRecServico}>
              <SelectTrigger><SelectValue placeholder="Serviço solicitado" /></SelectTrigger>
              <SelectContent>
                {SERVICO_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <textarea
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[60px] resize-none"
              placeholder="Descreva o que o cliente relatou..."
              value={recProblema}
              onChange={(e) => setRecProblema(e.target.value)}
            />

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Condição estética</Label>
              <div className="grid grid-cols-2 gap-2">
                {CONDICAO_OPTIONS.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={recCondicao.includes(c)}
                      onCheckedChange={() => toggleCheckbox(recCondicao, setRecCondicao, c)}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Acessórios entregues</Label>
              <div className="grid grid-cols-2 gap-2">
                {ACESSORIOS_OPTIONS.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={recAcessorios.includes(a)}
                      onCheckedChange={() => toggleCheckbox(recAcessorios, setRecAcessorios, a)}
                    />
                    {a}
                  </label>
                ))}
              </div>
            </div>

            <SectionTitle>Financeiro</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Valor do orçamento (R$)</Label>
                <Input
                  type="number"
                  placeholder="0,00"
                  value={recValor}
                  onChange={(e) => setRecValor(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Prazo (dias úteis)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 5"
                  value={recPrazo}
                  onChange={(e) => setRecPrazo(e.target.value)}
                />
              </div>
            </div>

            <Select value={recPagamento} onValueChange={setRecPagamento}>
              <SelectTrigger><SelectValue placeholder="Forma de pagamento" /></SelectTrigger>
              <SelectContent>
                {PAGAMENTO_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>

            <SectionTitle>Status</SectionTitle>
            <Select value={recStatus} onValueChange={setRecStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <SectionTitle>Observações</SectionTitle>
            <Input placeholder="Observações adicionais" value={recObs} onChange={(e) => setRecObs(e.target.value)} />

            <Button onClick={saveRecebimento} disabled={formSaving} className="w-full">
              {formSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Registrar Recebimento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== ENVIO FORM MODAL ===== */}
      <Dialog open={showEnvForm} onOpenChange={setShowEnvForm}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Registrar Envio</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Link to recebimento */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Vincular a pedido de recebimento (opcional)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Busque por nome ou ID (ex: PC-000001)"
                  value={envSearchTerm}
                  onChange={(e) => { setEnvSearchTerm(e.target.value); if (envLinked) unlinkRecebimento(); }}
                />
              </div>
              {!envLinked && envSearchTerm && filteredRecebimentos.length > 0 && (
                <div className="mt-1 rounded-md border border-border bg-card max-h-40 overflow-y-auto">
                  {filteredRecebimentos.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => selectRecebimentoForEnvio(r)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/80 transition-colors border-b border-border/30 last:border-0"
                    >
                      <span className="font-mono text-primary text-xs mr-2">{r.pedido_code}</span>
                      <span>{r.cliente_nome}</span>
                      <span className="text-muted-foreground text-xs ml-2">{r.marca} {r.modelo}</span>
                    </button>
                  ))}
                </div>
              )}
              {envLinked && (
                <div className="mt-1 flex items-center gap-2 text-xs text-green-400">
                  <span>✓ Vinculado</span>
                  <button onClick={unlinkRecebimento} className="text-muted-foreground hover:text-destructive underline">Desvincular</button>
                </div>
              )}
            </div>

            {/* Cliente */}
            <Input
              placeholder="Nome do cliente *"
              value={envNome}
              onChange={(e) => setEnvNome(e.target.value)}
              readOnly={envLinked}
              className={envLinked ? "opacity-70" : ""}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Marca"
                value={envMarcaF}
                onChange={(e) => setEnvMarcaF(e.target.value)}
                readOnly={envLinked}
                className={envLinked ? "opacity-70" : ""}
              />
              <Input
                placeholder="Modelo"
                value={envModeloF}
                onChange={(e) => setEnvModeloF(e.target.value)}
                readOnly={envLinked}
                className={envLinked ? "opacity-70" : ""}
              />
            </div>

            <Input
              placeholder="Serviço realizado"
              value={envServico}
              onChange={(e) => setEnvServico(e.target.value)}
              readOnly={envLinked}
              className={envLinked ? "opacity-70" : ""}
            />

            <SectionTitle>Financeiro</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Valor cobrado (R$)</Label>
                <Input
                  type="number"
                  placeholder="0,00"
                  value={envValorCobrado}
                  onChange={(e) => setEnvValorCobrado(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Pagamento</Label>
                <Select value={envPagamento} onValueChange={setEnvPagamento}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {PAGAMENTO_ENVIO_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SectionTitle>Envio</SectionTitle>
            <Input placeholder="Transportadora" value={envTransportadora} onChange={(e) => setEnvTransportadora(e.target.value)} />
            <Input placeholder="Código de rastreio" value={envRastreio} onChange={(e) => setEnvRastreio(e.target.value)} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Data de saída</Label>
                <Input
                  type="date"
                  value={envDataSaida}
                  onChange={(e) => setEnvDataSaida(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Endereço de entrega</Label>
              <Input
                placeholder="Endereço completo do cliente"
                value={envEndereco}
                onChange={(e) => setEnvEndereco(e.target.value)}
              />
            </div>

            <SectionTitle>Observações</SectionTitle>
            <Input placeholder="Observações" value={envObs} onChange={(e) => setEnvObs(e.target.value)} />

            <Button onClick={saveEnvio} disabled={formSaving} className="w-full">
              {formSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Registrar Envio
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
