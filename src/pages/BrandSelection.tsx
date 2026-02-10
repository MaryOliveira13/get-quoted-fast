import { useNavigate } from "react-router-dom";
import { BRANDS } from "@/data/catalog";
import { Smartphone, Wrench } from "lucide-react";

const BRAND_EMOJI: Record<string, string> = {
  apple: "🍎",
  samsung: "⭐",
  xiaomi: "🟠",
  redmi: "🔴",
  poco: "🟡",
  motorola: "🔵",
  lg: "🟣",
  realme: "🟢",
};

export default function BrandSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary">
      {/* Top bar */}
      <header className="bg-card border-b px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-card-foreground">TechFix</span>
        </div>
      </header>

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
              className="flex flex-col items-center gap-2 p-5 rounded-xl bg-card border shadow-sm hover:shadow-md hover:border-foreground/20 transition-all active:scale-[0.97]"
            >
              <span className="text-3xl">{BRAND_EMOJI[brand.id] ?? "📱"}</span>
              <span className="font-semibold text-card-foreground">{brand.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/orcamento-personalizado")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            Não encontrou? Solicite um orçamento personalizado
          </button>
        </div>
      </main>
    </div>
  );
}
