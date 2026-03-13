import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BRANDS, MODELS_BY_BRAND, slugify } from "@/data/catalog";
import { Search } from "lucide-react";

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

// Build flat list of all brand+model combos for search
interface SearchEntry {
  brandId: string;
  brandName: string;
  model?: string;
}

function buildSearchEntries(): SearchEntry[] {
  const entries: SearchEntry[] = [];
  for (const brand of BRANDS) {
    entries.push({ brandId: brand.id, brandName: brand.name });
    const models = MODELS_BY_BRAND[brand.id] ?? [];
    for (const model of models) {
      entries.push({ brandId: brand.id, brandName: brand.name, model });
    }
  }
  return entries;
}

const ALL_ENTRIES = buildSearchEntries();

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    const results: SearchEntry[] = [];

    for (const entry of ALL_ENTRIES) {
      const searchText = entry.model
        ? `${entry.brandName} ${entry.model}`
        : entry.brandName;
      if (searchText.toLowerCase().includes(q)) {
        // Prioritize model matches over brand-only
        results.push(entry);
        if (results.length >= 5) break;
      }
    }

    // Sort: model matches first, then brand-only
    return results.sort((a, b) => {
      if (a.model && !b.model) return -1;
      if (!a.model && b.model) return 1;
      return 0;
    }).slice(0, 5);
  }, [search]);

  const filteredBrands = useMemo(() => {
    if (!search.trim()) return BRANDS;
    const q = search.toLowerCase().trim();
    return BRANDS.filter((b) => b.name.toLowerCase().includes(q));
  }, [search]);

  const handleSelect = (entry: SearchEntry) => {
    setSearch("");
    setShowDropdown(false);
    if (entry.model) {
      // Skip to step 3
      navigate(`/orcamento/${entry.brandId}/${slugify(entry.model)}`);
    } else {
      // Go to step 2
      navigate(`/orcamento/${entry.brandId}`);
    }
  };

  // Show "Outra marca" card only when search has no brand matches
  const showOutraCard = filteredBrands.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-5 max-w-lg mx-auto">
        {/* Search with dropdown */}
        <div ref={wrapperRef} className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <input
            type="text"
            placeholder="Buscar marca ou modelo..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => search.trim() && setShowDropdown(true)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />

          {/* Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-foreground/10 rounded-[14px] overflow-hidden z-20 shadow-xl"
            >
              {suggestions.map((entry, i) => (
                <button
                  key={`${entry.brandId}-${entry.model ?? "brand"}-${i}`}
                  onClick={() => handleSelect(entry)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors text-left border-b border-foreground/[0.05] last:border-b-0"
                >
                  {entry.model && (
                    <span className="text-primary text-sm flex-shrink-0">⚡</span>
                  )}
                  <div className="min-w-0">
                    {entry.model ? (
                      <>
                        <span className="text-foreground/45 text-xs">{entry.brandName} — </span>
                        <span className="text-foreground font-semibold text-sm">
                          {highlightMatch(entry.model, search)}
                        </span>
                      </>
                    ) : (
                      <span className="text-foreground font-semibold text-sm">
                        {highlightMatch(entry.brandName, search)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full">
            Passo 1 de 3
          </span>
        </div>

        <h1 className="font-['Bebas_Neue'] text-[28px] leading-none tracking-wide text-foreground mb-5">
          Qual a marca do aparelho?
        </h1>

        {/* Brand grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredBrands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => navigate(`/orcamento/${brand.id}`)}
              className="group relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all active:scale-[0.97] overflow-hidden"
            >
              {/* Barra laranja topo - hover */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

              {/* Seta - hover */}
              <span className="absolute top-2.5 right-3 text-primary/0 group-hover:text-primary/80 text-lg transition-colors">
                ›
              </span>

              {/* Logo container */}
              <div className="w-full aspect-square rounded-xl bg-white flex items-center justify-center p-4">
                <img
                  src={BRAND_LOGO[brand.id]}
                  alt={`${brand.name} logo`}
                  className={`${LOGO_SIZE[brand.id] ?? "h-12"} w-auto object-contain`}
                />
              </div>

              <span className="font-semibold text-foreground text-sm">{brand.name}</span>
            </button>
          ))}

          {/* Outra marca - only when no brands match */}
          {showOutraCard && (
            <button
              onClick={() => navigate("/orcamento-personalizado")}
              className="group flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-dashed border-border hover:border-primary/40 transition-all active:scale-[0.97]"
            >
              <div className="w-full aspect-square rounded-xl bg-card flex items-center justify-center">
                <span className="text-3xl text-muted-foreground group-hover:text-primary transition-colors">+</span>
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Outra marca</span>
            </button>
          )}
        </div>

        {/* CTA when brands are visible */}
        {!showOutraCard && (
          <div className="mt-6 rounded-xl bg-card border border-border p-5 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">Não encontrou sua marca?</p>
            <button
              onClick={() => navigate("/orcamento-personalizado")}
              className="px-6 py-2.5 rounded-full border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
            >
              Orçamento Personalizado
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
