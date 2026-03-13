import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const STEPS = [
  { title: "Escolha o serviço", desc: "Selecione marca, modelo e o reparo que precisa." },
  { title: "Envie o aparelho", desc: "Preencha seus dados e envie pelo correio com frete incluso." },
  { title: "Receba consertado", desc: "Devolvemos seu aparelho funcionando perfeitamente." },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[hsl(0,0%,4%)] min-h-screen relative overflow-hidden">
      {/* Glows */}
      <div
        className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsla(24,100%,50%,0.12) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[10%] left-[30%] w-[300px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsla(24,100%,50%,0.06) 0%, transparent 70%)" }}
      />

      {/* Oversized background text */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-full pointer-events-none select-none">
        <p className="text-[120px] md:text-[180px] text-center text-foreground/[0.02] leading-none whitespace-nowrap font-extrabold font-[family-name:var(--font-display)] uppercase">
          Cotação Rápida
        </p>
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-lg mx-auto px-5 pt-20 pb-10 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[12px] font-semibold px-3 py-1.5 rounded-full mb-6 font-[family-name:var(--font-body)] tracking-[0.3px]">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Resposta em minutos
        </span>

        {/* Headline */}
        <h1 className="text-[48px] md:text-[64px] leading-[0.95] tracking-[0.5px] text-foreground uppercase font-extrabold font-[family-name:var(--font-display)] mb-4">
          Seu orçamento<br />
          <span className="text-primary">em instantes.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-foreground/40 text-[15px] max-w-sm mb-8 font-normal font-[family-name:var(--font-body)]">
          Preencha uma vez, receba propostas de múltiplos fornecedores. Sem complicação.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate("/orcamento")}
            className="flex-1 bg-primary text-primary-foreground font-semibold py-3.5 px-6 rounded-full text-[15px] hover:brightness-110 transition-all active:scale-[0.97] font-[family-name:var(--font-body)] tracking-[0.3px]"
          >
            Solicitar agora →
          </button>
          <button
            onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex-1 border border-border text-foreground/60 font-medium py-3.5 px-6 rounded-full text-[14px] hover:border-primary/40 hover:text-foreground transition-all font-[family-name:var(--font-body)] tracking-[0.3px]"
          >
            Ver como funciona
          </button>
        </div>

        {/* Social proof badge */}
        <div className="mt-10 bg-card border border-border rounded-2xl px-5 py-3 flex items-center gap-3">
          <span className="text-[28px] text-primary font-bold font-[family-name:var(--font-display)]">500+</span>
          <span className="text-[12px] text-foreground/40 leading-tight font-normal font-[family-name:var(--font-body)]">
            cotações enviadas<br />com sucesso
          </span>
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 max-w-lg mx-auto px-5 pb-10">
        <h2 className="text-[32px] tracking-[0.5px] text-foreground uppercase font-extrabold font-[family-name:var(--font-display)] text-center mb-6">
          Como funciona
        </h2>

        <div className="grid gap-3">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden hover:border-primary/40 transition-colors"
            >
              {i === 0 && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
              )}
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[14px] font-bold mb-3 font-[family-name:var(--font-display)]">
                0{i + 1}
              </div>
              <h3 className="text-foreground font-semibold text-[15px] mb-1 font-[family-name:var(--font-body)]">{step.title}</h3>
              <p className="text-foreground/40 text-[13px] font-normal font-[family-name:var(--font-body)]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust bar */}
      <footer className="relative z-10 max-w-lg mx-auto px-5 pb-8">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex flex-wrap justify-center gap-4 text-[12px] text-foreground/40 font-normal font-[family-name:var(--font-body)]">
            {["Grátis para solicitar", "Sem cadastro obrigatório", "100% seguro"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;