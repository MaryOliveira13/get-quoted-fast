import { useNavigate } from "react-router-dom";
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
  realme: "h-[104px]",
  infinix: "h-[90px]",
};

export default function BrandSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Container card */}
        <div className="rounded-2xl border border-border bg-card p-5">
          {/* Heading */}
          <h1 className="text-xl font-bold text-foreground mb-5">Escolha a marca do seu aparelho</h1>

          {/* Brand grid */}
          <div className="grid grid-cols-2 gap-3">
            {BRANDS.map((brand) => (
              <button
                key={brand.id}
                onClick={() => navigate(`/orcamento/${brand.id}`)}
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-secondary hover:bg-muted transition-all active:scale-[0.97]"
              >
                <div className="w-full aspect-square rounded-xl bg-white flex items-center justify-center p-4">
                  <img
                    src={BRAND_LOGO[brand.id]}
                    alt={`${brand.name} logo`}
                    className={`${LOGO_SIZE[brand.id] ?? "h-12"} w-auto object-contain`}
                  />
                </div>
                <span className="font-semibold text-foreground">{brand.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA box */}
        <div className="mt-6 rounded-xl bg-card border p-5 flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">Não encontrou sua marca?</p>
          <button
            onClick={() => navigate("/orcamento-personalizado")}
            className="px-6 py-2.5 rounded-full border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
          >
            Orçamento Personalizado
          </button>
        </div>
      </main>
    </div>
  );
}
