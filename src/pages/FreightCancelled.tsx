import { useSearchParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function FreightCancelled() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Pagamento cancelado" backTo="/" />
      <div className="flex flex-col items-center justify-center px-4 py-20 gap-4 max-w-lg mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Pagamento cancelado</h2>
        <p className="text-sm text-muted-foreground">
          O pagamento do frete foi cancelado. Você pode tentar novamente.
        </p>
        {orderId && (
          <p className="text-xs text-muted-foreground">Pedido: {orderId}</p>
        )}
        <Button onClick={() => navigate("/envio/frete")} className="mt-4">
          Voltar para escolher frete
        </Button>
      </div>
    </div>
  );
}
