import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/money";
import { AlertCircle, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export default function PixPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const trackingToken = searchParams.get("token") || searchParams.get("tracking_token");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [pixData, setPixData] = useState<any>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("public-order-status", {
        body: { order_id: orderId, tracking_token: trackingToken }
      });

      if (error || !data) {
        toast.error("Pedido não encontrado");
        setLoading(false);
        return;
      }

      if (data.freight_payment_status === "approved" || data.freight_payment_status === "paid") {
        navigate(`/frete-pago?order_id=${orderId}${trackingToken ? `&tracking_token=${trackingToken}` : ""}`);
        return;
      }

      setOrder(data);
      setLoading(false);
      
      // Auto-trigger Pix generation if order found
      generatePix(data.id);
    } catch (err) {
      console.error("Public order status call failed:", err);
      toast.error("Erro ao carregar pedido");
      setLoading(false);
    }
  };

  const generatePix = async (id: string) => {
    setPixLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("asaas-create-pix", {
        body: { order_id: id, tracking_token: trackingToken },
      });
      if (error) throw error;
      setPixData(data);
      setPolling(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar Pix");
    }
    setPixLoading(false);
  };

  // Poll for status
  useEffect(() => {
    if (!polling || !orderId) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke("public-order-status", {
          body: { order_id: orderId, tracking_token: trackingToken }
        });
        if (data?.freight_payment_status === "approved" || data?.freight_payment_status === "paid") {
          setPolling(false);
          toast.success("Pagamento confirmado!");
          navigate(`/frete-pago?order_id=${orderId}${trackingToken ? `&tracking_token=${trackingToken}` : ""}`);
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [polling, orderId, trackingToken, navigate]);

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

  const handleCopy = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      toast.success("Código Pix copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHeader title="Pagamento via Pix" backTo="/envio/frete" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Valor do frete
          </p>
          <p className="text-3xl font-bold">{formatBRL(order.shipping_amount * 100)}</p>
        </div>

        {pixLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
          </div>
        ) : pixData ? (
          <>
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl">
                <img
                  src={`data:image/png;base64,${pixData.qr_code_base64}`}
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
                  {pixData.qr_code.length > 100 ? pixData.qr_code.slice(0, 100) + "..." : pixData.qr_code}
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
                Copiar código Pix
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Aguardando pagamento…</span>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              ⏱ O QR Code expira em breve. A confirmação é automática.
            </p>
          </>
        ) : (
          <div className="text-center py-10">
             <Button onClick={() => generatePix(order.id)}>Tentar gerar Pix novamente</Button>
          </div>
        )}
      </main>
    </div>
  );
}
