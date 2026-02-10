import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";

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
      className={`sticky top-0 z-50 transition-all duration-200 bg-[#f3873e] ${
        isScrolled
          ? "backdrop-blur-md shadow-sm"
          : ""
      }`}
    >
      <div className="max-w-lg mx-auto flex items-center gap-2.5 px-4 py-3">
        <img src={logo} alt="TechFix" className="w-9 h-9 rounded-xl object-cover" />
        <span className="text-lg font-bold text-background">TechFix</span>
      </div>
    </header>
  );
}
