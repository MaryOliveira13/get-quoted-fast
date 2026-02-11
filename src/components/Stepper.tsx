import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  current: number; // 0-based
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-1 px-4 py-3">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? "bg-whatsapp text-whatsapp-foreground"
                    : active
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-[10px] leading-tight text-center max-w-[60px] ${
                  active ? "text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-6 h-0.5 mb-4 ${
                  done ? "bg-whatsapp" : "bg-secondary"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
