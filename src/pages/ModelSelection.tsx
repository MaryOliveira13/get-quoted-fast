import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { findBrand, MODELS_BY_BRAND, slugify } from "@/data/catalog";
import { PageHeader } from "@/components/PageHeader";
import { Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ModelSelection() {
  const { brand: brandSlug } = useParams<{ brand: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const brand = findBrand(brandSlug ?? "");

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

  const models = MODELS_BY_BRAND[brand.id] ?? [];

  if (models.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title={brand.name} backTo="/orcamento" subtitle="Modelos" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4 text-center">
          <p className="text-lg font-semibold">Modelos não cadastrados ainda</p>
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
    : [];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={brand.name} subtitle="Selecione o modelo" backTo="/orcamento" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar modelo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        </div>

        {trimmed.length >= 1 && (
          <p className="text-xs text-muted-foreground mb-3">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {trimmed.length < 1 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Digite para buscar o modelo
          </p>
        )}

        <div className="flex flex-col gap-2">
          {filtered.map((model) => (
            <button
              key={model}
              onClick={() => navigate(`/orcamento/${brand.id}/${slugify(model)}`)}
              className="text-left px-4 py-3 rounded-xl bg-card border hover:border-foreground/20 hover:shadow-sm transition-all active:scale-[0.98]"
            >
              <span className="font-medium text-card-foreground">{model}</span>
            </button>
          ))}
          {trimmed.length >= 1 && filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-3">Nenhum modelo encontrado</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/orcamento-personalizado?brand=${encodeURIComponent(brand.name)}`)}
              >
                Solicitar orçamento personalizado
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
