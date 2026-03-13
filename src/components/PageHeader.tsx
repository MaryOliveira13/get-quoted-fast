import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
}

export function PageHeader({ title, subtitle, backTo }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className="p-2 -ml-2 rounded-full hover:bg-card transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-[18px] font-semibold text-foreground truncate font-[family-name:var(--font-body)]">{title}</h1>
          {subtitle && (
            <p className="text-[13px] text-foreground/40 truncate font-normal font-[family-name:var(--font-body)]">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}