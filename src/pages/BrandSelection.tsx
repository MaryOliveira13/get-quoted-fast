import { useNavigate } from "react-router-dom";
import { BRANDS } from "@/data/catalog";

import appleLogo from "@/assets/brands/apple.svg";
import samsungLogo from "@/assets/brands/samsung.svg";
import xiaomiLogo from "@/assets/brands/xiaomi.svg";

import pocoLogo from "@/assets/brands/poco-new.png";
import motorolaLogo from "@/assets/brands/motorola.png";
import lgLogo from "@/assets/brands/lg.svg";
import realmeLogo from "@/assets/brands/realme-new.png";

const BRAND_LOGO: Record<string, string> = {
  apple: appleLogo,
  samsung: samsungLogo,
  xiaomi: xiaomiLogo,
  
  poco: pocoLogo,
  motorola: motorolaLogo,
  lg: lgLogo,
  realme: realmeLogo,
};

const LOGO_SIZE: Record<string, string> = {
  apple: "h-12",
  samsung: "h-8",
  xiaomi: "h-10",
  
  poco: "h-[80px]",
  motorola: "h-[104px]",
  lg: "h-12",
  realme: "h-[104px]",
};

export default function BrandSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary">
      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Heading */}
        <div className="mb-5">
          <h1 className="text-2xl font-extrabold text-foreground">Selecione a Marca</h1>
          <p className="text-sm text-muted-foreground mt-1">Qual é a marca do seu aparelho?</p>
        </div>

        {/* Brand grid */}
        <div className="grid grid-cols-2 gap-3">
          {BRANDS.map((brand) => (
            <button
              key={brand.id}
              onClick={() => navigate(`/orcamento/${brand.id}`)}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md hover:border-foreground/20 transition-all active:scale-[0.97] aspect-square"
            >
              <img
                src={BRAND_LOGO[brand.id]}
                alt={`${brand.name} logo`}
                className={`${LOGO_SIZE[brand.id] ?? "h-12"} w-auto object-contain`}
              />
              <span className="font-semibold text-card-foreground">{brand.name}</span>
            </button>
          ))}
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
