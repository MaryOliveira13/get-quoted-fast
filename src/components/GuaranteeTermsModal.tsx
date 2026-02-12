import { useRef, useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GUARANTEE_TERMS } from "@/content/terms";

interface GuaranteeTermsModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function GuaranteeTermsModal({ open, onClose, onAccept }: GuaranteeTermsModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canAccept, setCanAccept] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      setCanAccept(true);
    }
  }, []);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setCanAccept(false);
      // Check if content is shorter than container (no scroll needed)
      setTimeout(() => {
        const el = scrollRef.current;
        if (el && el.scrollHeight <= el.clientHeight + 5) {
          setCanAccept(true);
        }
      }, 100);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-white/10 shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Termos de Garantia</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Leia até o final para continuar</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="max-h-[55vh] overflow-y-auto px-5 py-4 text-sm leading-6 text-zinc-200 whitespace-pre-line"
        >
          {GUARANTEE_TERMS}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 flex gap-3 shrink-0">
          <Button
            variant="outline"
            className="flex-1 border-white/10 text-zinc-300 hover:bg-white/5"
            onClick={onClose}
          >
            Voltar
          </Button>
          <Button
            disabled={!canAccept}
            onClick={onAccept}
            className={`flex-1 font-semibold transition-all ${
              canAccept
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-zinc-700 text-zinc-500 opacity-50 cursor-not-allowed"
            }`}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
