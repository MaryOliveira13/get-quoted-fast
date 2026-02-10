import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { findBrand, MODELS_BY_BRAND, slugify } from "@/data/catalog";
import { Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ModelSelection() {
  const { brand: brandSlug } = useParams<{ brand: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const brand = findBrand(brandSlug ?? "");

  if (!brand) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
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
      <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl border p-6 text-center space-y-4">
          <h1 className="text-xl font-bold text-foreground">Modelos não cadastrados ainda</h1>
          <p className="text-sm text-muted-foreground">Solicite um orçamento personalizado</p>
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
    <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border flex flex-col overflow-hidden" style={{ maxHeight: "85vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h1 className="text-xl font-bold text-foreground">Escolha o modelo</h1>
          <button
            onClick={() => navigate("/orcamento")}
            className="text-sm font-semibold text-destructive hover:text-destructive/80 transition-colors"
          >
            Trocar marca
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar modelo…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Exibindo {filtered.length} de {models.length} modelos
          </p>
        </div>

        {/* Model list */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-1.5">
          {filtered.map((model) => (
            <button
              key={model}
              onClick={() => navigate(`/orcamento/${brand.id}/${slugify(model)}`)}
              className="w-full text-left px-4 py-3 rounded-xl bg-background border border-transparent hover:border-border hover:bg-muted/40 transition-all active:scale-[0.98]"
            >
              <span className="font-medium text-foreground text-sm">{model}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-sm mb-3">Nenhum modelo encontrado</p>
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
