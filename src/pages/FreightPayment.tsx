import { useState, useEffect } from "react";
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
  CreditCard, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  Smartphone,
  ShieldCheck,
  Package
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderData {
  id: string;
  brand: string;
  model: string;
  shipping_amount: number;
  freight_payment_status: string;
  shipping_option: any;
}

export default function FreightPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPix, setGeneratingPix] = useState(false);
  const [pixData, setPixData] = useState<{ qrcode_png?: string; qrcode_text?: string } | null>(null);
  
  const [cardData, setCardData] = useState({
    number: "",
    exp_month: "",
    exp_year: "",
    cvv: "",
    holder_name: "",
    holder_cpf: ""
  });
  const [payingCard, setPayingCard] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      // Use public-order-status to bypass RLS for customers
      const { data, error } = await supabase.functions.invoke("public-order-status", {
        body: { order_id: orderId, tracking_token: searchParams.get("tracking_token") },
      });

      if (error || !data || data.error) {
        console.error("Payment page order fetch error:", error || data?.error);
        toast.error(data?.error || "Pedido não encontrado");
        setLoading(false);
        return;
      }

      if (data.freight_payment_status === "approved") {
        navigate(`/frete-pago?order_id=${orderId}&tracking_token=${searchParams.get("tracking_token")}`, { replace: true });
        return;
      }

      setOrder(data as unknown as OrderData);
      setLoading(false);
    })();
  }, [orderId, navigate, searchParams]);

  const handleGeneratePix = async () => {
    if (!orderId) return;
    setGeneratingPix(true);
    try {
      const { data, error } = await supabase.functions.invoke("pagbank-pix", {
        body: { order_id: orderId },
      });
      if (error) throw error;
      setPixData(data);
    } catch (err: any) {
      toast.error("Erro ao gerar PIX");
      console.error(err);
    } finally {
      setGeneratingPix(false);
    }
  };

  const handlePayCard = async () => {
    if (!orderId) return;
    if (!cardData.number || !cardData.exp_month || !cardData.exp_year || !cardData.cvv || !cardData.holder_name) {
      toast.error("Preencha todos os campos do cartão");
      return;
    }
    setPayingCard(true);
    try {
      const { data, error } = await supabase.functions.invoke("pagbank-card", {
        body: { order_id: orderId, card_data: cardData },
      });
      if (error) throw error;
      
      if (data.status === "PAID" || data.status === "AUTHORIZED") {
        toast.success("Pagamento autorizado!");
        navigate(`/frete-pago?order_id=${orderId}`);
      } else {
        toast.error(`Pagamento ${data.status || 'não autorizado'}`);
      }
    } catch (err: any) {
      toast.error("Erro ao processar cartão");
      console.error(err);
    } finally {
      setPayingCard(false);
    }
  };

  const copyPix = () => {
    if (pixData?.qrcode_text) {
      navigator.clipboard.writeText(pixData.qrcode_text);
      toast.success("Código PIX copiado!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-20 pt-16 font-['Inter']">
      <PageHeader title="Pagamento do Frete" backTo="/envio/frete" />
      
      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        
        {/* Resumo do Pedido */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#FF6B00] rounded-full" />
            <h2 className="font-['Montserrat'] font-extrabold text-[12px] uppercase tracking-[2px] text-[#FF6B00]">
              Resumo do Pedido
            </h2>
          </div>
          
          <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-[#222] rounded-xl flex items-center justify-center border border-white/5">
              <Smartphone className="w-8 h-8 text-[#FF6B00]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-['Montserrat'] font-bold text-[16px] truncate">{order.model}</h3>
              <p className="text-[12px] text-white/40 uppercase tracking-wider">{order.brand}</p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 space-y-3">
             <div className="flex justify-between items-center text-sm">
                <span className="text-white/50 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Modalidade de frete
                </span>
                <span className="font-medium text-white/80">{order.shipping_option?.serviceName || "SEDEX"}</span>
             </div>
             <div className="pt-2 border-t border-white/5 flex justify-between items-end">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Valor do frete</span>
                <span className="text-2xl font-black text-[#FF6B00]">{formatBRL(order.shipping_amount)}</span>
             </div>
          </div>
        </section>

        {/* Aviso */}
        <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-xl p-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-[#FF6B00] shrink-0" />
          <p className="text-[12px] text-[#FF6B00]/90 leading-relaxed font-medium">
            Você está pagando apenas o <strong>frete de envio</strong>. O valor do conserto será combinado após a análise técnica do seu aparelho.
          </p>
        </div>

        {/* Abas de Pagamento */}
        <Tabs defaultValue="pix" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1a] border border-white/5 p-1 h-12 rounded-xl">
            <TabsTrigger 
              value="pix" 
              className="rounded-lg data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <QrCode className="w-4 h-4 mr-2" /> PIX
            </TabsTrigger>
            <TabsTrigger 
              value="card" 
              className="rounded-lg data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <CreditCard className="w-4 h-4 mr-2" /> Cartão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pix" className="mt-4 space-y-4">
            {!pixData ? (
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 text-center space-y-4">
                <QrCode className="w-12 h-12 text-white/10 mx-auto" />
                <p className="text-sm text-white/60">Gere o QR Code para pagar instantaneamente via PIX.</p>
                <Button 
                  onClick={handleGeneratePix} 
                  disabled={generatingPix}
                  className="w-full h-12 bg-[#FF6B00] hover:bg-[#FF6B00]/90 font-bold"
                >
                  {generatingPix ? <Loader2 className="w-5 h-5 animate-spin" /> : "Gerar QR Code PIX"}
                </Button>
              </div>
            ) : (
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 text-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="bg-white p-3 rounded-2xl inline-block mx-auto shadow-2xl">
                  {pixData.qrcode_png ? (
                    <img src={pixData.qrcode_png} alt="QR Code PIX" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100">
                       <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">PIX Copia e Cola</Label>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={pixData.qrcode_text} 
                      readOnly 
                      className="bg-[#111] border-white/10 text-[12px] h-11"
                    />
                    <Button 
                      size="icon" 
                      onClick={copyPix}
                      className="bg-[#222] border border-white/10 hover:bg-[#333] shrink-0 h-11 w-11"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-white/40 pt-2 border-t border-white/5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Aguardando confirmação do pagamento...
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="card" className="mt-4 space-y-4">
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-bold text-white/40 tracking-widest">Número do Cartão</Label>
                <Input 
                  placeholder="0000 0000 0000 0000"
                  value={cardData.number}
                  onChange={(e) => setCardData({...cardData, number: e.target.value})}
                  className="bg-[#111] border-white/10 h-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-bold text-white/40 tracking-widest">Validade (MM/AA)</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="MM"
                      maxLength={2}
                      value={cardData.exp_month}
                      onChange={(e) => setCardData({...cardData, exp_month: e.target.value})}
                      className="bg-[#111] border-white/10 h-12 text-center"
                    />
                    <Input 
                      placeholder="AA"
                      maxLength={2}
                      value={cardData.exp_year}
                      onChange={(e) => setCardData({...cardData, exp_year: e.target.value})}
                      className="bg-[#111] border-white/10 h-12 text-center"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-bold text-white/40 tracking-widest">CVV</Label>
                  <Input 
                    placeholder="123"
                    maxLength={4}
                    value={cardData.cvv}
                    onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                    className="bg-[#111] border-white/10 h-12 text-center"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-bold text-white/40 tracking-widest">Nome no Cartão</Label>
                <Input 
                  placeholder="Como está no cartão"
                  value={cardData.holder_name}
                  onChange={(e) => setCardData({...cardData, holder_name: e.target.value})}
                  className="bg-[#111] border-white/10 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-bold text-white/40 tracking-widest">CPF do Titular</Label>
                <Input 
                  placeholder="000.000.000-00"
                  value={cardData.holder_cpf}
                  onChange={(e) => setCardData({...cardData, holder_cpf: e.target.value})}
                  className="bg-[#111] border-white/10 h-12"
                />
              </div>

              <Button 
                onClick={handlePayCard} 
                disabled={payingCard}
                className="w-full h-14 bg-[#FF6B00] hover:bg-[#FF6B00]/90 font-black text-lg mt-4 shadow-[0_8px_24px_rgba(255,107,0,0.3)] transition-all active:scale-95"
              >
                {payingCard ? <Loader2 className="w-6 h-6 animate-spin" /> : `PAGAR ${formatBRL(order.shipping_amount)}`}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Rodapé de segurança */}
        <div className="flex items-center justify-center gap-2 text-white/30 text-[10px] uppercase font-bold tracking-[2px] pt-4">
          <ShieldCheck className="w-4 h-4" />
          Pagamento seguro via PagSeguro
        </div>

      </main>
    </div>
  );
}
