import { useNavigate } from "react-router-dom";
import { BRANDS } from "@/data/catalog";
import { PageHeader } from "@/components/PageHeader";
import { Smartphone } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <PageHeader title="Orçamento Rápido" subtitle="Escolha a marca do seu aparelho" />

      <main className="px-4 py-6 max-w-lg mx-auto">
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
