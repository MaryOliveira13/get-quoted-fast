import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";

export function TechHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-card/70 backdrop-blur-md border-b shadow-sm"
          : "bg-card border-b border-transparent"
      }`}
    >
      <div className="max-w-lg mx-auto flex items-center gap-2.5 px-4 py-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center">
          <Wrench className="w-5 h-5 text-primary" />
        </div>
        <span className="text-lg font-bold text-card-foreground">TechFix</span>
      </div>
    </header>
  );
}
