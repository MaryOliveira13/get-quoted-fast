import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/money";
import { Loader2, AlertCircle, CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface OrderData {
  id: string;
  brand: string;
  model: string;
  shipping_amount: number;
  freight_payment_status: string;
}

export default function FreightPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, brand, model, shipping_amount, freight_payment_status")
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
      setLoading(false);
    })();
  }, [orderId, navigate]);

  const handlePay = async () => {
    if (!orderId) return;
    setPaying(true);

    try {
      const { data, error } = await supabase.functions.invoke("pagbank-create-checkout", {
        body: { order_id: orderId },
      });

      if (error) throw error;
      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error(data?.error || "Erro ao gerar link de pagamento");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao processar pagamento");
      setPaying(false);
    }
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

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHeader title="Pagamento do Frete" backTo="/envio/frete" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Aparelho</p>
          <p className="text-xl font-bold">
            {order.brand} {order.model}
          </p>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Valor do frete</p>
          <p className="text-3xl font-bold">{formatBRL(order.shipping_amount)}</p>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <CreditCard className="w-5 h-5" />
            <span>Pagamento via PagBank (Cartão ou Pix)</span>
          </div>

          <Button
            size="lg"
            className="w-full text-base gap-2"
            onClick={handlePay}
            disabled={paying}
          >
            {paying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecionando…
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5" />
                Ir para Pagamento
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            🔒 Você será redirecionado para o ambiente seguro do PagBank.
          </p>
        </div>
      </main>
    </div>
  );
}
