import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BRANDS, MODELS_BY_BRAND, slugify } from "@/data/catalog";
import { Search, X } from "lucide-react";

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

interface SearchEntry {
  brandId: string;
  brandName: string;
  model: string;
}

function buildModelEntries(): SearchEntry[] {
  const entries: SearchEntry[] = [];
  for (const brand of BRANDS) {
    const models = MODELS_BY_BRAND[brand.id] ?? [];
    for (const model of models) {
      entries.push({ brandId: brand.id, brandName: brand.name, model });
    }
  }
  return entries;
}

const ALL_MODEL_ENTRIES = buildModelEntries();

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
  

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = search.toLowerCase().trim();

  const allModelSuggestions = useMemo(() => {
    if (!q) return [];
    return ALL_MODEL_ENTRIES.filter((entry) => {
      const full = `${entry.brandName} ${entry.model}`.toLowerCase();
      return full.includes(q) || entry.model.toLowerCase().includes(q);
    });
  }, [q]);

  

  const filteredBrands = useMemo(() => {
    if (!q) return BRANDS;
    return BRANDS.filter((b) => {
      if (b.name.toLowerCase().includes(q)) return true;
      const models = MODELS_BY_BRAND[b.id] ?? [];
      return models.some((m) => m.toLowerCase().includes(q));
    });
  }, [q]);

  const handleSelect = (entry: SearchEntry) => {
    setSearch("");
    setShowDropdown(false);
    navigate(`/orcamento/${entry.brandId}/${slugify(entry.model)}`);
  };

  const hasSearch = q.length > 0;
  const hasBrandMatches = filteredBrands.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-5 max-w-lg mx-auto">
        {/* Search */}
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
            className="w-full bg-card border border-border rounded-xl pl-10 pr-10 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors font-[family-name:var(--font-body)]"
          />

          {/* Clear button */}
          <button
            onClick={() => { setSearch(""); setShowDropdown(false); }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground/80 transition-opacity ${
              search ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Dropdown - model suggestions */}
          {showDropdown && allModelSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-foreground/10 rounded-[14px] z-20 shadow-xl overflow-hidden">
              {/* Results count */}
              <div className="px-4 pt-2.5 pb-1 flex justify-end">
                <span className="text-[11px] text-foreground/30 font-[family-name:var(--font-body)]">{allModelSuggestions.length} resultados</span>
              </div>

              {/* Scrollable list */}
              <div
                className="dropdown-container max-h-[380px] overflow-y-scroll relative"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#FF6B00 transparent', scrollSnapType: 'y proximity' }}
              >
                {allModelSuggestions.map((entry, i) => (
                  <button
                    key={`${entry.brandId}-${entry.model}-${i}`}
                    onClick={() => handleSelect(entry)}
                    className="dropdown-item w-full flex flex-col px-4 py-3 hover:bg-secondary/60 text-left border-b border-foreground/[0.05] last:border-b-0"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <span className="text-foreground font-semibold text-[14px] font-[family-name:var(--font-body)]">
                      {highlightMatch(entry.model, search)}
                    </span>
                    <span className="text-foreground/45 text-[12px] font-normal font-[family-name:var(--font-body)]">{entry.brandName}</span>
                  </button>
                ))}
              </div>

              {/* Fade gradient at bottom */}
              {allModelSuggestions.length > 5 && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none rounded-b-[14px]"
                  style={{ background: "linear-gradient(transparent, hsl(0 0% 10.2%))" }}
                />
              )}
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-primary/10 text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[1px] font-[family-name:var(--font-body)]">
            Passo 1 de 3
          </span>
        </div>

        <h1 className="text-[26px] leading-none tracking-[0.5px] text-foreground uppercase font-extrabold font-[family-name:var(--font-display)] mb-5">
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
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              
              <div className="w-full aspect-square rounded-xl bg-white flex items-center justify-center p-4">
                <img
                  src={BRAND_LOGO[brand.id]}
                  alt={`${brand.name} logo`}
                  className={`${LOGO_SIZE[brand.id] ?? "h-12"} w-auto object-contain`}
                />
              </div>
              <span className="font-semibold text-foreground text-[14px] font-[family-name:var(--font-body)]">{brand.name}</span>
            </button>
          ))}

          {/* Outra marca - only when NO brand matches */}
          {hasSearch && !hasBrandMatches && (
            <button
              onClick={() => navigate("/orcamento-personalizado")}
              className="group flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-dashed border-border hover:border-primary/40 transition-all active:scale-[0.97]"
            >
              <div className="w-full aspect-square rounded-xl bg-card flex items-center justify-center">
                <span className="text-3xl text-muted-foreground group-hover:text-primary transition-colors">+</span>
              </div>
              <span className="text-[14px] text-muted-foreground group-hover:text-foreground transition-colors font-[family-name:var(--font-body)]">Outra marca</span>
            </button>
          )}

          {/* CTA card - inside grid, when brands are visible */}
          {hasBrandMatches && (
            <button
              onClick={() => navigate("/orcamento-personalizado")}
              className="group relative flex flex-col items-center justify-center rounded-2xl transition-all active:scale-[0.97] overflow-hidden"
              style={{
                border: "1.5px dashed rgba(255,107,0,0.4)",
                background: "rgba(255,107,0,0.04)",
              }}
            >
              <div className="w-full aspect-square flex flex-col items-center justify-center gap-2 px-4">
                <span style={{ fontSize: 28, color: "rgba(255,255,255,0.2)" }}>+</span>
                <p
                  className="text-center"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  Não encontrou sua marca?
                </p>
              </div>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}