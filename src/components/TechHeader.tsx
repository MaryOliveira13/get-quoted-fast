import { Link } from "react-router-dom";
import powercellBrand from "@/assets/powercell-brand.png";

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
        <Link 
          to="/" 
          className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-opacity hover:opacity-90"
          aria-label="Ir para a página inicial"
        >
          <img src={powercellBrand} alt="POWER CELL" className="h-[72px] object-contain" />
        </Link>
      </div>
    </header>
  );
}