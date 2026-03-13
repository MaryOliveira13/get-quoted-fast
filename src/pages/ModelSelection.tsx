import { useState } from "react";
import { ArrowLeft, Search, AlertCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { findBrand, MODELS_BY_BRAND, slugify } from "@/data/catalog";
import { Button } from "@/components/ui/button";

export default function ModelSelection() {
  const { brand: brandSlug } = useParams<{ brand: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const brand = findBrand(brandSlug ?? "");

  if (!brand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 px-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-foreground">Marca não encontrada</p>
          <Button variant="outline" onClick={() => navigate("/orcamento")}>Voltar</Button>
        </div>
      </div>
    );
  }

  const models = MODELS_BY_BRAND[brand.id] ?? [];

  if (models.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl border p-6 text-center space-y-4">
          <h1 className="text-xl font-bold text-foreground">Modelos não cadastrados ainda</h1>
          <p className="text-[13px] text-foreground/40">Solicite um orçamento personalizado</p>
          <Button
            variant="whatsapp"
            onClick={() => navigate(`/orcamento-personalizado?brand=${encodeURIComponent(brand.name)}`)}
          >
            Orçamento Personalizado
          </Button>
        </div>
      </div>
    );
  }

  const trimmed = query.trim();
  const filtered = trimmed.length >= 1
    ? models.filter((m) => m.toLowerCase().includes(trimmed.toLowerCase()))
    : models;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border flex flex-col overflow-hidden" style={{ maxHeight: "85vh" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <button
            onClick={() => navigate("/orcamento")}
            className="p-2 -ml-2 rounded-full hover:bg-muted/40 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <span className="bg-primary/10 text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[1px] font-[family-name:var(--font-body)]">
              Passo 2 de 3
            </span>
          </div>
        </div>

        <div className="px-5 pb-2">
          <h1 className="text-[32px] leading-none tracking-[0.5px] text-foreground uppercase font-extrabold font-[family-name:var(--font-display)]">
            Escolha o modelo
          </h1>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar modelo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors font-[family-name:var(--font-body)]"
              autoFocus
            />
          </div>
          <p className="text-[12px] text-foreground/30 mt-2 font-normal font-[family-name:var(--font-body)]">
            Exibindo {filtered.length} de {models.length} modelos
          </p>
        </div>

        {/* Model list */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-1.5">
          {filtered.map((model) => (
            <button
              key={model}
              onClick={() => navigate(`/orcamento/${brand.id}/${slugify(model)}`)}
              className="w-full text-left px-4 py-3 rounded-xl bg-background border border-transparent hover:border-primary/40 hover:bg-muted/40 transition-all active:scale-[0.98]"
            >
              <span className="font-medium text-foreground text-[14px] font-[family-name:var(--font-body)]">{model}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <p className="text-foreground/40 text-[13px] mb-3 font-normal font-[family-name:var(--font-body)]">Nenhum modelo encontrado</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/orcamento-personalizado?brand=${encodeURIComponent(brand.name)}`)}
              >
                Orçamento personalizado
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}