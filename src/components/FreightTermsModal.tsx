import { useRef, useState, useCallback, useEffect } from "react";
import { X, ChevronDown, Check } from "lucide-react";

const FREIGHT_TERMS = `Termos de Envio e Pagamento — Power Cell

Leia com atenção até o final. Ao continuar, você declara que leu e concorda com os termos abaixo.

1) Pagamento do frete

Nesta etapa, você paga APENAS o frete de envio do aparelho até nossa assistência.

2) Valor do conserto

O valor do CONSERTO NÃO é cobrado agora. Após receber e avaliar o aparelho, enviaremos o orçamento final e prazo via WhatsApp.

3) Pagamento do conserto

O pagamento do conserto será feito via WhatsApp (enviaremos link de pagamento).

4) Retorno do aparelho

O aparelho só será enviado de volta após conclusão do serviço e confirmação do pagamento do conserto.

5) Frete de retorno

O frete de retorno será combinado após a finalização do serviço.

6) Garantia

Garantia de 90 dias para defeito de fabricação da peça/serviço.

Exclusões: mau uso, quedas após o serviço, vidro/tela/tampa trincados, oxidação/contato com líquidos, violação do aparelho por terceiros.

Acionamento de garantia: o cliente arca com os custos de frete de ida e volta para análise.`;

interface FreightTermsModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function FreightTermsModal({ open, onClose, onAccept }: FreightTermsModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [checked, setChecked] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight * 0.95;
    if (nearBottom) {
      setScrolledToEnd(true);
      setAtBottom(true);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setScrolledToEnd(false);
      setAtBottom(false);
      setChecked(false);
      setTimeout(() => {
        const el = scrollRef.current;
        if (el && el.scrollHeight <= el.clientHeight + 5) {
          setScrolledToEnd(true);
          setAtBottom(true);
        }
      }, 100);
    }
  }, [open]);

  if (!open) return null;

  const canAccept = scrolledToEnd && checked;

  // Process terms to style section titles
  const renderTerms = () => {
    const lines = FREIGHT_TERMS.split('\n');
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
              Termos de Envio e Pagamento
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
        <div className="relative shrink-0" style={{ maxHeight: '45vh' }}>
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="overflow-y-auto px-5 py-4 whitespace-pre-line freight-terms-scroll"
            style={{
              maxHeight: '45vh',
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
                animation: 'freightBounce 1.2s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            >
              <ChevronDown size={20} />
            </div>
          )}
        </div>

        {/* Checkbox */}
        <div className="px-5 py-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrolledToEnd && setChecked(!checked)}
              disabled={!scrolledToEnd}
              className="shrink-0 flex items-center justify-center transition-all"
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                border: checked ? 'none' : '1.5px solid rgba(255,107,0,0.4)',
                background: checked ? '#FF6B00' : 'transparent',
                cursor: scrolledToEnd ? 'pointer' : 'not-allowed',
                opacity: scrolledToEnd ? 1 : 0.4,
              }}
            >
              {checked && <Check size={14} color="white" strokeWidth={3} />}
            </button>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 13,
                color: 'rgba(255,255,255,0.6)',
                cursor: scrolledToEnd ? 'pointer' : 'default',
              }}
              onClick={() => scrolledToEnd && setChecked(!checked)}
            >
              Li e concordo com os termos acima
            </span>
          </div>
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
              fontSize: 13,
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
            Continuar para pagamento
          </button>
        </div>
      </div>

      <style>{`
        @keyframes freightBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
        .freight-terms-scroll {
          scrollbar-width: thin;
          scrollbar-color: #FF6B00 transparent;
        }
        .freight-terms-scroll::-webkit-scrollbar { width: 3px; }
        .freight-terms-scroll::-webkit-scrollbar-track { background: transparent; }
        .freight-terms-scroll::-webkit-scrollbar-thumb { background: #FF6B00; border-radius: 99px; }
      `}</style>
    </div>
  );
}
