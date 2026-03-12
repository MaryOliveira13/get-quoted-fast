import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const STEPS = [
  { title: "Escolha o aparelho", desc: "Selecione marca, modelo e o defeito a reparar." },
  { title: "Receba o orçamento", desc: "Veja o valor estimado na hora, sem compromisso." },
  { title: "Envie para reparo", desc: "Geramos a etiqueta de envio e você acompanha tudo." },
];

const TRUST = ["Grátis para solicitar", "Sem cadastro obrigatório", "100% seguro"];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(0,0%,4%)] relative overflow-hidden">
      {/* Glows */}
      <div
        className="absolute top-[-100px] right-[-80px] w-[350px] h-[350px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(24 100% 50% / 0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[10%] left-[30%] w-[300px] h-[300px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(24 100% 50% / 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Oversized background text */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none select-none">
        <span className="font-display text-[80px] md:text-[120px] text-foreground/[0.03] tracking-widest">
          COTAÇÃO RÁPIDA
        </span>
      </div>

      <main className="relative z-10 px-5 max-w-lg mx-auto">
        {/* Hero */}
        <section className="pt-16 pb-12 flex flex-col items-center text-center">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium tracking-wide uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Resposta em minutos
          </span>

          {/* Headline */}
          <h1 className="font-display text-[44px] md:text-[56px] leading-[0.95] tracking-wide text-foreground">
            Seu orçamento
            <br />
            <span className="text-primary">em instantes.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
            Preencha uma vez, receba propostas de múltiplos fornecedores. Sem complicação.
          </p>

          {/* CTAs */}
          <div className="flex gap-3 mt-8 w-full max-w-xs">
            <button
              onClick={() => navigate("/orcamento")}
              className="flex-1 bg-primary text-primary-foreground rounded-full py-3 text-sm font-bold hover:brightness-110 transition-all active:scale-[0.97]"
            >
              Solicitar agora →
            </button>
            <button
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex-1 border border-border text-foreground rounded-full py-3 text-sm font-medium hover:border-primary/40 transition-colors"
            >
              Ver como funciona
            </button>
          </div>

          {/* Social proof badge */}
          <div className="mt-8 flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2">
            <span className="text-primary font-bold text-sm">500+</span>
            <span className="text-muted-foreground text-xs">
              cotações enviadas com sucesso
            </span>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="pb-10">
          <div className="grid gap-3">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden"
              >
                {i === 0 && (
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
                )}
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm mb-3">
                  0{i + 1}
                </div>
                <h3 className="font-bold text-foreground text-base mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust bar */}
        <section className="pb-8">
          <div className="bg-card/50 border border-border rounded-2xl p-4">
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {TRUST.map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <Check className="w-3 h-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
            <p className="text-center text-[11px] text-primary/60 mt-3">
              ● 12 cotações hoje
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
