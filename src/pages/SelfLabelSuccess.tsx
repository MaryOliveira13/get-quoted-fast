import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { getOsRecord, getQuoteDraft, clearOsData } from "@/lib/storage";
import { formatBRL } from "@/lib/money";
import { openWhatsApp, msgEtiquetaPropria } from "@/lib/whatsapp";
import { STORE_SHIPPING_ADDRESS } from "@/config/store";
import { AlertCircle, CheckCircle, Copy, Download, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

export default function SelfLabelSuccess() {
  const navigate = useNavigate();
  const os = getOsRecord();
  const quote = getQuoteDraft();

  if (!os || !quote) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="OS" backTo="/envio" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">Nenhuma OS encontrada.</p>
          <Button variant="outline" onClick={() => navigate("/orcamento")}>Voltar</Button>
        </div>
      </div>
    );
  }

  const addr = STORE_SHIPPING_ADDRESS;
  const addrText = `${addr.street}, ${addr.number} - ${addr.district}, ${addr.city} - ${addr.state}, ${addr.zip}`;

  const copyCode = () => {
    navigator.clipboard.writeText(os.osCode);
    toast.success("Código copiado!");
  };

  const handleWhatsApp = () => {
    openWhatsApp(
      msgEtiquetaPropria({
        osCode: os.osCode,
        fullName: os.client.fullName || "",
        phone: os.client.phone || "",
        email: os.client.email || "",
        street: os.client.street || "",
        number: os.client.number || "",
        district: os.client.district || "",
        city: os.client.city || "",
        uf: os.client.uf || "",
        cep: os.client.cep || "",
        modelName: os.modelName,
        brandName: os.brandName,
        services: os.services,
        totalCents: os.totalCents,
        accessories: os.client.accessories || [],
      })
    );
  };

  const handleNewOS = () => {
    clearOsData();
    localStorage.removeItem("quoteDraft");
    navigate("/orcamento");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const m = 20;
    let y = m;

    doc.setFontSize(18);
    doc.text("Ordem de Serviço", m, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Código: ${os.osCode}`, m, y); y += 7;
    doc.text(`Data: ${new Date(os.createdAt).toLocaleDateString("pt-BR")}`, m, y); y += 10;

    doc.setFontSize(14);
    doc.text("Cliente", m, y); y += 7;
    doc.setFontSize(11);
    doc.text(`Nome: ${os.client.fullName}`, m, y); y += 6;
    doc.text(`CPF: ${os.client.cpf}`, m, y); y += 6;
    doc.text(`Telefone: ${os.client.phone}`, m, y); y += 6;
    doc.text(`E-mail: ${os.client.email}`, m, y); y += 6;
    doc.text(`Endereço: ${os.client.street}, ${os.client.number} - ${os.client.district}`, m, y); y += 6;
    doc.text(`${os.client.city}/${os.client.uf} - CEP: ${os.client.cep}`, m, y); y += 10;

    doc.setFontSize(14);
    doc.text("Aparelho", m, y); y += 7;
    doc.setFontSize(11);
    doc.text(`Modelo: ${os.modelName} (${os.brandName})`, m, y); y += 6;
    doc.text(`Tipo: ${os.client.deviceType || "Celular"}`, m, y); y += 6;
    doc.text(`Valor declarado: ${formatBRL(os.client.deviceValueCents || 0)}`, m, y); y += 10;

    doc.setFontSize(14);
    doc.text("Serviços", m, y); y += 7;
    doc.setFontSize(11);
    os.services.forEach((s) => {
      doc.text(`• ${s.label} — ${formatBRL(s.priceCents)}`, m, y); y += 6;
    });
    doc.setFontSize(12);
    doc.text(`Total: ${formatBRL(os.totalCents)}`, m, y); y += 10;

    if (os.client.accessories && os.client.accessories.length > 0) {
      doc.setFontSize(14);
      doc.text("Acessórios", m, y); y += 7;
      doc.setFontSize(11);
      doc.text(os.client.accessories.join(", "), m, y); y += 10;
    }

    doc.setFontSize(14);
    doc.text("Endereço de Envio", m, y); y += 7;
    doc.setFontSize(11);
    doc.text(addrText, m, y, { maxWidth: 170 });

    doc.save(`OS-${os.osCode}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Success header */}
      <div className="bg-gradient-to-br from-destructive/80 to-destructive/60 px-4 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-background/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-destructive-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-destructive-foreground">OS Gerada com Sucesso!</h1>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="bg-background/20 text-destructive-foreground px-4 py-2 rounded-lg text-lg font-mono font-bold tracking-wider">
            {os.osCode}
          </span>
          <button onClick={copyCode} className="p-2 rounded-lg bg-background/20 hover:bg-background/30 transition-colors">
            <Copy className="w-5 h-5 text-destructive-foreground" />
          </button>
        </div>
      </div>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {/* Device summary */}
        <div className="rounded-xl border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">📱 Resumo do aparelho</h3>
          <p className="text-sm">{os.modelName} ({os.brandName})</p>
          <p className="text-sm text-muted-foreground">Problema: {os.client.problem}</p>
          <p className="text-sm text-muted-foreground">Valor declarado: {formatBRL(os.client.deviceValueCents || 0)}</p>
          <div className="border-t pt-2 flex justify-between font-semibold text-sm">
            <span>Total serviços</span>
            <span>{formatBRL(os.totalCents)}</span>
          </div>
        </div>

        {/* Download PDF */}
        <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleDownloadPDF}>
          <Download className="w-5 h-5" />
          Baixar OS em PDF
        </Button>

        {/* Shipping instructions */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-base">📦 Instruções de Envio</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Embale seu aparelho com proteção adequada</li>
            <li>Inclua uma cópia da OS no pacote</li>
            <li>Envie para o endereço abaixo</li>
          </ol>
        </div>

        {/* Store address */}
        <div className="rounded-xl border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">📍 Endereço de envio</h3>
          <p className="text-sm leading-relaxed">{addrText}</p>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { navigator.clipboard.writeText(addrText); toast.success("Endereço copiado!"); }}>
            <Copy className="w-4 h-4" />
            Copiar endereço
          </Button>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Button variant="whatsapp" size="lg" className="w-full text-base gap-2" onClick={handleWhatsApp}>
            <MessageSquare className="w-5 h-5" />
            Confirmar envio via WhatsApp
          </Button>
          <Button variant="outline" size="lg" className="w-full text-base gap-2" onClick={handleNewOS}>
            <Plus className="w-5 h-5" />
            Criar outro orçamento
          </Button>
        </div>
      </main>
    </div>
  );
}
