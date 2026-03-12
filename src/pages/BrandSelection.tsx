import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { BRANDS, MODELS_BY_BRAND, slugify } from "@/data/catalog";

import appleLogo from "@/assets/brands/apple.svg";
import samsungLogo from "@/assets/brands/samsung.svg";
import xiaomiLogo from "@/assets/brands/xiaomi.svg";
import motorolaLogo from "@/assets/brands/motorola.png";
import lgLogo from "@/assets/brands/lg.svg";
import infinixLogo from "@/assets/brands/infinix.png";

const BRAND_LOGO: Record<string, string> = {
  apple: appleLogo,
  samsung: samsungLogo,
  xiaomi: xiaomiLogo,
  motorola: motorolaLogo,
  lg: lgLogo,
  infinix: infinixLogo,
};

const LOGO_SIZE: Record<string, string> = {
  apple: "h-12",
  samsung: "h-8",
  xiaomi: "h-10",
  motorola: "h-[104px]",
  lg: "h-12",
  infinix: "h-[90px]",
};

// Popular models for quick suggestions
const POPULAR_MODELS: Record<string, string[]> = {
  apple: ["iPhone 14", "iPhone 13", "iPhone 12", "iPhone 11", "iPhone SE"],
  samsung: ["Galaxy S23", "Galaxy S22", "Galaxy A54", "Galaxy A34"],
  motorola: ["Moto G84", "Moto G73", "Moto G53", "Edge 40"],
  xiaomi: ["Redmi Note 12", "Redmi Note 11", "POCO X5"],
  infinix: ["Hot 30", "Note 30"],
};

interface Suggestion {
  type: "brand" | "model";
  brandId: string;
  brandName: string;
  model?: string;
}

function buildSuggestions(): Suggestion[] {
  const suggestions: Suggestion[] = [];
  for (const brand of BRANDS) {
    suggestions.push({ type: "brand", brandId: brand.id, brandName: brand.name });
    const models = MODELS_BY_BRAND[brand.id] ?? [];
    for (const model of models) {
      suggestions.push({ type: "model", brandId: brand.id, brandName: brand.name, model });
    }
  }
  return suggestions;
}

const ALL_SUGGESTIONS = buildSuggestions();

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function BrandSelection() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    return ALL_SUGGESTIONS.filter((s) => {
      const label = s.type === "model" ? `${s.brandName} ${s.model}` : s.brandName;
      return label.toLowerCase().includes(q);
    }).slice(0, 5);
  }, [search]);

  const handleSelect = (s: Suggestion) => {
    setShowDropdown(false);
    setSearch("");
    if (s.type === "model" && s.model) {
      navigate(`/orcamento/${s.brandId}/${slugify(s.model)}`);
    } else {
      navigate(`/orcamento/${s.brandId}`);
    }
  };

  const filtered = BRANDS.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Search with autocomplete */}
        <div className="relative" ref={wrapperRef}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar marca ou modelo..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => search.trim().length >= 2 && setShowDropdown(true)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />

          {/* Dropdown */}
          {showDropdown && results.length > 0 && (
            <div
              className="absolute left-0 right-0 top-full mt-1.5 z-50 overflow-hidden"
              style={{
                background: "#1a1a1a",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 14,
              }}
            >
              {results.map((s, i) => (
                <button
                  key={`${s.brandId}-${s.model ?? "brand"}-${i}`}
                  onClick={() => handleSelect(s)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                  style={{
                    borderBottom: i < results.length - 1 ? "0.5px solid rgba(255,255,255,0.07)" : "none",
                  }}
                >
                  {s.type === "model" && (
                    <span className="text-primary text-sm shrink-0">⚡</span>
                  )}
                  <div className="flex flex-col min-w-0">
                    {s.type === "model" ? (
                      <>
                        <span className="text-foreground font-semibold text-sm leading-tight">
                          <HighlightMatch text={s.model!} query={search.trim()} />
                        </span>
                        <span className="text-foreground/45 text-xs mt-0.5">
                          <HighlightMatch text={s.brandName} query={search.trim()} />
                        </span>
                      </>
                    ) : (
                      <span className="text-foreground font-semibold text-sm">
                        <HighlightMatch text={s.brandName} query={search.trim()} />
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Shortcut hint */}
        <p className="text-foreground/25 text-[11px]">
          ⚡ Digite o modelo direto para ir mais rápido
        </p>

        {/* Step indicator + title */}
        <div>
          <span className="text-[11px] text-primary font-medium tracking-wide uppercase">
            Passo 1 de 3
          </span>
          <h1 className="font-display text-[28px] leading-tight tracking-wide text-foreground mt-1">
            Qual a marca do aparelho?
          </h1>
        </div>

        {/* Brand grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((brand) => (
            <button
              key={brand.id}
              onClick={() => navigate(`/orcamento/${brand.id}`)}
              className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all active:scale-[0.97] overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <span className="absolute top-2.5 right-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity text-lg font-bold">
                <ChevronRight className="w-4 h-4" />
              </span>
              <div className="w-full aspect-square rounded-xl bg-white flex items-center justify-center p-4">
                <img
                  src={BRAND_LOGO[brand.id]}
                  alt={`${brand.name} logo`}
                  className={`${LOGO_SIZE[brand.id] ?? "h-12"} w-auto object-contain`}
                />
              </div>
              <span className="font-medium text-sm text-foreground">
                {brand.name}
              </span>
            </button>
          ))}

          <button
            onClick={() => navigate("/orcamento-personalizado")}
            className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-all active:scale-[0.97] min-h-[180px]"
          >
            <span className="text-3xl text-primary">+</span>
            <span className="text-sm text-muted-foreground font-medium">
              Outra marca
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}