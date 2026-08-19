import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { openWhatsApp } from "@/lib/whatsapp";
import {
  CheckCircle,
  Download,
  Image,
  Loader2,
  AlertCircle,
  MessageCircle,
  Package,
  Copy,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "5531998562010";

interface OrderData {
  id: string;
  cpf: string;
  customer_name: string;
  customer_phone: string;
  customer_cep: string | null;
  customer_uf: string | null;
  customer_city: string | null;
  customer_district: string | null;
  customer_street: string | null;
  customer_number: string | null;
  customer_complement: string | null;
  brand: string;
  model: string;
  issue_description: string | null;
  services: any;
  shipping_option: any;
  shipping_amount: number;
  freight_payment_status: string;
  label_status: string;
  label_url_pdf: string | null;
  label_url_png: string | null;
  tracking_code: string | null;
  melhor_envio_shipment_id: string | null;
  repair_estimate_total: number;
}

export default function FreightPaid() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const trackingToken = searchParams.get("tracking_token");
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const capturing = false; // No longer needed, kept for template compat
  const [retrying, setRetrying] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId || !trackingToken) {
      if (!orderId) {
        setError("ID do pedido não informado.");
        setLoading(false);
      }
      return;
    }
    
    try {
      const { data, error: err } = await supabase.functions.invoke("public-order-status", {
        body: { order_id: orderId, tracking_token: trackingToken }
      });

      if (err || !data) {
        setError("Pedido não encontrado.");
        setLoading(false);
        return;
      }
      setOrder(data as unknown as OrderData);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Fetch order error:", err);
      setError("Erro ao carregar pedido.");
      setLoading(false);
    }
  }, [orderId, trackingToken]);

  // On mount: fetch order
  useEffect(() => {
    if (!orderId) return;
    fetchOrder();
  }, [orderId, fetchOrder]);

  // Polling when payment confirmed but label not yet generated
  useEffect(() => {
    if (!order) return;
    if (order.label_status === "generated") return;
    if (order.freight_payment_status !== "approved" && order.freight_payment_status !== "paid") return;

    setPolling(true);
    let attempts = 0;
    const maxAttempts = 20;

    const interval = setInterval(async () => {
      attempts++;
      const { data } = await supabase.functions.invoke("public-order-status", {
        body: { order_id: orderId!, tracking_token: trackingToken! }
      });

      if (data?.label_status === "generated") {
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                label_status: "generated",
                label_url_pdf: data.label_url_pdf,
                label_url_png: data.label_url_png,
                tracking_code: data.tracking_code,
              }
            : prev
        );
        setPolling(false);
        clearInterval(interval);
      }

      if (data?.label_status === "failed") {
        setOrder((prev) => prev ? { ...prev, label_status: "failed" } : prev);
        setPolling(false);
        clearInterval(interval);
      }

      if (attempts >= maxAttempts) {
        setPolling(false);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [order?.label_status, order?.freight_payment_status, orderId, trackingToken]);

  // Also poll for payment status if not paid yet
  useEffect(() => {
    if (!order) return;
    if (order.freight_payment_status === "approved" || order.freight_payment_status === "paid") return;

    let attempts = 0;
    const maxAttempts = 20;

    const interval = setInterval(async () => {
      attempts++;
      const { data } = await supabase.functions.invoke("public-order-status", {
        body: { order_id: orderId!, tracking_token: trackingToken! }
      });

      if (data?.freight_payment_status === "approved" || data?.freight_payment_status === "paid") {
        setOrder((prev) =>
          prev
            ? { ...prev, ...data }
            : prev
        );
        clearInterval(interval);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [order?.freight_payment_status, orderId, trackingToken]);

  const handleRetryLabel = async () => {
    if (!orderId) return;
    setRetrying(true);
    try {
      const { data, error: err } = await supabase.functions.invoke("generate-label", {
        body: { order_id: orderId },
      });
      if (err) throw err;
      if (data?.label_url_pdf) {
        setOrder((prev) => prev ? {
          ...prev,
          label_status: "generated",
          label_url_pdf: data.label_url_pdf,
          label_url_png: data.label_url_png || null,
          tracking_code: data.tracking_code || null,
        } : prev);
        toast.success("Etiqueta gerada com sucesso!");
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (err: any) {
      toast.error("Falha ao gerar etiqueta — tente novamente");
    }
    setRetrying(false);
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Etiqueta" backTo="/" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">ID do pedido não informado.</p>
        </div>
      </div>
    );
  }

  if (loading || capturing) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Etiqueta" backTo="/" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {capturing ? "Confirmando pagamento…" : "Carregando pedido…"}
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Etiqueta" backTo="/" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">{error || "Erro desconhecido."}</p>
        </div>
      </div>
    );
  }

  const safe = (val: string | null | undefined) => val || "Não informado";

  const servicesListFormatted =
    Array.isArray(order.services)
      ? order.services.map((s: any) => `- ${s.label || s.name || String(s)}`).join("\n")
      : "- Não informado";

  const servicesList =
    Array.isArray(order.services)
      ? order.services.map((s: any) => s.label || s.name || String(s)).join(", ")
      : "Não informado";

  const shippingOpt = order.shipping_option || ({} as any);
  const shippingServiceName = shippingOpt.serviceName || shippingOpt.service_name || "Não informado";
  const shippingCompanyName = shippingOpt.companyName || shippingOpt.company_name || "";
  const deliveryMin = shippingOpt.deliveryMinDays || shippingOpt.delivery_min || "";
  const deliveryMax = shippingOpt.deliveryMaxDays || shippingOpt.delivery_max || "";
  const deliveryText = deliveryMin && deliveryMax ? `${deliveryMin}-${deliveryMax} dias úteis` : "";

  const waMessage = `Olá! Meu frete foi pago e a etiqueta foi gerada ✅

👤 Nome: ${safe(order.customer_name)}
📞 Telefone: ${safe(order.customer_phone)}

📦 Endereço do remetente:
${safe(order.customer_street)}, Nº ${safe(order.customer_number)} ${order.customer_complement || ""}
${safe(order.customer_district)} - ${safe(order.customer_city)}/${safe(order.customer_uf)}
CEP: ${safe(order.customer_cep)}

📱 Aparelho: ${order.brand} ${order.model}
📝 Problema: ${safe(order.issue_description)}

✅ Serviços:
${servicesListFormatted}

🚚 Frete: ${shippingServiceName}${shippingCompanyName ? ` (${shippingCompanyName})` : ""}
${deliveryText ? `Prazo: ${deliveryText}` : ""}
Valor pago do frete: R$ ${(order.shipping_amount || 0).toFixed(2).replace(".", ",")}

🏷️ Etiqueta (PDF): ${order.label_url_pdf || "Gerando..."}
📍 Rastreamento: ${safe(order.tracking_code)}

🧾 Pedido: ${order.id}

Vou postar o aparelho e envio o comprovante. Pode me orientar os próximos passos?`;

  const isLabelReady = order.label_status === "generated" && order.label_url_pdf;
  const isPaid = order.freight_payment_status === "approved" || order.freight_payment_status === "paid";

  return (
    <div className="min-h-screen bg-background pb-8">
      <PageHeader title="Etiqueta de envio" backTo="/" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-5">
        {/* Status */}
        {isPaid && isLabelReady ? (
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
            <h2 className="text-lg font-bold">Etiqueta pronta ✅</h2>
            <p className="text-sm text-muted-foreground">
              Frete pago e etiqueta gerada com sucesso.
            </p>
          </div>
        ) : isPaid && order.label_status === "failed" ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
            <h2 className="text-lg font-bold">Falha ao gerar etiqueta</h2>
            <p className="text-sm text-muted-foreground">
              O pagamento foi confirmado mas houve erro na geração da etiqueta.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleRetryLabel}
              disabled={retrying}
            >
              {retrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Tentar gerar etiqueta novamente
            </Button>
          </div>
        ) : isPaid && polling ? (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5 text-center space-y-2">
            <Loader2 className="w-10 h-10 text-yellow-500 mx-auto animate-spin" />
            <h2 className="text-lg font-bold">Gerando etiqueta…</h2>
            <p className="text-sm text-muted-foreground">
              O pagamento foi confirmado. Aguarde a geração da etiqueta.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5 text-center space-y-2">
            <Loader2 className="w-10 h-10 text-yellow-500 mx-auto animate-spin" />
            <h2 className="text-lg font-bold">Confirmando pagamento…</h2>
            <p className="text-sm text-muted-foreground">
              Aguardando confirmação do pagamento do frete.
            </p>
          </div>
        )}

        {/* Download buttons */}
        {isLabelReady && (
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full text-base gap-2"
              onClick={() => window.open(order.label_url_pdf!, "_blank")}
            >
              <Download className="w-5 h-5" />
              Baixar etiqueta (PDF)
            </Button>

            {order.label_url_png && (
              <Button
                variant="outline"
                size="lg"
                className="w-full text-base gap-2"
                onClick={() => window.open(order.label_url_png!, "_blank")}
              >
                <Image className="w-5 h-5" />
                Baixar etiqueta (PNG)
              </Button>
            )}
          </div>
        )}

        {/* Tracking */}
        {order.tracking_code && (
          <div className="rounded-xl border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4" /> Rastreamento
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm font-mono font-bold">{order.tracking_code}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(order.tracking_code!);
                  toast.success("Código copiado!");
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="rounded-xl border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">📋 Resumo do pedido</h3>
          <p className="text-sm">📱 {order.brand} {order.model}</p>
          <p className="text-sm text-muted-foreground">Serviços: {servicesList}</p>
          {order.issue_description && (
            <p className="text-sm text-muted-foreground">Problema: {order.issue_description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Frete: {shippingServiceName} — R$ {(order.shipping_amount || 0).toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">ID: {order.id}</p>
        </div>

        {/* WhatsApp button */}
        {isLabelReady && (
          <Button
            variant="whatsapp"
            size="lg"
            className="w-full text-base gap-2"
            onClick={() => { openWhatsApp(waMessage); }}
          >
            <MessageCircle className="w-5 h-5" />
            Enviar no WhatsApp
          </Button>
        )}
      </main>
    </div>
  );
}
