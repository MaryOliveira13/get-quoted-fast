import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/money";
import { openWhatsApp, msgOrcamentoRapido } from "@/lib/whatsapp";
import { AlertCircle, MessageCircle, Pencil } from "lucide-react";

interface QuoteState {
  brandId: string;
  brandName: string;
  modelSlug: string;
  modelName: string;
  services: { id: string; label: string; priceCents: number }[];
  totalCents: number;
}

export default function QuoteReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as QuoteState | null;

  if (!state || !state.services?.length) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Revisão" backTo="/orcamento" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">
            Nenhum orçamento selecionado. Volte e selecione os serviços.
          </p>
          <Button variant="outline" onClick={() => navigate("/orcamento")}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const { brandId, brandName, modelSlug, modelName, services, totalCents } = state;

  const handleConfirm = () => {
    const items = services.map((s) => ({ label: s.label, priceCents: s.priceCents }));
    const msg = msgOrcamentoRapido(brandName, modelName, items, totalCents);
    openWhatsApp(msg);
  };

  const handleEdit = () => {
    navigate(`/orcamento/${brandId}/${modelSlug}`, {
      state: { preSelected: services.map((s) => s.id) },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <PageHeader
        title="Revisão do orçamento"
        backTo={`/orcamento/${brandId}/${modelSlug}`}
      />

      <main className="px-4 py-6 max-w-lg mx-auto">
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-base">
            <span>📱</span>
            <span className="font-semibold">
              {modelName}{" "}
              <span className="text-muted-foreground font-normal">({brandName})</span>
            </span>
          </div>

          <div className="border-t pt-3 space-y-2">
            <p className="text-sm font-medium text-muted-foreground mb-2">✅ Serviços selecionados</p>
            {services.map((s) => (
              <div key={s.id} className="flex justify-between items-center">
                <span className="text-sm">• {s.label}</span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {formatBRL(s.priceCents)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-semibold">💰 Total estimado</span>
            <span className="text-xl font-bold">{formatBRL(totalCents)}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Valores base. Confirmação final após avaliação do aparelho.
        </p>
      </main>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t px-4 py-4">
        <div className="max-w-lg mx-auto space-y-2">
          <Button
            variant="whatsapp"
            size="lg"
            className="w-full text-base"
            onClick={handleConfirm}
          >
            <MessageCircle className="w-5 h-5" />
            Confirmar e enviar no WhatsApp
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full text-base"
            onClick={handleEdit}
          >
            <Pencil className="w-4 h-4" />
            Editar serviços
          </Button>
        </div>
      </div>
    </div>
  );
}
