import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getShippingDraft, updateShippingDraft, getQuoteDraft } from "@/lib/storage";
import { formatBRL } from "@/lib/money";
import { AlertCircle, Package, Zap, Truck, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FreightTermsModal } from "@/components/FreightTermsModal";
import { toast } from "sonner";
import jadlogLogo from "@/assets/brands/jadlog.png";

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

const inputStyle = "w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#111111] px-[14px] py-[12px] text-[14px] font-medium text-[rgba(255,255,255,0.85)] font-['Inter'] placeholder:text-[rgba(255,255,255,0.25)] focus:outline-none focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,107,0,0.04)] transition-colors";

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

  const getLogoInfo = (serviceName: string, companyName: string) => {
    const upper = (companyName + " " + serviceName).toUpperCase();
    if (upper.includes("JADLOG")) return { url: jadlogLogo, fallback: 'JD' };
    if (upper.includes("CORREIO") || upper.includes("PAC") || upper.includes("SEDEX") || upper.includes("MINI ENVIO"))
      return { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Correios_logo.svg/320px-Correios_logo.svg.png', fallback: 'EC' };
    return { url: '', fallback: 'FR' };
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
    setShowTerms(true);
  };

  const handleAcceptTermsAndPay = async () => {
    setShowTerms(false);
    setPaying(true);

    try {
      const opt = options.find((o) => o.serviceId === selected);
      if (!opt) throw new Error("Opção de frete não encontrada");

      const device = draft.devices?.[0];

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

      navigate(`/envio/pagamento?order_id=${orderData.order_id}`);
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Erro ao processar pagamento");
      setPaying(false);
    }
  };

  const cepValid = cep.replace(/\D/g, "").length === 8;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0d0d0d' }}>
      {/* Glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-60px', right: '-60px', width: '240px', height: '240px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)',
        }}
      />

      <PageHeader title="Escolha o frete" backTo="/envio/confirmacao" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-5 relative z-10" style={{ paddingBottom: '100px' }}>
        {/* Título */}
        <div className="text-center space-y-2 mb-2">
          <h2 className="font-['Montserrat'] font-extrabold text-[20px] text-white">
            Escolha a opção de envio
          </h2>
          <p className="font-['Inter'] text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Nesta etapa você paga apenas o frete de envio do aparelho.
          </p>
        </div>

        {/* CEP */}
        <div
          className="space-y-3"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '0.5px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            padding: '18px 16px',
          }}
        >
          <div className="flex items-center gap-2">
            <div style={{ width: '3px', height: '14px', background: '#FF6B00', borderRadius: '99px' }} />
            <span className="font-['Montserrat'] font-extrabold text-[12px] uppercase tracking-[2px]" style={{ color: '#FF6B00' }}>
              CEP de Origem
            </span>
          </div>
          <div className="flex gap-[10px]">
            <input
              value={cep}
              onChange={(e) => setCep(maskCEP(e.target.value))}
              placeholder="00000-000"
              className={`${inputStyle} flex-1`}
            />
            <button
              onClick={() => fetchQuotes()}
              disabled={!cepValid || loading}
              className="font-['Montserrat'] font-extrabold text-[13px] uppercase text-white shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{
                background: '#FF6B00',
                borderRadius: '10px',
                padding: '12px 20px',
                border: 'none',
              }}
            >
              {loading ? "Calculando..." : "Calcular"}
            </button>
          </div>
          {draft.city && draft.uf && (
            <p className="font-['Inter'] text-[12px]" style={{ color: 'rgba(255,255,255,0.35)', marginTop: '8px' }}>
              Envio de: {draft.city}, {draft.uf}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-[14px]" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <Skeleton className="h-20 w-full rounded-[14px]" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <Skeleton className="h-20 w-full rounded-[14px]" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            className="space-y-3 text-center"
            style={{
              borderRadius: '14px',
              border: '1px solid rgba(255,107,0,0.25)',
              background: 'rgba(255,107,0,0.06)',
              padding: '20px 16px',
            }}
          >
            <AlertCircle className="w-8 h-8 mx-auto" style={{ color: '#FF6B00' }} />
            <p className="font-['Inter'] font-medium text-[13px]" style={{ color: '#FF6B00' }}>{error}</p>
            <button
              onClick={() => fetchQuotes()}
              className="font-['Inter'] font-semibold text-[12px] mx-auto block"
              style={{
                background: 'rgba(255,107,0,0.15)',
                border: '1px solid rgba(255,107,0,0.35)',
                borderRadius: '10px',
                padding: '8px 20px',
                color: '#FF6B00',
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Options */}
        {!loading && !error && options.length > 0 && (
          <div className="space-y-3">
            {options.map((opt) => {
              const isSelected = selected === opt.serviceId;
              return (
                <button
                  key={opt.serviceId}
                  onClick={() => !opt.unavailable && setSelected(opt.serviceId)}
                  disabled={opt.unavailable}
                  className="w-full text-left relative overflow-hidden transition-all"
                  style={{
                    background: opt.unavailable
                      ? '#1a1a1a'
                      : isSelected
                        ? 'rgba(255,107,0,0.06)'
                        : '#1a1a1a',
                    border: isSelected
                      ? '1px solid rgba(255,107,0,0.5)'
                      : '0.5px solid rgba(255,255,255,0.07)',
                    borderRadius: '14px',
                    padding: '16px',
                    opacity: opt.unavailable ? 0.4 : 1,
                    cursor: opt.unavailable ? 'not-allowed' : 'pointer',
                  }}
                >
                  {/* Top bar when selected */}
                  {isSelected && (
                    <div
                      className="absolute top-0 left-0 right-0"
                      style={{ height: '2px', background: '#FF6B00' }}
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      {(() => {
                        const logo = getLogoInfo(opt.serviceName, opt.companyName);
                        return (
                          <div
                            className="flex items-center justify-center shrink-0"
                            style={{
                              width: '56px', height: '36px',
                              background: 'rgba(255,255,255,0.06)',
                              borderRadius: '8px',
                              padding: '4px',
                            }}
                          >
                            {logo.url ? (
                              <>
                                <img
                                  src={logo.url}
                                  alt={opt.companyName}
                                  style={{ width: '52px', height: '20px', objectFit: 'contain' }}
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                    const next = (e.currentTarget as HTMLImageElement).nextElementSibling as HTMLElement;
                                    if (next) next.style.display = 'flex';
                                  }}
                                />
                                <span
                                  className="font-['Montserrat'] font-extrabold text-[11px] items-center justify-center"
                                  style={{ display: 'none', color: '#FF6B00' }}
                                >
                                  {logo.fallback}
                                </span>
                              </>
                            ) : (
                              <span className="font-['Montserrat'] font-extrabold text-[11px]" style={{ color: '#FF6B00' }}>
                                {logo.fallback}
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-['Montserrat'] font-bold text-[15px] text-white">
                            {opt.serviceName}
                          </span>
                          <span className="font-['Inter'] text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            ({opt.companyName})
                          </span>
                        </div>

                        {opt.unavailable ? (
                          <div className="mt-1">
                            <span className="font-['Inter'] font-semibold text-[12px]" style={{ color: 'rgba(255,107,0,0.6)' }}>
                              Indisponível
                            </span>
                            {opt.unavailableReason && (
                              <p className="font-['Inter'] text-[11px]" style={{ color: 'rgba(255,107,0,0.5)' }}>
                                {opt.unavailableReason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="font-['Inter'] text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {opt.deliveryMinDays === opt.deliveryMaxDays
                              ? `${opt.deliveryMinDays} dias úteis`
                              : `${opt.deliveryMinDays}–${opt.deliveryMaxDays} dias úteis`}
                            {deviceValue > 0 && ` • Seguro até ${formatBRL(deviceValue)}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!opt.unavailable && (
                        <span
                          className="font-['Montserrat'] font-extrabold text-[18px]"
                          style={{ color: isSelected ? '#FF6B00' : 'white' }}
                        >
                          {formatBRL(opt.priceCents)}
                        </span>
                      )}
                      {/* Radio */}
                      {!opt.unavailable && (
                        <div
                          className="flex items-center justify-center shrink-0"
                          style={{
                            width: '18px', height: '18px', borderRadius: '50%',
                            background: isSelected ? '#FF6B00' : 'transparent',
                            border: isSelected ? '1.5px solid #FF6B00' : '1.5px solid rgba(255,255,255,0.2)',
                          }}
                        >
                          {isSelected && (
                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'white' }} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            <p className="font-['Inter'] text-[11px] text-center pt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Valores e prazos podem variar após validação da transportadora.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !fetched && options.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
            <p className="font-['Inter'] text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Informe seu CEP e clique em "Calcular" para ver as opções de frete.
            </p>
          </div>
        )}
      </main>

      {/* Botão Continuar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          padding: '16px 16px 32px',
          background: 'linear-gradient(to top, #0d0d0d 60%, transparent)',
        }}
      >
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
