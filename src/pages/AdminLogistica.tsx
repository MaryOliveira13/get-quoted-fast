import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PackageCheck, Truck, Loader2, Plus, ArrowUp, ArrowDown, Minus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Recebimento {
  id: string;
  cliente_nome: string;
  marca: string | null;
  modelo: string | null;
  status_triagem: string;
  data_chegada: string;
  observacoes: string | null;
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
}

const TRIAGEM_OPTIONS = [
  { value: "aguardando", label: "Aguardando" },
  { value: "em_triagem", label: "Em triagem" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recusado", label: "Recusado" },
];

function triagemBadge(status: string) {
  const map: Record<string, string> = {
    aguardando: "bg-yellow-500/20 text-yellow-400",
    em_triagem: "bg-blue-500/20 text-blue-400",
    aprovado: "bg-green-500/20 text-green-400",
    recusado: "bg-red-500/20 text-red-400",
  };
  const label: Record<string, string> = {
    aguardando: "Aguardando",
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

export default function AdminLogistica() {
  const [recebimentos, setRecebimentos] = useState<Recebimento[]>([]);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecForm, setShowRecForm] = useState(false);
  const [showEnvForm, setShowEnvForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "recebimentos" | "envios" } | null>(null);

  // Counters
  const [recMes, setRecMes] = useState(0);
  const [envMes, setEnvMes] = useState(0);
  const [recMesAnt, setRecMesAnt] = useState(0);
  const [envMesAnt, setEnvMesAnt] = useState(0);

  // Form fields
  const [formNome, setFormNome] = useState("");
  const [formMarca, setFormMarca] = useState("");
  const [formModelo, setFormModelo] = useState("");
  const [formObs, setFormObs] = useState("");
  const [formTransportadora, setFormTransportadora] = useState("");
  const [formRastreio, setFormRastreio] = useState("");
  const [formSaving, setFormSaving] = useState(false);

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

    const recs = (recRes.data as Recebimento[]) || [];
    const envs = (envRes.data as Envio[]) || [];
    setRecebimentos(recs);
    setEnvios(envs);

    // Count current/last month
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

  const saveRecebimento = async () => {
    if (!formNome) { toast.error("Informe o nome"); return; }
    setFormSaving(true);
    const { error } = await supabase.from("recebimentos").insert({
      cliente_nome: formNome,
      marca: formMarca || null,
      modelo: formModelo || null,
      observacoes: formObs || null,
    } as any);
    if (error) toast.error("Erro ao salvar");
    else { toast.success("Recebimento registrado!"); resetForm(); setShowRecForm(false); fetchAll(); }
    setFormSaving(false);
  };

  const saveEnvio = async () => {
    if (!formNome) { toast.error("Informe o nome"); return; }
    setFormSaving(true);
    const { error } = await supabase.from("envios").insert({
      cliente_nome: formNome,
      marca: formMarca || null,
      modelo: formModelo || null,
      transportadora: formTransportadora || null,
      codigo_rastreio: formRastreio || null,
      observacoes: formObs || null,
    } as any);
    if (error) toast.error("Erro ao salvar");
    else { toast.success("Envio registrado!"); resetForm(); setShowEnvForm(false); fetchAll(); }
    setFormSaving(false);
  };

  const resetForm = () => {
    setFormNome(""); setFormMarca(""); setFormModelo(""); setFormObs("");
    setFormTransportadora(""); setFormRastreio("");
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
            <Button size="sm" onClick={() => { resetForm(); setShowRecForm(true); }} className="gap-1">
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
                    <span className="text-sm font-medium truncate">{r.cliente_nome}</span>
                    <div className="flex items-center gap-2">
                      {triagemBadge(r.status_triagem)}
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
            <Button size="sm" onClick={() => { resetForm(); setShowEnvForm(true); }} className="gap-1">
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

      {/* Recebimento Form Modal */}
      <Dialog open={showRecForm} onOpenChange={setShowRecForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Registrar Recebimento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nome do cliente *" value={formNome} onChange={(e) => setFormNome(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Marca" value={formMarca} onChange={(e) => setFormMarca(e.target.value)} />
              <Input placeholder="Modelo" value={formModelo} onChange={(e) => setFormModelo(e.target.value)} />
            </div>
            <Input placeholder="Observações" value={formObs} onChange={(e) => setFormObs(e.target.value)} />
            <Button onClick={saveRecebimento} disabled={formSaving} className="w-full">
              {formSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Registrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Envio Form Modal */}
      <Dialog open={showEnvForm} onOpenChange={setShowEnvForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Registrar Envio</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nome do cliente *" value={formNome} onChange={(e) => setFormNome(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Marca" value={formMarca} onChange={(e) => setFormMarca(e.target.value)} />
              <Input placeholder="Modelo" value={formModelo} onChange={(e) => setFormModelo(e.target.value)} />
            </div>
            <Input placeholder="Transportadora" value={formTransportadora} onChange={(e) => setFormTransportadora(e.target.value)} />
            <Input placeholder="Código de rastreio" value={formRastreio} onChange={(e) => setFormRastreio(e.target.value)} />
            <Input placeholder="Observações" value={formObs} onChange={(e) => setFormObs(e.target.value)} />
            <Button onClick={saveEnvio} disabled={formSaving} className="w-full">
              {formSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Registrar
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
