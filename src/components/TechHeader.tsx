import brandLogo from "@/assets/powercell-brand.png";

export function TechHeader() {
  return (
    <header className="sticky top-0 z-50 bg-card border-b-2 border-primary px-5 py-3 relative overflow-hidden">
      {/* Glow decorativo */}
      <div
        className="absolute -top-[30px] -right-[30px] w-[120px] h-[120px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(24 100% 50% / 0.2) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-lg mx-auto flex items-center justify-start relative z-10">
        <img src={brandLogo} alt="PowerCell" className="h-20 object-contain" />
      </div>
    </header>
  );
}
