import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getShippingDraft, updateShippingDraft, getQuoteDraft } from "@/lib/storage";
import { formatBRL } from "@/lib/money";
import { AlertCircle, Package, Zap, Truck, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FreightTermsModal } from "@/components/FreightTermsModal";
import { toast } from "sonner";

interface ShippingOption {
  serviceId: string;
  serviceName: string;
  companyName: string;
  companyLogo?: string | null;
  priceCents: number;
  deliveryMinDays: number;
  deliveryMaxDays: number;
  currency: string;
  unavailable?: boolean;
  unavailableReason?: string | null;
}

function maskCEP(v: string) {
  return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

export default function ShippingRates() {
  const navigate = useNavigate();
  const quote = getQuoteDraft();
  const draft = getShippingDraft();

  const [cep, setCep] = useState(draft.cep || "");
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [paying, setPaying] = useState(false);

  const deviceValue = draft.devices?.[0]?.valueCents || 0;

  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8 && quote) {
      fetchQuotes(cleanCep);
    }
  }, []);

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


  const fetchQuotes = async (postalCode?: string) => {
    const cleanCep = (postalCode || cep).replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    setLoading(true);
    setError(null);
    setOptions([]);
    setSelected(null);
    setFetched(false);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("melhorenvio-quote", {
        body: {
          from: { postal_code: cleanCep },
          insurance_value: deviceValue > 0 ? deviceValue / 100 : 1500,
        },
      });

      if (fnError) {
        const ctx = (fnError as any)?.context;
        if (ctx && typeof ctx.json === "function") {
          try {
            const errBody = await ctx.json();
            throw new Error(errBody?.error || "Erro ao conectar ao frete.");
          } catch (parseErr: any) {
            if (parseErr.message && parseErr.message !== "Erro ao conectar ao frete.") throw parseErr;
          }
        }
        throw new Error("Erro ao conectar ao frete. Tente novamente.");
      }

      if (data?.error) {
        const detail = data.details ? `: ${typeof data.details === 'string' ? data.details : JSON.stringify(data.details)}` : '';
        throw new Error(`${data.error}${detail}`);
      }

      const opts: ShippingOption[] = data?.options || [];
      if (opts.filter((o) => !o.unavailable).length > 0) {
        setOptions(opts);
      } else {
        setError("Nenhuma opção de frete disponível para este CEP.");
      }
    } catch (err: any) {
      console.error("Erro ao cotar frete:", err);
      const msg = err.message || "";
      if (msg.includes("CEP inválido")) {
        setError("Digite um CEP válido (8 dígitos).");
      } else if (msg.includes("não conectado")) {
        setError("Frete não configurado. Peça ao admin para conectar o Melhor Envio.");
      } else {
        setError(msg || "Não foi possível calcular o frete agora.");
      }
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  const getIcon = (name: string) => {
    const upper = name.toUpperCase();
    if (upper.includes("SEDEX")) return <Zap className="w-5 h-5 text-muted-foreground" />;
    if (upper.includes("PAC")) return <Package className="w-5 h-5 text-muted-foreground" />;
    return <Truck className="w-5 h-5 text-muted-foreground" />;
  };

  const handleContinue = () => {
    if (!selected) return;
    const opt = options.find((o) => o.serviceId === selected);
    if (!opt) return;

    updateShippingDraft({
      selectedShipping: opt.serviceName.toUpperCase().includes("SEDEX") ? "SEDEX" : "PAC",
      shippingPriceCents: opt.priceCents,
      shippingOptionId: opt.serviceId,
      shippingOptionName: opt.serviceName,
    });
    localStorage.setItem("shippingOption", JSON.stringify(opt));

    // Show terms modal instead of navigating to Pix
    setShowTerms(true);
  };

  const handleAcceptTermsAndPay = async () => {
    setShowTerms(false);
    setPaying(true);

    try {
      const opt = options.find((o) => o.serviceId === selected);
      if (!opt) throw new Error("Opção de frete não encontrada");

      const device = draft.devices?.[0];

      // 1. Create order
      const { data: orderData, error: orderErr } = await supabase.functions.invoke("order-create", {
        body: {
          cpf: draft.cpf || "",
          customer_name: draft.fullName || "",
          customer_phone: draft.phone || "",
          customer_email: draft.email || "",
          customer_cep: draft.cep?.replace(/\D/g, "") || "",
          customer_street: draft.street || "",
          customer_number: draft.number || "",
          customer_complement: draft.complement || "",
          customer_district: draft.district || "",
          customer_city: draft.city || "",
          customer_uf: draft.uf || "",
          brand: quote.brandName,
          model: quote.modelName,
          issue_description: device?.problem || "",
          services: quote.services,
          shipping_option: {
            serviceId: opt.serviceId,
            serviceName: opt.serviceName,
            companyName: opt.companyName,
            deliveryMinDays: opt.deliveryMinDays,
            deliveryMaxDays: opt.deliveryMaxDays,
            price: (opt.priceCents / 100).toFixed(2),
          },
          repair_estimate_total: quote.totalCents / 100,
        },
      });

      if (orderErr || !orderData?.order_id) {
        throw new Error(orderData?.error || "Erro ao criar pedido");
      }

      const orderId = orderData.order_id;

      // 2. Create PayPal order
      const { data: ppData, error: ppErr } = await supabase.functions.invoke("paypal-create-order", {
        body: { order_id: orderId },
      });

      if (ppErr || !ppData?.approval_url) {
        throw new Error(ppData?.error || "Erro ao criar pagamento PayPal");
      }

      // 3. Redirect to PayPal
      window.location.href = ppData.approval_url;
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Erro ao processar pagamento");
      setPaying(false);
    }
  };

  const cepValid = cep.replace(/\D/g, "").length === 8;

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHeader title="Escolha o frete" backTo="/envio/confirmacao" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
        <div className="text-center space-y-1 mb-2">
          <h2 className="text-xl font-bold">Escolha a opção de envio</h2>
          <p className="text-sm text-muted-foreground">
            Nesta etapa você paga apenas o frete de envio do aparelho.
          </p>
        </div>

        {/* CEP input */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <Label htmlFor="cep-frete">CEP de origem</Label>
          <div className="flex gap-3">
            <Input
              id="cep-frete"
              value={cep}
              onChange={(e) => setCep(maskCEP(e.target.value))}
              placeholder="00000-000"
              className="flex-1"
            />
            <Button
              onClick={() => fetchQuotes()}
              disabled={!cepValid || loading}
              className="gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? "Calculando..." : "Calcular"}
            </Button>
          </div>
          {draft.city && draft.uf && (
            <p className="text-xs text-muted-foreground">
              Envio de: {draft.city}, {draft.uf}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-3 text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm text-destructive font-medium">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchQuotes()} className="w-full">
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Options */}
        {!loading && !error && options.length > 0 && (
          <div className="space-y-3">
            {options.map((opt) => (
              <button
                key={opt.serviceId}
                onClick={() => !opt.unavailable && setSelected(opt.serviceId)}
                disabled={opt.unavailable}
                className={`w-full rounded-xl border p-4 text-left transition-all space-y-1.5 ${
                  opt.unavailable
                    ? "border-border bg-card/50 opacity-50 cursor-not-allowed"
                    : selected === opt.serviceId
                      ? "border-whatsapp bg-whatsapp/5 active:scale-[0.98]"
                      : "border-border bg-card hover:border-foreground/20 active:scale-[0.98]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getIcon(opt.serviceName)}
                    <div>
                      <span className="font-semibold text-sm">{opt.serviceName}</span>
                      <span className="text-xs text-muted-foreground ml-2">({opt.companyName})</span>
                    </div>
                  </div>
                  {opt.unavailable ? (
                    <span className="text-xs text-destructive font-medium">Indisponível</span>
                  ) : (
                    <span className="text-base font-bold">{formatBRL(opt.priceCents)}</span>
                  )}
                </div>
                {opt.unavailable ? (
                  <p className="text-xs text-destructive/70 pl-8">{opt.unavailableReason}</p>
                ) : (
                  <p className="text-xs text-muted-foreground pl-8">
                    {opt.deliveryMinDays === opt.deliveryMaxDays
                      ? `${opt.deliveryMinDays} dias úteis`
                      : `${opt.deliveryMinDays}–${opt.deliveryMaxDays} dias úteis`}
                    {deviceValue > 0 && ` • Seguro até ${formatBRL(deviceValue)}`}
                  </p>
                )}
              </button>
            ))}

            <p className="text-xs text-muted-foreground text-center pt-1">
              Valores e prazos podem variar após validação da transportadora.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !fetched && options.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Informe seu CEP e clique em "Calcular" para ver as opções de frete.
            </p>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t px-4 py-4">
        <div className="max-w-lg mx-auto">
          <Button
            size="lg"
            className="w-full text-base gap-2"
            disabled={!selected || loading || paying}
            onClick={handleContinue}
          >
            {paying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando…
              </>
            ) : (
              "Continuar para pagamento"
            )}
          </Button>
        </div>
      </div>

      <FreightTermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={handleAcceptTermsAndPay}
      />
    </div>
  );
}
