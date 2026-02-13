import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getShippingDraft, updateShippingDraft, getQuoteDraft } from "@/lib/storage";
import { formatBRL } from "@/lib/money";
import { AlertCircle, Package, Zap, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ShippingOption {
  id: string;
  name: string;
  company: string;
  priceCents: number;
  deliveryMin: number;
  deliveryMax: number;
}

export default function ShippingRates() {
  const navigate = useNavigate();
  const quote = getQuoteDraft();
  const draft = getShippingDraft();
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deviceValue = draft.devices?.[0]?.valueCents || 0;
  const clientCep = draft.cep || "";

  useEffect(() => {
    if (quote && draft.shippingMethod !== "self_label") {
      fetchQuotes();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("melhorenvio-quote", {
        body: {
          from: { postal_code: clientCep },
          insurance_value: deviceValue / 100,
          package: { weight: 0.4, width: 16, height: 8, length: 4 },
        },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      if (Array.isArray(data) && data.length > 0) {
        setOptions(data);
      } else {
        setError("Nenhuma opção de frete disponível para este CEP.");
      }
    } catch (err: any) {
      console.error("Erro ao cotar frete:", err);
      setError(err.message || "Erro ao cotar frete.");
    } finally {
      setLoading(false);
    }
  };

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

  if (draft.shippingMethod === "self_label") {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Envio" backTo="/envio/confirmacao" />
        <main className="px-4 py-10 max-w-lg mx-auto text-center space-y-4">
          <Package className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-bold">Você vai gerar sua etiqueta</h2>
          <p className="text-sm text-muted-foreground">
            Como você escolheu gerar sua própria etiqueta, não há pagamento de frete aqui.
          </p>
        </main>
      </div>
    );
  }

  const getIcon = (name: string) => {
    if (name.toUpperCase().includes("SEDEX")) return <Zap className="w-5 h-5 text-muted-foreground" />;
    if (name.toUpperCase().includes("PAC")) return <Package className="w-5 h-5 text-muted-foreground" />;
    return <Truck className="w-5 h-5 text-muted-foreground" />;
  };

  const handleContinue = () => {
    if (!selected) return;
    const opt = options.find((o) => o.id === selected);
    if (!opt) return;
    updateShippingDraft({
      selectedShipping: opt.name.toUpperCase().includes("SEDEX") ? "SEDEX" : "PAC",
      shippingPriceCents: opt.priceCents,
      shippingOptionId: opt.id,
      shippingOptionName: opt.name,
    });
    navigate("/envio/pagamento-pix");
  };

  const goSelfLabel = () => {
    updateShippingDraft({ shippingMethod: "self_label" });
    navigate("/envio/etiqueta-propria/dados");
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHeader title="Escolha o frete" backTo="/envio/confirmacao" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
        <div className="text-center space-y-1 mb-4">
          <h2 className="text-xl font-bold">Escolha o tipo de envio</h2>
          <p className="text-sm text-muted-foreground">Selecione a opção de frete</p>
          {draft.city && draft.uf && (
            <p className="text-xs text-muted-foreground">Envio de: {draft.city}, {draft.uf}</p>
          )}
        </div>

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-3 text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm text-destructive font-medium">{error}</p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={fetchQuotes} className="flex-1">Tentar novamente</Button>
              <Button variant="outline" size="sm" onClick={goSelfLabel} className="flex-1">Gerar minha etiqueta</Button>
            </div>
          </div>
        )}

        {!loading && !error && options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={`w-full rounded-xl border p-5 text-left transition-all active:scale-[0.98] space-y-2 ${
              selected === opt.id ? "border-whatsapp bg-whatsapp/5" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getIcon(opt.name)}
                <span className="font-semibold">{opt.name}</span>
              </div>
              <span className="text-lg font-bold">{formatBRL(opt.priceCents)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {opt.deliveryMin}–{opt.deliveryMax} dias úteis • {opt.company}
              {deviceValue > 0 && ` • Seguro até ${formatBRL(deviceValue)}`}
            </p>
          </button>
        ))}

        {!loading && !error && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            O valor do frete inclui seguro e será pago via Pix na próxima etapa.
          </p>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t px-4 py-4">
        <div className="max-w-lg mx-auto">
          <Button
            size="lg"
            className="w-full text-base"
            disabled={!selected || loading}
            onClick={handleContinue}
          >
            Continuar para pagamento
          </Button>
        </div>
      </div>
    </div>
  );
}
