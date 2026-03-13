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

const MP_PUBLIC_KEY = "APP_USR-e2e243db-9d24-4a51-9dff-4d71a199fa98";

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
}

export default function FreightPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pix" | "card">("pix");

  // Pix state
  const [pixLoading, setPixLoading] = useState(false);
  const [pixQrBase64, setPixQrBase64] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [pixPaymentId, setPixPaymentId] = useState<string | null>(null);
  const [pixPolling, setPixPolling] = useState(false);

  // Card state
  const [cardLoading, setCardLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardCpf, setCardCpf] = useState("");

  const mpRef = useRef<any>(null);
  const sdkLoaded = useRef(false);

  // Load MercadoPago SDK
  useEffect(() => {
    if (sdkLoaded.current) return;
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.onload = () => {
      sdkLoaded.current = true;
      mpRef.current = new (window as any).MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
    };
    document.body.appendChild(script);
    return () => {
      // Don't remove script on unmount since SDK is global
    };
  }, []);

  // Fetch order
  useEffect(() => {
    if (!orderId) return;
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error || !data) {
        toast.error("Pedido não encontrado");
        setLoading(false);
        return;
      }

      if (data.freight_payment_status === "approved") {
        navigate(`/frete-pago?order_id=${orderId}`, { replace: true });
        return;
      }

      setOrder(data as unknown as OrderData);
      setCardCpf(data.cpf?.replace(/\D/g, "") || "");
      setCardHolder(data.customer_name || "");
      setLoading(false);
    })();
  }, [orderId]);

  // Poll for Pix payment
  useEffect(() => {
    if (!pixPolling || !orderId) return;
    let attempts = 0;
    const maxAttempts = 90; // 90 * 3s = ~4.5 min

    const interval = setInterval(async () => {
      attempts++;
      const { data } = await supabase
        .from("orders")
        .select("freight_payment_status")
        .eq("id", orderId)
        .single();

      if (data?.freight_payment_status === "approved") {
        clearInterval(interval);
        setPixPolling(false);
        toast.success("Pagamento confirmado!");
        navigate(`/frete-pago?order_id=${orderId}`);
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
  }, [pixPolling, orderId]);

  const handlePixPayment = async () => {
    if (!orderId) return;
    setPixLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("mercadopago-create-payment", {
        body: {
          order_id: orderId,
          payment_type: "pix",
          payer_email: order?.customer_email || undefined,
        },
      });

      if (error) throw new Error("Erro ao criar pagamento");
      if (data?.error) throw new Error(data.error);

      setPixQrBase64(data.qr_code_base64 || "");
      setPixCode(data.qr_code || "");
      setPixPaymentId(data.payment_id);
      setPixPolling(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar Pix");
    }
    setPixLoading(false);
  };

  const handleCardPayment = async () => {
    if (!orderId || !order) return;
    if (!mpRef.current) {
      toast.error("SDK do Mercado Pago não carregou. Recarregue a página.");
      return;
    }

    setCardLoading(true);

    try {
      // Create card token
      const tokenData = await mpRef.current.createCardToken({
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardholderName: cardHolder,
        cardExpirationMonth: cardExpMonth,
        cardExpirationYear: cardExpYear.length === 2 ? `20${cardExpYear}` : cardExpYear,
        securityCode: cardCvv,
        identificationType: "CPF",
        identificationNumber: cardCpf.replace(/\D/g, ""),
      });

      if (!tokenData?.id) {
        throw new Error("Erro ao tokenizar cartão. Verifique os dados.");
      }

      // Get payment method info
      const bin = cardNumber.replace(/\s/g, "").slice(0, 6);
      let paymentMethodId = "visa";
      let issuerId = "";

      try {
        const pmRes = await fetch(
          `https://api.mercadopago.com/v1/payment_methods/search?public_key=${MP_PUBLIC_KEY}&bin=${bin}&marketplace=NONE`
        );
        const pmData = await pmRes.json();
        if (pmData.results?.[0]) {
          paymentMethodId = pmData.results[0].id;
          issuerId = pmData.results[0].issuer?.id || "";
        }
      } catch {
        // fallback to defaults
      }

      const { data, error } = await supabase.functions.invoke("mercadopago-create-payment", {
        body: {
          order_id: orderId,
          payment_type: "credit_card",
          token: tokenData.id,
          payment_method_id: paymentMethodId,
          issuer_id: issuerId,
          installments: 1,
          payer_email: order.customer_email || undefined,
        },
      });

      if (error) throw new Error("Erro ao processar pagamento");
      if (data?.error) throw new Error(data.details || data.error);

      if (data.status === "approved") {
        toast.success("Pagamento aprovado!");
        navigate(`/frete-pago?order_id=${orderId}`);
      } else if (data.status === "rejected") {
        toast.error(`Pagamento rejeitado: ${data.status_detail || "verifique os dados do cartão"}`);
      } else if (data.status === "in_process") {
        toast.info("Pagamento em processamento. Aguarde...");
        navigate(`/frete-pago?order_id=${orderId}`);
      } else {
        toast.error("Status inesperado: " + data.status);
      }
    } catch (err: any) {
      console.error("Card payment error:", err);
      toast.error(err.message || "Erro ao processar pagamento");
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
          <h3 className="font-semibold text-sm text-muted-foreground">📋 Resumo</h3>
          <p className="text-sm">📱 {order.brand} {order.model}</p>
          <p className="text-sm text-muted-foreground">
            🚚 {serviceName}{companyName ? ` (${companyName})` : ""}
          </p>
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="text-sm font-semibold">Valor do frete:</span>
            <span className="text-xl font-bold">{formatBRL(amountCents)}</span>
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
                      Gerar QR Code Pix
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
                  <div className="bg-secondary rounded-lg p-3">
                    <p className="text-xs text-muted-foreground break-all font-mono">
                      {pixCode.length > 100 ? pixCode.slice(0, 100) + "..." : pixCode}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleCopyPix}>
                    <Copy className="w-4 h-4" />
                    Copiar código Pix
                  </Button>
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
                maxLength={14}
              />
            </div>

            <Button
              size="lg"
              className="w-full text-base gap-2"
              onClick={handleCardPayment}
              disabled={
                cardLoading ||
                cardNumber.replace(/\s/g, "").length < 13 ||
                !cardExpMonth ||
                !cardExpYear ||
                cardCvv.length < 3 ||
                !cardHolder ||
                cardCpf.length < 11
              }
            >
              {cardLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando…
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pagar {formatBRL(amountCents)}
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              🔒 Pagamento seguro via Mercado Pago
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
