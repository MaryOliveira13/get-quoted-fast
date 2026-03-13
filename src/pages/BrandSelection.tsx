import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BRANDS } from "@/data/catalog";
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

export default function BrandSelection() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = BRANDS.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-5 max-w-lg mx-auto">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar marca ou modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />
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
          {filtered.map((brand) => (
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

          {/* Outra marca */}
          <button
            onClick={() => navigate("/orcamento-personalizado")}
            className="group flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-dashed border-border hover:border-primary/40 transition-all active:scale-[0.97]"
          >
            <div className="w-full aspect-square rounded-xl bg-card flex items-center justify-center">
              <span className="text-3xl text-muted-foreground group-hover:text-primary transition-colors">+</span>
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Outra marca</span>
          </button>
        </div>
      </main>
    </div>
  );
}
