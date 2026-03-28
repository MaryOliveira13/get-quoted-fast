import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BRANDS, MODELS_DATABASE } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Download, FileText, Plus, History, X, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import jsPDF from "jspdf";
import powercellLogo from "@/assets/powercell-logo.png";

interface Orcamento {
  id: string;
  cliente_nome: string;
  cliente_telefone: string | null;
  marca: string;
  modelo: string;
  servicos: any;
  valor_total: number;
  observacoes: string | null;
  validade_dias: number;
  created_at: string;
  status: string;
}

interface ServiceLine {
  name: string;
  price: number;
  selected: boolean;
  customPrice: string;
}

interface OutroDefeito {
  descricao: string;
  valor: string;
}

export default function AdminOrcamentos() {
  const [tab, setTab] = useState<"form" | "history">("form");

  // Form state
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [serviceLines, setServiceLines] = useState<ServiceLine[]>([]);
  const [outrosDefeitos, setOutrosDefeitos] = useState<OutroDefeito[]>([{ descricao: "", valor: "" }]);
  const [observacoes, setObservacoes] = useState("");
  const [validadeDias, setValidadeDias] = useState("7");
  const [saving, setSaving] = useState(false);

  // History
  const [historico, setHistorico] = useState<Orcamento[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const models = useMemo(() => {
    if (!marca) return [];
    return MODELS_DATABASE.filter((m) => m.brand.toLowerCase() === marca.toLowerCase());
  }, [marca]);

  const selectedModel = useMemo(() => {
    return MODELS_DATABASE.find((m) => m.brand.toLowerCase() === marca.toLowerCase() && m.model === modelo);
  }, [marca, modelo]);

  useEffect(() => {
    if (selectedModel) {
      setServiceLines(
        selectedModel.services.map((s) => ({
          name: s.name,
          price: s.price,
          selected: false,
          customPrice: s.price.toFixed(2).replace(".", ","),
        }))
      );
    } else {
      setServiceLines([]);
    }
  }, [selectedModel]);

  const valorTotal = useMemo(() => {
    let total = serviceLines
      .filter((s) => s.selected)
      .reduce((sum, s) => sum + parseFloat(s.customPrice.replace(",", ".") || "0"), 0);
    outrosDefeitos.forEach((d) => {
      if (d.descricao && d.valor) {
        total += parseFloat(d.valor.replace(",", ".") || "0");
      }
    });
    return total;
  }, [serviceLines, outrosDefeitos]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from("orcamentos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setHistorico((data as Orcamento[]) || []);
    setLoadingHistory(false);
  };

  useEffect(() => {
    if (tab === "history") fetchHistory();
  }, [tab]);

  const handleSave = async () => {
    if (!clienteNome || !marca || !modelo) {
      toast.error("Preencha nome, marca e modelo");
      return;
    }
    const selectedServices = serviceLines
      .filter((s) => s.selected)
      .map((s) => ({ name: s.name, price: parseFloat(s.customPrice.replace(",", ".") || "0") }));
    outrosDefeitos.forEach((d) => {
      if (d.descricao) {
        selectedServices.push({ name: d.descricao, price: parseFloat(d.valor.replace(",", ".") || "0") });
      }
    });
    if (selectedServices.length === 0) {
      toast.error("Selecione pelo menos um serviço");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("orcamentos").insert({
      cliente_nome: clienteNome,
      cliente_telefone: clienteTelefone || null,
      marca,
      modelo,
      servicos: selectedServices,
      valor_total: valorTotal,
      observacoes: observacoes || null,
      validade_dias: parseInt(validadeDias) || 7,
    } as any);

    if (error) {
      toast.error("Erro ao salvar orçamento");
      console.error(error);
    } else {
      toast.success("Orçamento salvo!");
      setClienteNome("");
      setClienteTelefone("");
      setMarca("");
      setModelo("");
      setServiceLines([]);
      setOutrosDefeitos([{ descricao: "", valor: "" }]);
      setObservacoes("");
    }
    setSaving(false);
  };

  const toggleStatus = async (orc: Orcamento) => {
    const newStatus = orc.status === "fechado" ? "nao_fechado" : "fechado";
    const { error } = await supabase.from("orcamentos").update({ status: newStatus } as any).eq("id", orc.id);
    if (error) {
      toast.error("Erro ao atualizar status");
      return;
    }
    setHistorico((prev) => prev.map((o) => (o.id === orc.id ? { ...o, status: newStatus } : o)));
    toast.success(newStatus === "fechado" ? "Orçamento marcado como fechado" : "Orçamento marcado como não fechado");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("orcamentos").delete().eq("id", deleteId);
    if (error) {
      toast.error("Erro ao excluir orçamento");
    } else {
      setHistorico((prev) => prev.filter((o) => o.id !== deleteId));
      toast.success("Orçamento excluído com sucesso");
    }
    setDeleteId(null);
  };

  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setLogoImg(img);
    img.src = powercellLogo;
  }, []);

  const generatePDF = (orc?: Orcamento) => {
    const data = orc || {
      cliente_nome: clienteNome,
      cliente_telefone: clienteTelefone,
      marca,
      modelo,
      servicos: serviceLines
        .filter((s) => s.selected)
        .map((s) => ({ name: s.name, price: parseFloat(s.customPrice.replace(",", ".") || "0") }))
        .concat(outrosDefeitos.filter((d) => d.descricao).map((d) => ({ name: d.descricao, price: parseFloat(d.valor.replace(",", ".") || "0") }))),
      valor_total: orc?.valor_total || valorTotal,
      observacoes: orc?.observacoes || observacoes,
      validade_dias: orc?.validade_dias || parseInt(validadeDias) || 7,
      created_at: orc?.created_at || new Date().toISOString(),
    };

    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header with logo
    doc.setFillColor(13, 13, 13);
    doc.rect(0, 0, pageW, 55, "F");

    // Add logo
    try {
      const logoW = 30;
      const logoH = 30;
      doc.addImage(powercellLogo, "PNG", (pageW - logoW) / 2, 5, logoW, logoH);
      y = 40;
    } catch {
      y = 18;
    }

    doc.setTextColor(255, 107, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Orçamento", pageW / 2, y, { align: "center" });
    y += 8;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Data: ${new Date(data.created_at).toLocaleDateString("pt-BR")}`, pageW / 2, y, { align: "center" });

    y = 65;
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Dados do Cliente", 15, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nome: ${data.cliente_nome}`, 15, y); y += 6;
    if (data.cliente_telefone) { doc.text(`Telefone: ${data.cliente_telefone}`, 15, y); y += 6; }

    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Aparelho", 15, y); y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${data.marca} ${data.modelo}`, 15, y); y += 10;

    // Services table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Serviços", 15, y); y += 8;

    const services = Array.isArray(data.servicos) ? data.servicos : [];
    doc.setFontSize(10);
    services.forEach((s: any) => {
      doc.setFont("helvetica", "normal");
      doc.text(s.name, 20, y);
      doc.text(`R$ ${Number(s.price).toFixed(2).replace(".", ",")}`, pageW - 20, y, { align: "right" });
      y += 7;
    });

    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y, pageW - 15, y);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 107, 0);
    doc.text("Total:", 20, y);
    doc.text(`R$ ${Number(data.valor_total).toFixed(2).replace(".", ",")}`, pageW - 20, y, { align: "right" });

    y += 12;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    if (data.observacoes) {
      doc.text(`Observações: ${data.observacoes}`, 15, y); y += 6;
    }
    doc.text(`Validade: ${data.validade_dias} dias`, 15, y);

    doc.save(`orcamento-${data.cliente_nome.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    toast.success("PDF gerado!");
  };

  const generatePNG = (orc?: Orcamento) => {
    const data = orc || {
      cliente_nome: clienteNome,
      marca,
      modelo,
      servicos: serviceLines
        .filter((s) => s.selected)
        .map((s) => ({ name: s.name, price: parseFloat(s.customPrice.replace(",", ".") || "0") }))
        .concat(outrosDefeitos.filter((d) => d.descricao).map((d) => ({ name: d.descricao, price: parseFloat(d.valor.replace(",", ".") || "0") }))),
      valor_total: orc?.valor_total || valorTotal,
      observacoes: orc?.observacoes || observacoes,
      validade_dias: orc?.validade_dias || parseInt(validadeDias) || 7,
      created_at: orc?.created_at || new Date().toISOString(),
    };

    const services = Array.isArray(data.servicos) ? data.servicos : [];
    const canvasHeight = 800 + Math.max(0, (services.length - 5) * 24);

    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = 600 * scale;
    canvas.height = canvasHeight * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(0, 0, 600, canvasHeight);

    let y = 20;

    // Draw logo if loaded
    if (logoImg) {
      const logoW = 80;
      const logoH = 80;
      ctx.drawImage(logoImg, (600 - logoW) / 2, y, logoW, logoH);
      y += logoH + 10;
    }

    // Title
    ctx.fillStyle = "#FF6B00";
    ctx.font = "bold 24px Montserrat, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Orçamento", 300, y + 5);
    y += 15;

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText(new Date(data.created_at).toLocaleDateString("pt-BR"), 300, y + 5);
    y += 20;

    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(560, y);
    ctx.stroke();
    y += 25;

    ctx.textAlign = "left";

    // Client
    ctx.fillStyle = "#FF6B00";
    ctx.font = "bold 14px Montserrat, sans-serif";
    ctx.fillText("CLIENTE", 40, y); y += 22;
    ctx.fillStyle = "#fff";
    ctx.font = "15px Inter, sans-serif";
    ctx.fillText(data.cliente_nome, 40, y); y += 30;

    // Device
    ctx.fillStyle = "#FF6B00";
    ctx.font = "bold 14px Montserrat, sans-serif";
    ctx.fillText("APARELHO", 40, y); y += 22;
    ctx.fillStyle = "#fff";
    ctx.font = "15px Inter, sans-serif";
    ctx.fillText(`${data.marca} ${data.modelo}`, 40, y); y += 35;

    // Services
    ctx.fillStyle = "#FF6B00";
    ctx.font = "bold 14px Montserrat, sans-serif";
    ctx.fillText("SERVIÇOS", 40, y); y += 22;

    services.forEach((s: any) => {
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "14px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`• ${s.name}`, 50, y);
      ctx.textAlign = "right";
      ctx.fillText(`R$ ${Number(s.price).toFixed(2).replace(".", ",")}`, 560, y);
      y += 24;
    });

    y += 10;
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(560, y);
    ctx.stroke();
    y += 30;

    // Total
    ctx.textAlign = "left";
    ctx.fillStyle = "#FF6B00";
    ctx.font = "bold 20px Montserrat, sans-serif";
    ctx.fillText("TOTAL", 40, y);
    ctx.textAlign = "right";
    ctx.fillText(`R$ ${Number(data.valor_total).toFixed(2).replace(".", ",")}`, 560, y);

    y += 40;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "12px Inter, sans-serif";
    if (data.observacoes) {
      ctx.fillText(`Obs: ${data.observacoes}`, 40, y); y += 18;
    }
    ctx.fillText(`Validade: ${data.validade_dias} dias`, 40, y);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orcamento-${data.cliente_nome.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Imagem gerada!");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-[Montserrat] uppercase tracking-wide">Orçamentos</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={tab === "form" ? "default" : "outline"}
            onClick={() => setTab("form")}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Novo
          </Button>
          <Button
            size="sm"
            variant={tab === "history" ? "default" : "outline"}
            onClick={() => setTab("history")}
            className="gap-2"
          >
            <History className="w-4 h-4" /> Histórico
          </Button>
        </div>
      </div>

      {tab === "form" ? (
        <div className="rounded-xl border border-border bg-card p-5 space-y-5 max-w-2xl">
          {/* Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nome do cliente *</label>
              <Input value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} placeholder="Nome completo" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Telefone/WhatsApp</label>
              <Input value={clienteTelefone} onChange={(e) => setClienteTelefone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
          </div>

          {/* Device */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Marca *</label>
              <Select value={marca} onValueChange={(v) => { setMarca(v); setModelo(""); }}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {BRANDS.map((b) => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Modelo *</label>
              <Select value={modelo} onValueChange={setModelo} disabled={!marca}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {models.map((m) => <SelectItem key={m.model} value={m.model}>{m.model}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Services */}
          {serviceLines.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground block">Serviços</label>
              {serviceLines.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <Checkbox
                    checked={s.selected}
                    onCheckedChange={(checked) => {
                      const next = [...serviceLines];
                      next[i].selected = !!checked;
                      setServiceLines(next);
                    }}
                  />
                  <span className="text-sm flex-1">{s.name}</span>
                  <Input
                    className="w-28 text-right text-sm"
                    value={s.customPrice}
                    onChange={(e) => {
                      const next = [...serviceLines];
                      next[i].customPrice = e.target.value;
                      setServiceLines(next);
                    }}
                    disabled={!s.selected}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Outros defeitos - dynamic list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground block">Outros defeitos</label>
              <button
                type="button"
                onClick={() => setOutrosDefeitos([...outrosDefeitos, { descricao: "", valor: "" }])}
                className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Adicionar defeito"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {outrosDefeitos.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  className="flex-1 text-sm"
                  value={d.descricao}
                  onChange={(e) => {
                    const next = [...outrosDefeitos];
                    next[i].descricao = e.target.value;
                    setOutrosDefeitos(next);
                  }}
                  placeholder="Descreva o defeito..."
                />
                <Input
                  className="w-28 text-right text-sm"
                  value={d.valor}
                  onChange={(e) => {
                    const next = [...outrosDefeitos];
                    next[i].valor = e.target.value;
                    setOutrosDefeitos(next);
                  }}
                  placeholder="R$ 0,00"
                />
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => setOutrosDefeitos(outrosDefeitos.filter((_, idx) => idx !== i))}
                    className="p-1 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Obs + validade */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Observações</label>
            <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Observações adicionais..." rows={3} />
          </div>
          <div className="w-32">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Validade (dias)</label>
            <Input value={validadeDias} onChange={(e) => setValidadeDias(e.target.value)} type="number" />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm font-semibold text-muted-foreground">Total estimado</span>
            <span className="text-xl font-bold font-[Montserrat] text-primary">
              R$ {valorTotal.toFixed(2).replace(".", ",")}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Salvar orçamento
            </Button>
            <Button variant="outline" onClick={() => generatePDF()} className="gap-2">
              <Download className="w-4 h-4" /> Baixar PDF
            </Button>
            <Button variant="outline" onClick={() => generatePNG()} className="gap-2">
              <Download className="w-4 h-4" /> Baixar PNG
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {loadingHistory ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : historico.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">Nenhum orçamento gerado.</p>
          ) : (
            historico.map((orc) => (
              <div key={orc.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{orc.cliente_nome}</p>
                  <p className="text-xs text-muted-foreground">{orc.marca} {orc.modelo} — {new Date(orc.created_at).toLocaleDateString("pt-BR")}</p>
                  <p className="text-sm font-bold font-[Montserrat] text-primary mt-1">
                    R$ {Number(orc.valor_total).toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleStatus(orc)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      orc.status === "fechado"
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    }`}
                  >
                    {orc.status === "fechado" ? "Fechado" : "Não fechado"}
                  </button>
                  <Button size="sm" variant="outline" onClick={() => generatePDF(orc)} className="gap-1">
                    <Download className="w-3 h-3" /> PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => generatePNG(orc)} className="gap-1">
                    <Download className="w-3 h-3" /> PNG
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
