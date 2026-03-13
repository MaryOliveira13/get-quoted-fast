import { useRef, useState, useCallback, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
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
  const [atBottom, setAtBottom] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight * 0.95;
    if (nearBottom) {
      setCanAccept(true);
      setAtBottom(true);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setCanAccept(false);
      setAtBottom(false);
      setTimeout(() => {
        const el = scrollRef.current;
        if (el && el.scrollHeight <= el.clientHeight + 5) {
          setCanAccept(true);
          setAtBottom(true);
        }
      }, 100);
    }
  }, [open]);

  if (!open) return null;

  // Process terms to style section titles
  const renderTerms = () => {
    const lines = GUARANTEE_TERMS.split('\n');
    return lines.map((line, i) => {
      const isSectionTitle = /^\d+\)/.test(line.trim());
      if (isSectionTitle) {
        return (
          <span key={i} style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: 'white', display: 'block' }}>
            {line}{'\n'}
          </span>
        );
      }
      return line + (i < lines.length - 1 ? '\n' : '');
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg flex flex-col max-h-[90vh]"
        style={{
          background: '#1a1a1a',
          border: '1px solid rgba(255,107,0,0.2)',
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 18, color: 'white' }}>
              Termos de Garantia
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              Leia até o final para continuar
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: '#FF6B00' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content with fade overlay */}
        <div className="relative shrink-0" style={{ maxHeight: '55vh' }}>
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="overflow-y-auto px-5 py-4 whitespace-pre-line"
            style={{
              maxHeight: '55vh',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.7,
            }}
          >
            {renderTerms()}
          </div>

          {/* Fade gradient */}
          {!atBottom && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                background: 'linear-gradient(to top, #1a1a1a 0%, transparent 100%)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
          )}

          {/* Bounce arrow */}
          {!atBottom && (
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 3,
                color: '#FF6B00',
                animation: 'guaranteeBounce 1.2s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            >
              <ChevronDown size={20} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 transition-colors"
            style={{
              background: '#1c1c1c',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 50,
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 14,
              padding: '12px 16px',
            }}
          >
            Voltar
          </button>
          <button
            disabled={!canAccept}
            onClick={onAccept}
            className="flex-1 transition-all"
            style={{
              background: canAccept ? '#FF6B00' : 'rgba(255,107,0,0.25)',
              borderRadius: 50,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              fontSize: 14,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: canAccept ? 'white' : 'rgba(255,255,255,0.3)',
              padding: '12px 16px',
              border: 'none',
              boxShadow: canAccept
                ? '0 0 30px rgba(255,107,0,0.5), 0 4px 16px rgba(255,107,0,0.3)'
                : 'none',
              cursor: canAccept ? 'pointer' : 'not-allowed',
            }}
          >
            Continuar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes guaranteeBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </div>
  );
}
