import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Play, Upload } from "lucide-react";
import { useState, useRef } from "react";

const STEPS = [
  { title: "Escolha o serviço", desc: "Selecione marca, modelo e o reparo que precisa." },
  { title: "Envie o aparelho", desc: "Preencha seus dados e envie pelo correio com frete incluso." },
  { title: "Receba consertado", desc: "Devolvemos seu aparelho funcionando perfeitamente." },
];

const STATS = [
  { value: "+2k", label: "Aparelhos\nconsertados" },
  { value: "98%", label: "Clientes\nsatisfeitos" },
  { value: "5min", label: "Tempo de\nresposta" },
];

const Index = () => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleShowVideo = () => {
    setShowVideo((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          videoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
      return next;
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoSrc(URL.createObjectURL(file));
    }
  };

  return (
    <div style={{ background: "#080808" }} className="min-h-screen relative overflow-hidden">
      {/* Top line gradient */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: 2,
          background: "linear-gradient(90deg, transparent, #FF6B00, transparent)",
        }}
      />

      {/* Glow left */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: -120,
          top: "50%",
          transform: "translateY(-50%)",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(255,107,0,0.18), transparent 65%)",
        }}
      />

      {/* Glow right */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: -100,
          top: "30%",
          width: 320,
          height: 320,
          background: "radial-gradient(circle, rgba(255,107,0,0.1), transparent 65%)",
        }}
      />

      {/* Watermark */}
      <div
        className="absolute pointer-events-none select-none hero-watermark"
        style={{
          bottom: -40,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: 140,
          color: "rgba(255,255,255,0.025)",
          whiteSpace: "nowrap",
        }}
      >
        POWER CELL
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center text-center px-5 pt-16 pb-10">

        {/* Title */}
        <div className="mb-0" style={{ padding: "0 16px", maxWidth: "100%", overflow: "hidden" }}>
          {/* Linha 1 — "Seu" */}
          <div className="flex items-center justify-center gap-4 mb-1">
            <div style={{ width: 60, height: 1, background: "rgba(255,255,255,0.12)" }} />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "clamp(14px, 3.5vw, 18px)",
                textTransform: "uppercase",
                letterSpacing: 6,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Seu
            </span>
            <div style={{ width: 60, height: 1, background: "rgba(255,255,255,0.12)" }} />
          </div>

          {/* Linha 2 — "ORÇAMENTO" */}
          <span
            className="block"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(48px, 10vw, 96px)",
              color: "white",
              textTransform: "uppercase",
              letterSpacing: -3,
              lineHeight: 0.9,
              width: "100%",
              textAlign: "center",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
          >
            ORÇAMENTO
          </span>

          {/* Linha 3 — "em INSTANTES." */}
          <div className="flex items-baseline justify-center mt-1" style={{ flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "clamp(24px, 5vw, 42px)",
                color: "rgba(255,255,255,0.25)",
                textTransform: "uppercase",
                letterSpacing: 2,
                marginRight: 14,
              }}
            >
              em
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "clamp(38px, 8vw, 58px)",
                color: "#FF6B00",
                textTransform: "uppercase",
                letterSpacing: -1,
                textShadow: "0 0 50px rgba(255,107,0,0.4)",
              }}
            >
              Instantes.
            </span>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 48,
            height: 3,
            background: "#FF6B00",
            borderRadius: 99,
            margin: "24px auto",
          }}
        />

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: 15,
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            lineHeight: 1.7,
            maxWidth: 360,
            marginBottom: 36,
          }}
        >
          Preencha uma vez, receba{" "}
          <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>propostas</span> de
          múltiplos fornecedores.{" "}
          <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>Sem complicação.</span>
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          {/* Solicitar agora */}
          <button
            onClick={() => navigate("/orcamento")}
            className="flex items-center gap-3 transition-all active:scale-[0.97] hover:brightness-110"
            style={{
              background: "#FF6B00",
              border: "none",
              borderRadius: 50,
              height: 54,
              padding: "0 32px",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              color: "white",
              boxShadow: "0 0 40px rgba(255,107,0,0.5), 0 8px 24px rgba(255,107,0,0.25)",
              cursor: "pointer",
            }}
          >
            Solicitar agora
            <span
              className="flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                background: "rgba(0,0,0,0.2)",
                borderRadius: "50%",
                fontSize: 13,
              }}
            >
              →
            </span>
          </button>

          {/* Ver como funciona */}
          <button
            onClick={handleShowVideo}
            className="relative overflow-hidden flex items-center gap-3 transition-all active:scale-[0.97] hero-shine-btn"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 50,
              height: 54,
              padding: "0 28px",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
            }}
          >
            Ver como funciona
            <span
              className="flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                background: "rgba(255,107,0,0.15)",
                border: "1px solid rgba(255,107,0,0.3)",
                borderRadius: "50%",
              }}
            >
              <Play className="w-[10px] h-[10px]" style={{ color: "#FF6B00" }} />
            </span>
          </button>
        </div>

        {/* Stats bar */}
        <div
          className="flex w-full"
          style={{
            maxWidth: 460,
            background: "rgba(255,255,255,0.03)",
            border: "0.5px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 48,
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="flex-1 text-center"
              style={{
                padding: "16px 12px",
                borderRight: i < STATS.length - 1 ? "0.5px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: 22,
                  color: "#FF6B00",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "rgba(255,255,255,0.3)",
                  lineHeight: 1.3,
                  whiteSpace: "pre-line",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Video section */}
        {showVideo && (
          <div ref={videoSectionRef} className="w-full flex flex-col items-center mb-10">
            {/* Section title */}
            <div className="flex items-center gap-2 mb-3.5">
              <div
                style={{
                  width: 3,
                  height: 14,
                  background: "#FF6B00",
                  borderRadius: 99,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: "#FF6B00",
                }}
              >
                Tutorial
              </span>
            </div>

            {/* Video container */}
            <div
              className="relative w-full"
              style={{
                maxWidth: 560,
                aspectRatio: "16/9",
                background: "#0d0d0d",
                borderRadius: 16,
                border: "1px solid rgba(255,107,0,0.2)",
                overflow: "hidden",
              }}
            >
              {/* Badge */}
              <div
                className="absolute top-3 right-3 z-10"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "5px 10px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 11,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Tutorial
              </div>

              {videoSrc ? (
                <video
                  src={videoSrc}
                  controls
                  className="w-full h-full"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                  <span style={{ fontSize: 36, color: "rgba(255,255,255,0.1)", lineHeight: 1 }}>🎬</span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "rgba(255,255,255,0.25)",
                      marginTop: 10,
                    }}
                  >
                    Vídeo em breve
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      fontSize: 12,
                      color: "rgba(255,255,255,0.15)",
                      marginTop: 6,
                    }}
                  >
                    O tutorial estará disponível em breve
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
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


      {/* Animations */}
      <style>{`
        @keyframes hero-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
        .hero-shine-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: hero-shine 3s ease-in-out infinite;
        }
        @keyframes hero-shine {
          0% { left: -100%; }
          50%, 100% { left: 150%; }
        }
      `}</style>
    </div>
  );
};

export default Index;
