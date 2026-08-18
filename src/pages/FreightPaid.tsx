import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
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
  brand: string;
  model: string;
  freight_payment_status: string;
  label_status: string;
  label_url_pdf: string | null;
  label_url_png: string | null;
  tracking_code: string | null;
  shipping_amount: number;
  shipping_service: string;
}

export default function FreightPaid() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const trackingToken = searchParams.get("tracking_token");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      // Use the secure Edge Function instead of direct SELECT
      const { data, error: err } = await supabase.functions.invoke("public-order-status", {
        body: { order_id: orderId, tracking_token: trackingToken },
      });

      if (err || !data || data.error) {
        setError(data?.error || "Pedido não encontrado.");
        setLoading(false);
        return;
      }
      setOrder(data as OrderData);
      setLoading(false);
      return data;
    } catch (err) {
      setError("Erro ao carregar status do pedido.");
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder();
  }, [orderId, fetchOrder]);

  // Polling logic updated to use Edge Function
  useEffect(() => {
    if (!order) return;
    if (order.label_status === "generated") return;
    if (order.freight_payment_status !== "approved") return;

    setPolling(true);
    let attempts = 0;
    const maxAttempts = 20;

    const interval = setInterval(async () => {
      attempts++;
      const { data } = await supabase.functions.invoke("public-order-status", {
        body: { order_id: orderId, tracking_token: trackingToken },
      });

      if (data?.label_status === "generated") {
        setOrder(data);
        setPolling(false);
        clearInterval(interval);
      }

      if (data?.label_status === "failed") {
        setOrder(data);
        setPolling(false);
        clearInterval(interval);
      }

      if (attempts >= maxAttempts) {
        setPolling(false);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [order?.label_status, order?.freight_payment_status, orderId]);

  // Also poll for payment status
  useEffect(() => {
    if (!order) return;
    if (order.freight_payment_status === "approved") return;

    let attempts = 0;
    const maxAttempts = 20;

    const interval = setInterval(async () => {
      attempts++;
      const { data } = await supabase.functions.invoke("public-order-status", {
        body: { order_id: orderId, tracking_token: trackingToken },
      });

      if (data?.freight_payment_status === "approved") {
        setOrder(data);
        clearInterval(interval);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [order?.freight_payment_status, orderId]);

  const handleRetryLabel = async () => {
    if (!orderId) return;
    setRetrying(true);
    try {
      const { data, error: err } = await supabase.functions.invoke("generate-label", {
        body: { order_id: orderId },
      });
      if (err) throw err;
      if (data?.label_url_pdf) {
        fetchOrder();
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
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader title="Etiqueta" backTo="/" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">ID do pedido não informado.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader title="Etiqueta" backTo="/" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Carregando pedido…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader title="Etiqueta" backTo="/" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">{error || "Erro desconhecido."}</p>
        </div>
      </div>
    );
  }

  const isLabelReady = order.label_status === "generated" && order.label_url_pdf;
  const isPaid = order.freight_payment_status === "approved";

  const waMessage = `Olá! Meu frete foi pago e a etiqueta foi gerada ✅

📱 Aparelho: ${order.brand} ${order.model}
🚚 Frete: ${order.shipping_service}
Valor pago: R$ ${(order.shipping_amount || 0).toFixed(2).replace(".", ",")}
🏷️ Etiqueta (PDF): ${order.label_url_pdf || "Gerando..."}
📍 Rastreamento: ${order.tracking_code || "Aguardando"}
🧾 Pedido: ${order.id}

Vou postar o aparelho e envio o comprovante. Pode me orientar os próximos passos?`;

  return (
    <div className="min-h-screen bg-background pb-8 text-foreground">
      <PageHeader title="Etiqueta de envio" backTo="/" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-5">
        {isPaid && isLabelReady ? (
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
            <h2 className="text-lg font-bold">Etiqueta pronta ✅</h2>
            <p className="text-sm text-muted-foreground">Frete pago e etiqueta gerada com sucesso.</p>
          </div>
        ) : isPaid && order.label_status === "failed" ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
            <h2 className="text-lg font-bold">Falha ao gerar etiqueta</h2>
            <p className="text-sm text-muted-foreground">O pagamento foi confirmado mas houve erro na geração da etiqueta.</p>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleRetryLabel} disabled={retrying}>
              {retrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Tentar gerar etiqueta novamente
            </Button>
          </div>
        ) : isPaid && polling ? (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5 text-center space-y-2">
            <Loader2 className="w-10 h-10 text-yellow-500 mx-auto animate-spin" />
            <h2 className="text-lg font-bold">Gerando etiqueta…</h2>
            <p className="text-sm text-muted-foreground">O pagamento foi confirmado. Aguarde a geração da etiqueta.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5 text-center space-y-2">
            <Loader2 className="w-10 h-10 text-yellow-500 mx-auto animate-spin" />
            <h2 className="text-lg font-bold">Confirmando pagamento…</h2>
            <p className="text-sm text-muted-foreground">Aguardando confirmação do pagamento do frete.</p>
          </div>
        )}

        {isLabelReady && (
          <div className="space-y-3">
            <Button size="lg" className="w-full text-base gap-2" onClick={() => window.open(order.label_url_pdf!, "_blank")}>
              <Download className="w-5 h-5" /> Baixar etiqueta (PDF)
            </Button>
            {order.label_url_png && (
              <Button variant="outline" size="lg" className="w-full text-base gap-2" onClick={() => window.open(order.label_url_png!, "_blank")}>
                <Image className="w-5 h-5" /> Baixar etiqueta (PNG)
              </Button>
            )}
          </div>
        )}

        {order.tracking_code && (
          <div className="rounded-xl border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4" /> Rastreamento
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm font-mono font-bold">{order.tracking_code}</p>
              <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(order.tracking_code!); toast.success("Código copiado!"); }}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">📋 Resumo do pedido</h3>
          <p className="text-sm">📱 {order.brand} {order.model}</p>
          <p className="text-sm text-muted-foreground">Frete: {order.shipping_service} — R$ {(order.shipping_amount || 0).toFixed(2).replace(".", ",")}</p>
          <p className="text-xs text-muted-foreground mt-1">ID: {order.id}</p>
        </div>

        {isLabelReady && (
          <Button variant="whatsapp" size="lg" className="w-full text-base gap-2" onClick={() => openWhatsApp(waMessage)}>
            <MessageCircle className="w-5 h-5" /> Enviar no WhatsApp
          </Button>
        )}
      </main>
    </div>
  );
}
