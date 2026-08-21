import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/money";
import {
  Loader2,
  AlertCircle,
  QrCode,
  CreditCard,
  Copy,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

import appleLogo from "@/assets/brands/apple.svg";
import samsungLogo from "@/assets/brands/samsung.svg";
import xiaomiLogo from "@/assets/brands/xiaomi.svg";
import motorolaLogo from "@/assets/brands/motorola.png";
import lgLogo from "@/assets/brands/lg.svg";
import infinixLogo from "@/assets/brands/infinix.png";
import jadlogLogo from "@/assets/brands/jadlog.png";
import correiosLogo from "@/assets/brands/correios.png";

const BRAND_LOGO: Record<string, string> = {
  apple: appleLogo,
  samsung: samsungLogo,
  xiaomi: xiaomiLogo,
  motorola: motorolaLogo,
  lg: lgLogo,
  infinix: infinixLogo,
};

function getBrandLogo(brandName: string): string | undefined {
  return BRAND_LOGO[brandName.toLowerCase()];
}

function getCarrierLogo(companyName: string): string | undefined {
  const name = companyName.toLowerCase();
  if (name.includes("jadlog")) return jadlogLogo;
  if (name.includes("correios")) return correiosLogo;
  return undefined;
}

const ASAAS_ENVIRONMENT = "production";

async function readFnError(error: any, fallback: string): Promise<string> {
  try {
    const body = await error?.context?.json?.();
    if (body?.message) return body.message;
  } catch {
    // resposta sem corpo JSON
  }
  return fallback;
}


interface OrderData {
  id: string;
  brand: string;
  model: string;
  shipping_amount: number;
  shipping_option: any;
  services: any;
  freight_payment_status: string;
  customer_name: string;
  customer_phone: string;
  cpf: string;
  customer_email: string | null;
  issue_description: string | null;
  tracking_token: string | null;
}

export default function FreightPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");
  const trackingToken = searchParams.get("tracking_token");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pix" | "card">("pix");
  const [cardType, setCardType] = useState<"credit" | "debit">("credit");

  // Pix state
  const [pixLoading, setPixLoading] = useState(false);
  const [pixQrBase64, setPixQrBase64] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [pixPaymentId, setPixPaymentId] = useState<string | null>(null);
  const [pixInvoiceUrl, setPixInvoiceUrl] = useState("");

  const [pixPolling, setPixPolling] = useState(false);

  // Card state
  const [cardLoading, setCardLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardCpf, setCardCpf] = useState("");
  const [installments, setInstallments] = useState("1");

  // MercadoPago references removed as we are switching to Asaas via backend


  // Fetch order
  useEffect(() => {
    if (!orderId || !trackingToken) {
      if (!orderId) setLoading(false);
      return;
    }
    
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("public-order-status", {
          body: { order_id: orderId, tracking_token: trackingToken }
        });

        if (error || !data) {
          console.error("Error fetching order:", error);
          toast.error("Pedido não encontrado");
          setLoading(false);
          return;
        }

        if (data.freight_payment_status === "approved" || data.freight_payment_status === "paid") {
          navigate(`/frete-pago?order_id=${orderId}&tracking_token=${trackingToken}`, { replace: true });
          return;
        }

        setOrder(data as unknown as OrderData);
        setCardCpf(data.cpf?.replace(/\D/g, "") || "");
        setCardHolder(data.customer_name || "");
      } catch (err) {
        console.error("Public order status call failed:", err);
        toast.error("Erro ao carregar pedido");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, trackingToken, navigate]);

  // Reutilizar cobrança Pix pendente ao recarregar a página
  const pixRestored = useRef(false);
  useEffect(() => {
    const anyOrder = order as any;
    if (!order || pixRestored.current) return;
    if (anyOrder.payment_provider === "asaas" && anyOrder.payment_id && anyOrder.payment_billing_type === "PIX") {
      pixRestored.current = true;
      handlePixPayment();
    }
  }, [order]);

  // Poll for Pix payment

  useEffect(() => {
    if (!pixPolling || !orderId) return;
    let attempts = 0;
    const maxAttempts = 90; // 90 * 3s = ~4.5 min

    const interval = setInterval(async () => {
      attempts++;
      const { data, error } = await supabase.functions.invoke("public-order-status", {
        body: { order_id: orderId, tracking_token: trackingToken }
      });

      if (data?.freight_payment_status === "approved" || data?.freight_payment_status === "paid") {
        clearInterval(interval);
        setPixPolling(false);
        toast.success("Pagamento confirmado!");
        navigate(`/frete-pago?order_id=${orderId}&tracking_token=${trackingToken}`);
      }

      if (data?.freight_payment_status === "rejected") {
        clearInterval(interval);
        setPixPolling(false);
        toast.error("Pagamento rejeitado");
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setPixPolling(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pixPolling, orderId, trackingToken, navigate]);

  const handlePixPayment = async () => {
    if (!orderId || pixLoading) return;
    setPixLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("asaas-create-pix", {
        body: {
          order_id: orderId,
          tracking_token: trackingToken,
        },
      });

      if (error) throw new Error(await readFnError(error, "Erro ao gerar Pix"));
      if (data?.success === false) throw new Error(data.message || "Erro ao gerar Pix");

      setPixQrBase64(data.encodedImage || "");
      setPixCode(data.payload || "");
      setPixInvoiceUrl(data.invoiceUrl || "");
      setPixPaymentId(data.paymentId || null);
      setPixPolling(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar Pix");
    }
    setPixLoading(false);
  };


  const handleCardPayment = async () => {
    if (!orderId || !order || cardLoading) return;

    setCardLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("asaas-pay-credit-card", {
        body: {
          order_id: orderId,
          tracking_token: trackingToken,
          installments: parseInt(installments),
          card_data: {
            holderName: cardHolder,
            number: cardNumber,
            expiryMonth: cardExpMonth,
            expiryYear: cardExpYear.length === 2 ? `20${cardExpYear}` : cardExpYear,
            ccv: cardCvv,
            holderCpf: cardCpf,
          },
        },
      });

      if (error) throw new Error(await readFnError(error, "Erro ao processar pagamento"));
      if (data?.success === false) throw new Error(data.message || "Erro ao processar pagamento");


      if (data.status === "approved") {
        toast.success("Pagamento aprovado!");
        navigate(`/frete-pago?order_id=${orderId}&tracking_token=${trackingToken}`);
      } else if (data.status === "rejected") {
        toast.error("Pagamento não autorizado. Revise os dados ou tente outro cartão.");
      } else {
        toast.info("Pagamento em análise. Aguarde a confirmação.");
        navigate(`/frete-pago?order_id=${orderId}&tracking_token=${trackingToken}`);
      }
    } catch (err: any) {
      console.error("Card payment error:", err);
      toast.error(err.message || "Erro ao processar pagamento");
    }
    setCardLoading(false);
  };

  const handleDebitPayment = async () => {
    if (!orderId || cardLoading) return;
    setCardLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("asaas-create-pix", {
        body: {
          order_id: orderId,
          tracking_token: trackingToken,
          billing_type: "DEBIT_CARD",
        },
      });

      if (error) throw new Error(await readFnError(error, "Erro ao criar pagamento"));
      if (data?.success === false) throw new Error(data.message || "Erro ao criar pagamento");


      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
      } else {
        throw new Error("URL de checkout não retornada");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao iniciar pagamento no débito");
    }
    setCardLoading(false);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    toast.success("Código Pix copiado!");
  };

  const formatCardNumber = (v: string) => {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Pagamento" backTo="/envio/frete" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">ID do pedido não informado.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Pagamento" backTo="/envio/frete" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Carregando pedido…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Pagamento" backTo="/envio/frete" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">Pedido não encontrado.</p>
        </div>
      </div>
    );
  }

  const shippingOpt = order.shipping_option || {};
  const serviceName = shippingOpt.serviceName || shippingOpt.service_name || "";
  const companyName = shippingOpt.companyName || shippingOpt.company_name || "";
  const amountCents = Math.round(order.shipping_amount * 100);

  return (
    <div className="min-h-screen bg-background pb-8">
      <PageHeader title="Pagamento do Frete" backTo="/envio/frete" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-5">
        {/* Summary */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">Resumo do Pedido</h3>
          <div className="flex items-center gap-3">
            {getBrandLogo(order.brand) ? (
              <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center flex-shrink-0">
                <img src={getBrandLogo(order.brand)} alt={order.brand} className="w-full h-full object-contain" />
              </div>
            ) : null}
            <p className="text-sm">{order.brand} {order.model}</p>
          </div>
          <div className="flex items-center gap-3">
            {getCarrierLogo(companyName) ? (
              <div className="w-10 h-10 bg-white rounded-lg p-1.5 flex items-center justify-center flex-shrink-0">
                <img src={getCarrierLogo(companyName)!} alt={companyName} className="w-full h-full object-contain" />
              </div>
            ) : null}
            <p className="text-sm text-muted-foreground">
              {serviceName}{companyName ? ` (${companyName})` : ""}
            </p>
          </div>
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="text-sm font-semibold">Valor do frete:</span>
            <span className="text-xl font-bold">{formatBRL(order.shipping_amount * 100)}</span>
          </div>
          <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
            ⚠️ Você está pagando apenas o frete de envio. O valor do conserto será combinado após análise técnica.
          </p>
        </div>

        {/* Payment method tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab("pix")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all ${
              tab === "pix"
                ? "border-[hsl(var(--whatsapp))] bg-[hsl(var(--whatsapp))]/10 text-[hsl(var(--whatsapp))]"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20"
            }`}
          >
            <QrCode className="w-5 h-5" />
            Pix
          </button>
          <button
            onClick={() => setTab("card")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all ${
              tab === "card"
                ? "border-[hsl(var(--whatsapp))] bg-[hsl(var(--whatsapp))]/10 text-[hsl(var(--whatsapp))]"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            Cartão
          </button>
        </div>

        {/* PIX */}
        {tab === "pix" && (
          <div className="space-y-4">
            {!pixCode ? (
              <div className="rounded-xl border bg-card p-5 text-center space-y-4">
                <QrCode className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Clique para gerar o QR Code Pix. O pagamento pode ser feito com qualquer banco.
                </p>
                <Button
                  size="lg"
                  className="w-full text-base gap-2"
                  onClick={handlePixPayment}
                  disabled={pixLoading}
                >
                  {pixLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando Pix…
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5" />
                      Pagar {formatBRL(order.shipping_amount * 100)} no Pix
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl">
                    <img
                      src={`data:image/png;base64,${pixQrBase64}`}
                      alt="QR Code Pix"
                      className="w-[200px] h-[200px]"
                    />
                  </div>
                </div>

                {/* Copy code */}
                <div className="rounded-xl border bg-card p-4 space-y-3">
                  <p className="text-sm font-semibold">Pix copia e cola</p>
                  <div className="bg-secondary rounded-lg p-3 max-h-32 overflow-y-auto">
                    <p className="text-xs text-muted-foreground break-all font-mono">
                      {pixCode}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleCopyPix}>
                    <Copy className="w-4 h-4" />
                    Copiar código Pix
                  </Button>
                  {pixInvoiceUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => window.open(pixInvoiceUrl, "_blank", "noopener")}
                    >
                      Abrir link de pagamento
                    </Button>
                  )}
                </div>


                {/* Polling status */}
                {pixPolling && (
                  <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Aguardando pagamento…</span>
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  ⏱ O QR Code expira em 30 minutos. A confirmação é automática.
                </p>
              </div>
            )}
          </div>
        )}

        {/* CARD */}
        {tab === "card" && (
          <div className="space-y-4">
             {/* Card selection (Credit/Debit) */}
            <div className="flex gap-4 p-1 bg-secondary rounded-lg">
              <button
                onClick={() => setCardType("credit")}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                  cardType === "credit" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                CRÉDITO
              </button>
              <button
                onClick={() => setCardType("debit")}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                  cardType === "debit" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                DÉBITO
              </button>
            </div>

            {cardType === "credit" ? (
              <div className="rounded-xl border bg-card p-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Número do cartão</Label>
                  <Input
                    id="card-number"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="card-exp-month">Mês</Label>
                    <Input
                      id="card-exp-month"
                      placeholder="MM"
                      value={cardExpMonth}
                      onChange={(e) => setCardExpMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-exp-year">Ano</Label>
                    <Input
                      id="card-exp-year"
                      placeholder="AA"
                      value={cardExpYear}
                      onChange={(e) => setCardExpYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-cvv">CVV</Label>
                    <Input
                      id="card-cvv"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4}
                      type="password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-holder">Nome no cartão</Label>
                  <Input
                    id="card-holder"
                    placeholder="NOME COMO NO CARTÃO"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-cpf">CPF do titular</Label>
                  <Input
                    id="card-cpf"
                    placeholder="000.000.000-00"
                    value={cardCpf}
                    onChange={(e) => setCardCpf(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installments">Parcelas</Label>
                  <select
                    id="installments"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => {
                      const val = order.shipping_amount / i;
                      if (i > 1 && val < 5) return null; // Minimum installment check
                      return (
                        <option key={i} value={i}>
                          {i}x de {formatBRL(val * 100)} sem juros
                        </option>
                      );
                    })}
                  </select>
                </div>

                <Button
                  size="lg"
                  className="w-full text-base gap-2"
                  onClick={handleCardPayment}
                  disabled={cardLoading}
                >
                  {cardLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processando…
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pagar {formatBRL(order.shipping_amount * 100)}
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border bg-card p-5 text-center space-y-4">
                <CreditCard className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground px-4">
                  Pagamento em cartão de débito será concluído no ambiente seguro do Asaas.
                </p>
                <Button
                  size="lg"
                  className="w-full text-base gap-2"
                  onClick={handleDebitPayment}
                  disabled={cardLoading}
                >
                  {cardLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Continuar com cartão de débito"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
