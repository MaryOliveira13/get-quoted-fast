import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { findBrand, findModel, getModelServices } from "@/data/catalog";
import { formatBRL } from "@/lib/money";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, ArrowRight, MessageCircle } from "lucide-react";
import { buildWaLink } from "@/lib/whatsapp";

function serviceId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default function ServiceSelection() {
  const { brand: brandSlug, model: modelSlug } = useParams<{ brand: string; model: string }>();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const services = getModelServices(brand.name, model);
  const hasServices = services.length > 0;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedServices = services.filter((s) => selected.has(serviceId(s.name)));
  const totalCents = selectedServices.reduce((sum, s) => sum + s.price * 100, 0);

  const handleReview = () => {
    navigate("/orcamento-revisao", {
      state: {
        brandId: brand.id,
        brandName: brand.name,
        modelSlug: modelSlug,
        modelName: model,
        services: selectedServices.map((s) => ({
          id: serviceId(s.name),
          label: s.name,
          priceCents: s.price * 100,
        })),
        totalCents,
      },
    });
  };

  // No services — show contact fallback
  if (!hasServices) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title={model} subtitle={brand.name} backTo={`/orcamento/${brand.id}`} />
        <main className="px-4 py-10 max-w-lg mx-auto flex flex-col items-center text-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-foreground mb-2">Preço ainda não cadastrado</h2>
            <p className="text-[13px] text-foreground/40">
              Ainda não temos preço cadastrado para o <strong className="text-foreground">{model}</strong>. Entre em contato para receber seu orçamento.
            </p>
          </div>
          <a
            href={buildWaLink(`Olá! Gostaria de um orçamento para o ${brand.name} ${model}.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="whatsapp" size="lg" className="gap-2">
              <MessageCircle className="w-5 h-5" />
              Solicitar orçamento via WhatsApp
            </Button>
          </a>
          <button
            onClick={() => navigate(`/orcamento-personalizado?brand=${encodeURIComponent(brand.name)}&model=${encodeURIComponent(model)}`)}
            className="text-[13px] font-medium text-primary hover:underline"
          >
            Ou preencha o formulário de orçamento personalizado
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <PageHeader
        title={model}
        subtitle={brand.name}
        backTo={`/orcamento/${brand.id}`}
      />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-primary/10 text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[1px] font-[family-name:var(--font-body)]">
            Passo 3 de 3
          </span>
        </div>

        <h1 className="text-[26px] leading-none tracking-[0.5px] text-foreground uppercase font-extrabold font-[family-name:var(--font-display)] mb-1">
          Selecione o serviço
        </h1>
        <p className="text-[13px] text-foreground/40 font-normal font-[family-name:var(--font-body)] mb-4">
          Valores base. Confirmação final após avaliação do aparelho.
        </p>

        <div className="flex flex-col gap-2">
          {services.map((service) => {
            const id = serviceId(service.name);
            const isSelected = selected.has(id);
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={`flex items-center justify-between px-4 py-4 rounded-2xl border transition-all active:scale-[0.98] ${
                  isSelected
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "bg-card border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] font-semibold text-foreground font-[family-name:var(--font-body)]">{service.name}</p>
                    <p className="text-[12px] text-foreground/35 font-normal font-[family-name:var(--font-body)] mt-0.5">Selecionar serviço</p>
                  </div>
                </div>
                <p className="text-[18px] text-primary tracking-[0.5px] font-bold font-[family-name:var(--font-display)]">
                  {formatBRL(service.price * 100)}
                </p>
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
            className="flex items-center justify-between px-4 py-4 rounded-2xl border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-all active:scale-[0.98]"
          >
            <span className="text-[16px] font-bold text-primary font-[family-name:var(--font-body)]">Outro Defeito</span>
            <span className="text-[13px] font-medium text-primary font-[family-name:var(--font-body)]">Orçamento personalizado →</span>
          </button>
        </div>
      </main>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border px-4 py-4">
        <div className="max-w-lg mx-auto">
          {selected.size > 0 && (
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-[13px] text-foreground/40 font-[family-name:var(--font-body)]">
                {selected.size} serviço{selected.size !== 1 ? "s" : ""}
              </span>
              <span className="text-[18px] text-primary font-bold font-[family-name:var(--font-display)]">
                {formatBRL(totalCents)}
              </span>
            </div>
          )}
          <Button
            variant="whatsapp"
            size="lg"
            className="w-full text-base font-semibold tracking-[0.3px] font-[family-name:var(--font-body)]"
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