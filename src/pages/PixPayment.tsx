import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/money";
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PixPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error || !data) {
        toast.error("Pedido não encontrado");
      } else {
        setOrder(data);
        if (data.freight_payment_status === "approved") {
          navigate(`/frete-pago?order_id=${orderId}`);
        }
      }
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
      toast.error(err.message || "Erro ao processar pagamento");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Pagamento" backTo="/" />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Pagamento" backTo="/" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">Dados de pagamento não encontrados.</p>
          <Button variant="outline" onClick={() => navigate("/")}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHeader title="Pagamento" backTo="/" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Valor do Pagamento</p>
          <p className="text-3xl font-bold">{formatBRL(order.shipping_amount || 0)}</p>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Você será redirecionado para o PagBank para concluir seu pagamento com segurança.
          </p>
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
                Realizar pagamento
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
