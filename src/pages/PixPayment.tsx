import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function PixPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (orderId) {
      // Redireciona para a nova tela de pagamento unificada que agora tem PIX e Cartão
      navigate(`/envio/pagamento?order_id=${orderId}`, { replace: true });
    } else {
      navigate("/");
    }
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-[#FF6B00]" />
    </div>
  );
}
