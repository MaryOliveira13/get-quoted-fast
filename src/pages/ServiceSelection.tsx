import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { findBrand, findModel, findModelEntry } from "@/data/catalog";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, ArrowRight, MessageCircle } from "lucide-react";
import { openWhatsApp } from "@/lib/whatsapp";

export default function ServiceSelection() {
  const { brand: brandSlug, model: modelSlug } = useParams<{ brand: string; model: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const preSelected = (location.state as { preSelected?: string[] } | null)?.preSelected;
  const [selected, setSelected] = useState<Set<string>>(
    new Set(preSelected ?? [])
  );

  const brand = findBrand(brandSlug ?? "");
  const modelName = brand ? findModel(brand.id, modelSlug ?? "") : undefined;
  const modelEntry = brand ? findModelEntry(brand.id, modelSlug ?? "") : undefined;

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

  if (!modelName) {
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

  const services = modelEntry?.services ?? [];
  const hasServices = services.length > 0;

  // No services available - show contact message
  if (!hasServices) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader
          title={modelName}
          subtitle={brand.name}
          backTo={`/orcamento/${brand.id}`}
        />
        <main className="px-4 py-8 max-w-lg mx-auto">
          <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Ainda não temos preço cadastrado para este modelo.
            </h2>
            <p className="text-sm text-muted-foreground">
              Entre em contato para receber seu orçamento personalizado.
            </p>
            <Button
              variant="whatsapp"
              size="lg"
              className="w-full text-base"
              onClick={() =>
                openWhatsApp(
                  `Olá! Gostaria de um orçamento para o ${modelName} (${brand.name}).`
                )
              }
            >
              <MessageCircle className="w-5 h-5" />
              Solicitar orçamento via WhatsApp
            </Button>
          </div>

          {/* Outro Defeito */}
          <button
            onClick={() =>
              navigate(
                `/orcamento-personalizado?brand=${encodeURIComponent(brand.name)}&model=${encodeURIComponent(modelName)}`
              )
            }
            className="mt-4 w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-all active:scale-[0.98]"
          >
            <span className="font-medium text-primary">Outro Defeito</span>
            <span className="text-xs text-primary/80">Orçamento personalizado →</span>
          </button>
        </main>
      </div>
    );
  }

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const selectedServices = services.filter((s) => selected.has(s.name));
  const totalCents = selectedServices.reduce((sum, s) => sum + s.price * 100, 0);

  const handleReview = () => {
    navigate("/orcamento-revisao", {
      state: {
        brandId: brand.id,
        brandName: brand.name,
        modelSlug: modelSlug,
        modelName: modelName,
        services: selectedServices.map((s) => ({
          id: s.name.toLowerCase().replace(/\s+/g, "_"),
          label: s.name,
          priceCents: s.price * 100,
        })),
        totalCents,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <PageHeader
        title={modelName}
        subtitle={brand.name}
        backTo={`/orcamento/${brand.id}`}
      />

      <main className="px-4 py-4 max-w-lg mx-auto">
        <p className="text-xs text-muted-foreground mb-4">
          Valores base. Confirmação final após avaliação do aparelho.
        </p>

        <div className="flex flex-col gap-2">
          {services.map((service) => {
            const isSelected = selected.has(service.name);
            return (
              <button
                key={service.name}
                onClick={() => toggle(service.name)}
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
                    {service.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(service.price)}
                </span>
              </button>
            );
          })}

          {/* Outro Defeito */}
          <button
            onClick={() =>
              navigate(
                `/orcamento-personalizado?brand=${encodeURIComponent(brand.name)}&model=${encodeURIComponent(modelName)}`
              )
            }
            className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-all active:scale-[0.98]"
          >
            <span className="font-medium text-primary">Outro Defeito</span>
            <span className="text-xs text-primary/80">Orçamento personalizado →</span>
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
              <span className="text-lg font-bold">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalCents / 100)}
              </span>
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
