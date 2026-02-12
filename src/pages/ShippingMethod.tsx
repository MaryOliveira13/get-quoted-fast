import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { getQuoteDraft } from "@/lib/storage";
import { updateShippingDraft } from "@/lib/storage";
import { STORE_SHIPPING_ADDRESS } from "@/config/store";
import { AlertCircle, Tag, Truck, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ShippingMethod() {
  const navigate = useNavigate();
  const quote = getQuoteDraft();

  if (!quote) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Envio" backTo="/orcamento" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">
            Nenhum orçamento encontrado. Volte e selecione os serviços.
          </p>
          <Button variant="outline" onClick={() => navigate("/orcamento")}>Voltar</Button>
        </div>
      </div>
    );
  }

  const choose = (method: "label_by_us" | "self_label") => {
    updateShippingDraft({ shippingMethod: method });
    if (method === "self_label") {
      navigate("/envio/etiqueta-propria/dados");
    } else {
      navigate("/envio/dados-pessoais");
    }
  };

  const addr = STORE_SHIPPING_ADDRESS;
  const addrText = `${addr.street}, ${addr.number} - ${addr.district}, ${addr.city} - ${addr.state}, ${addr.zip}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(addrText);
    toast.success("Endereço copiado!");
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Envio do aparelho" backTo="/orcamento-revisao" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
        <div className="text-center space-y-1 mb-6">
          <h2 className="text-xl font-bold">Como deseja enviar seu aparelho?</h2>
          <p className="text-sm text-muted-foreground">
            Escolha como prefere gerar a etiqueta de envio
          </p>
        </div>

        <button
          onClick={() => choose("label_by_us")}
          className="w-full rounded-xl border border-border bg-card p-5 text-left hover:border-whatsapp transition-colors active:scale-[0.98] space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-whatsapp/10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-whatsapp" />
            </div>
            <span className="font-semibold text-base">Gerar etiqueta para mim</span>
          </div>
          <p className="text-sm text-muted-foreground pl-[52px]">
            Nós geramos a etiqueta com desconto especial. Você só paga o frete via Pix.
          </p>
        </button>

        <button
          onClick={() => choose("self_label")}
          className="w-full rounded-xl border border-border bg-card p-5 text-left hover:border-foreground/30 transition-colors active:scale-[0.98] space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Truck className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="font-semibold text-base">Vou gerar minha própria etiqueta</span>
          </div>
          <p className="text-sm text-muted-foreground pl-[52px]">
            Você mesmo gera a etiqueta nos Correios ou transportadora de sua preferência.
          </p>
        </button>

        {/* Store address */}
        <div className="rounded-xl border border-border bg-card p-5 mt-6 space-y-3">
          <p className="text-sm font-semibold">📦 Endereço de envio (destino)</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{addrText}</p>
          <Button variant="outline" size="sm" onClick={copyAddress} className="gap-2">
            <Copy className="w-4 h-4" />
            Copiar endereço
          </Button>
        </div>
      </main>
    </div>
  );
}
