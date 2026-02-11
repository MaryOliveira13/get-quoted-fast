import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { getShippingDraft, updateShippingDraft, getQuoteDraft } from "@/lib/storage";
import { formatBRL } from "@/lib/money";
import { AlertCircle, Package, Zap } from "lucide-react";

const SIMULATED_PAC_CENTS = 4553;
const SIMULATED_SEDEX_CENTS = 5642;

export default function ShippingRates() {
  const navigate = useNavigate();
  const quote = getQuoteDraft();
  const draft = getShippingDraft();
  const [selected, setSelected] = useState<"PAC" | "SEDEX" | null>(
    draft.selectedShipping || null
  );

  if (!quote) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Frete" backTo="/envio/confirmacao" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">Nenhum orçamento encontrado.</p>
          <Button variant="outline" onClick={() => navigate("/orcamento")}>Voltar</Button>
        </div>
      </div>
    );
  }

  // Self label: no payment needed
  if (draft.shippingMethod === "self_label") {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Envio" backTo="/envio/confirmacao" />
        <main className="px-4 py-10 max-w-lg mx-auto text-center space-y-4">
          <Package className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-bold">Você vai gerar sua etiqueta</h2>
          <p className="text-sm text-muted-foreground">
            Como você escolheu gerar sua própria etiqueta, não há pagamento de frete aqui.
            Envie o aparelho para nosso endereço e nos avise pelo WhatsApp.
          </p>
          <Button
            variant="whatsapp"
            size="lg"
            className="w-full text-base mt-6"
            onClick={() => {
              const msg = `Olá! Acabei de preencher o formulário de envio do meu ${quote.modelName} (${quote.brandName}). Vou gerar minha própria etiqueta. Pode me confirmar o endereço?`;
              window.open(`https://wa.me/5531998562010?text=${encodeURIComponent(msg)}`, "_blank");
            }}
          >
            Avisar no WhatsApp
          </Button>
        </main>
      </div>
    );
  }

  const deviceValue = draft.devices?.[0]?.valueCents || 0;

  const handleContinue = () => {
    if (!selected) return;
    updateShippingDraft({
      selectedShipping: selected,
      shippingPriceCents: selected === "PAC" ? SIMULATED_PAC_CENTS : SIMULATED_SEDEX_CENTS,
    });
    navigate("/envio/pagamento-pix");
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHeader title="Escolha o frete" backTo="/envio/confirmacao" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
        <div className="text-center space-y-1 mb-4">
          <h2 className="text-xl font-bold">Escolha o tipo de envio</h2>
          <p className="text-sm text-muted-foreground">Selecione PAC ou SEDEX</p>
          {draft.city && draft.uf && (
            <p className="text-xs text-muted-foreground">
              Envio de: {draft.city}, {draft.uf}
            </p>
          )}
        </div>

        {/* PAC */}
        <button
          onClick={() => setSelected("PAC")}
          className={`w-full rounded-xl border p-5 text-left transition-all active:scale-[0.98] space-y-2 ${
            selected === "PAC" ? "border-whatsapp bg-whatsapp/5" : "border-border bg-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold">PAC</span>
            </div>
            <span className="text-lg font-bold">{formatBRL(SIMULATED_PAC_CENTS)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            8–9 dias úteis • Seguro incluso até {formatBRL(deviceValue)}
          </p>
        </button>

        {/* SEDEX */}
        <button
          onClick={() => setSelected("SEDEX")}
          className={`w-full rounded-xl border p-5 text-left transition-all active:scale-[0.98] space-y-2 ${
            selected === "SEDEX" ? "border-whatsapp bg-whatsapp/5" : "border-border bg-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold">SEDEX</span>
            </div>
            <span className="text-lg font-bold">{formatBRL(SIMULATED_SEDEX_CENTS)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            4–5 dias úteis • Seguro incluso até {formatBRL(deviceValue)}
          </p>
        </button>

        <p className="text-xs text-muted-foreground text-center mt-2">
          O valor do frete inclui seguro e será pago via Pix na próxima etapa.
        </p>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t px-4 py-4">
        <div className="max-w-lg mx-auto">
          <Button
            size="lg"
            className="w-full text-base"
            disabled={!selected}
            onClick={handleContinue}
          >
            Continuar para pagamento
          </Button>
        </div>
      </div>
    </div>
  );
}
