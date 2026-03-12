import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { BRANDS } from "@/data/catalog";

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

const PILLS = ["Todas", "Smartphones", "Tablets", "Notebooks"];

export default function BrandSelection() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activePill, setActivePill] = useState("Todas");

  const filtered = BRANDS.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>

        {/* Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {PILLS.map((pill) => (
            <button
              key={pill}
              onClick={() => setActivePill(pill)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activePill === pill
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border hover:border-primary/40"
              }`}
            >
              {pill}
            </button>
          ))}
        </div>

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
              {/* Orange top bar on hover */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

              {/* Arrow on hover */}
              <span className="absolute top-2.5 right-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity text-lg font-bold">
                <ChevronRight className="w-4 h-4" />
              </span>

              {/* Logo */}
              <div className="w-full aspect-square rounded-xl bg-white flex items-center justify-center p-4">
                <img
                  src={BRAND_LOGO[brand.id]}
                  alt={`${brand.name} logo`}
                  className={`${LOGO_SIZE[brand.id] ?? "h-12"} w-auto object-contain`}
                />
              </div>

              {/* Name */}
              <span className="font-medium text-sm text-foreground">
                {brand.name}
              </span>
            </button>
          ))}

          {/* "Outra marca" card */}
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
