import powercellLogo from "@/assets/powercell-logo.png";

export function TechHeader() {
  return (
    <header className="sticky top-0 z-50 bg-card border-b-2 border-primary px-5 py-3 relative overflow-hidden">
      {/* Glow decorativo */}
      <div
        className="absolute -top-[30px] -right-[30px] w-[120px] h-[120px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsla(24,100%,50%,0.2) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-lg mx-auto flex items-center gap-3 relative">
        {/* Icon wrapper */}
        <div className="w-11 h-11 bg-secondary rounded-xl border border-primary/40 flex items-center justify-center text-2xl flex-shrink-0">
          ⚡
        </div>

        <div className="flex flex-col">
          <span className="font-['Bebas_Neue'] text-[26px] leading-none tracking-[2px] text-foreground">
            P<span className="text-primary">O</span>WER <span className="text-primary">C</span>ELL
          </span>
          <span className="text-[10px] text-foreground/35 tracking-widest uppercase mt-0.5">
            Assistência técnica
          </span>
        </div>
      </div>
    </header>
  );
}
