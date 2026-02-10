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
      className={`sticky top-0 z-50 transition-all duration-200 bg-foreground ${
        isScrolled
          ? "backdrop-blur-md shadow-sm"
          : ""
      }`}
    >
      <div className="max-w-lg mx-auto flex items-center gap-2.5 px-4 py-3">
        <div className="w-9 h-9 rounded-xl bg-background/20 grid place-items-center">
          <Wrench className="w-5 h-5 text-background" />
        </div>
        <span className="text-lg font-bold text-background">TechFix</span>
      </div>
    </header>
  );
}
