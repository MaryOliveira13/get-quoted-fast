import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { findBrand, findModel } from "@/data/catalog";
import { SERVICES } from "@/data/services";
import { formatBRL } from "@/lib/money";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, ArrowRight } from "lucide-react";

export default function ServiceSelection() {
  const { brand: brandSlug, model: modelSlug } = useParams<{ brand: string; model: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const preSelected = (location.state as { preSelected?: string[] } | null)?.preSelected;
  const [selected, setSelected] = useState<Set<string>>(
    new Set(preSelected ?? [])
  );

  const brand = findBrand(brandSlug ?? "");
  const model = brand ? findModel(brand.id, modelSlug ?? "") : undefined;

  if (!brand) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Erro" backTo="/orcamento" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold">Marca não encontrada</p>
          <Button variant="outline" onClick={() => navigate("/orcamento")}>Voltar</Button>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Erro" backTo={`/orcamento/${brand.id}`} />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold">Modelo não encontrado</p>
          <Button variant="outline" onClick={() => navigate(`/orcamento/${brand.id}`)}>Voltar</Button>
        </div>
      </div>
    );
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedServices = SERVICES.filter((s) => selected.has(s.id));
  const totalCents = selectedServices.reduce((sum, s) => sum + s.priceCents, 0);

  const handleReview = () => {
    navigate("/orcamento-revisao", {
      state: {
        brandId: brand.id,
        brandName: brand.name,
        modelSlug: modelSlug,
        modelName: model,
        services: selectedServices.map((s) => ({
          id: s.id,
          label: s.label,
          priceCents: s.priceCents,
        })),
        totalCents,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <PageHeader
        title={model}
        subtitle={brand.name}
        backTo={`/orcamento/${brand.id}`}
      />

      <main className="px-4 py-4 max-w-lg mx-auto">
        <p className="text-xs text-muted-foreground mb-4">
          Valores base. Confirmação final após avaliação do aparelho.
        </p>

        <div className="flex flex-col gap-2">
          {SERVICES.map((service) => {
            const isSelected = selected.has(service.id);
            return (
              <button
                key={service.id}
                onClick={() => toggle(service.id)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all active:scale-[0.98] ${
                  isSelected
                    ? "bg-whatsapp/10 border-whatsapp shadow-sm"
                    : "bg-card border-border hover:border-foreground/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      isSelected ? "bg-whatsapp border-whatsapp" : "border-muted-foreground/30"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-whatsapp-foreground" />}
                  </div>
                  <span className={`font-medium ${isSelected ? "text-foreground" : "text-card-foreground"}`}>
                    {service.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">
                  {formatBRL(service.priceCents)}
                </span>
              </button>
            );
          })}

          {/* Outro Defeito */}
          <button
            onClick={() =>
              navigate(
                `/orcamento-personalizado?brand=${encodeURIComponent(brand.name)}&model=${encodeURIComponent(model)}`
              )
            }
            className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-[#ff812a]/40 bg-[#ff812a]/10 hover:bg-[#ff812a]/20 transition-all active:scale-[0.98]"
          >
            <span className="font-medium text-[#ff812a]">Outro Defeito</span>
            <span className="text-xs text-[#ff812a]/80">Orçamento personalizado →</span>
          </button>
        </div>
      </main>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t px-4 py-4">
        <div className="max-w-lg mx-auto">
          {selected.size > 0 && (
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-sm text-muted-foreground">
                {selected.size} serviço{selected.size !== 1 ? "s" : ""}
              </span>
              <span className="text-lg font-bold">{formatBRL(totalCents)}</span>
            </div>
          )}
          <Button
            variant="whatsapp"
            size="lg"
            className="w-full text-base"
            disabled={selected.size === 0}
            onClick={handleReview}
          >
            <ArrowRight className="w-5 h-5" />
            Revisar orçamento
          </Button>
        </div>
      </div>
    </div>
  );
}
