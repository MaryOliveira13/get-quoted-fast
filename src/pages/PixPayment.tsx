import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { getShippingDraft, getQuoteDraft } from "@/lib/storage";
import { buildPixPayload, copyToClipboard } from "@/lib/pix";
import { formatBRL } from "@/lib/money";
import { AlertCircle, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function PixPayment() {
  const navigate = useNavigate();
  const quote = getQuoteDraft();
  const draft = getShippingDraft();
  const [paid, setPaid] = useState(false);

  const priceCents = draft.shippingPriceCents || 0;
  const shippingType = draft.selectedShipping || "PAC";

  const pixPayload = useMemo(() => {
    return buildPixPayload({
      amountCents: priceCents,
      referenceId: `PC-${Date.now()}`,
    });
  }, [priceCents]);

  if (!quote || !priceCents) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Pagamento" backTo="/envio/frete" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">Dados de pagamento não encontrados.</p>
          <Button variant="outline" onClick={() => navigate("/envio/frete")}>Voltar</Button>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    copyToClipboard(pixPayload).then(() => toast.success("Código Pix copiado!"));
  };

  const handlePaid = () => {
    setPaid(true);
    toast.success("Pagamento registrado! Entraremos em contato em breve.");
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHeader title="Pagamento via Pix" backTo="/envio/frete" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Valor do frete ({shippingType})
          </p>
          <p className="text-3xl font-bold">{formatBRL(priceCents)}</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-xl">
            <QRCode value={pixPayload} size={200} />
          </div>
        </div>

        {/* Copy code */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold">Pix copia e cola</p>
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs text-muted-foreground break-all font-mono">{pixPayload}</p>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleCopy}>
            <Copy className="w-4 h-4" />
            Copiar código Pix
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          ⏱ O QR Code expira em 30 minutos. Após o pagamento, clique em "Já paguei".
        </p>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t px-4 py-4">
        <div className="max-w-lg mx-auto">
          {paid ? (
            <div className="flex items-center justify-center gap-2 text-whatsapp py-3">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Pagamento registrado!</span>
            </div>
          ) : (
            <Button
              variant="whatsapp"
              size="lg"
              className="w-full text-base"
              onClick={handlePaid}
            >
              Já paguei
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
