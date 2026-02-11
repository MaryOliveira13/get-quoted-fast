import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";
import powercellLogo from "@/assets/powercell-logo.png";

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
      <div className="max-w-lg mx-auto flex items-center justify-center px-4 py-4">
        <img src={powercellLogo} alt="Power Cell" className="h-20 object-contain" />
      </div>
    </header>
  );
}
