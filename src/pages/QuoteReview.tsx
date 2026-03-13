import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/money";
import { setQuoteDraft } from "@/lib/storage";
import { AlertCircle, ArrowRight, Pencil } from "lucide-react";
import { GuaranteeTermsModal } from "@/components/GuaranteeTermsModal";

interface QuoteState {
  brandId: string;
  brandName: string;
  modelSlug: string;
  modelName: string;
  services: { id: string; label: string; priceCents: number }[];
  totalCents: number;
}

export default function QuoteReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openTerms, setOpenTerms] = useState(false);
  const state = location.state as QuoteState | null;

  if (!state || !state.services?.length) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Revisão" backTo="/orcamento" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">
            Nenhum orçamento selecionado. Volte e selecione os serviços.
          </p>
          <Button variant="outline" onClick={() => navigate("/orcamento")}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const { brandId, brandName, modelSlug, modelName, services, totalCents } = state;

  const handleContinue = () => {
    setOpenTerms(true);
  };

  const handleAcceptTerms = () => {
    setOpenTerms(false);
    setQuoteDraft({ brandId, brandName, modelSlug, modelName, services, totalCents });
    navigate("/envio/dados-pessoais");
  };

  const handleEdit = () => {
    navigate(`/orcamento/${brandId}/${modelSlug}`, {
      state: { preSelected: services.map((s) => s.id) },
    });
  };

  return (
    <div className="min-h-screen pb-40 relative overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Orange glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-100px',
          right: '-100px',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.25) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-10 backdrop-blur-sm px-4 py-3"
        style={{ background: '#111111', borderBottom: '1px solid rgba(255,107,0,0.3)' }}
      >
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => navigate(`/orcamento/${brandId}/${modelSlug}`)}
            className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#FF6B00' }} />
          </button>
          <h1
            className="truncate"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              fontSize: '18px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'white',
            }}
          >
            Revisão do orçamento
          </h1>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto relative z-[1]">
        {/* Main card */}
        <div
          className="p-6"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)',
            border: '1px solid rgba(255,107,0,0.25)',
            borderRadius: '20px',
            boxShadow: '0 0 40px rgba(255,107,0,0.08)',
          }}
        >
          {/* Device */}
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 shrink-0" style={{ color: '#FF6B00' }} />
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '17px', color: 'white' }}>
              {modelName}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px', color: '#FF6B00' }}>
              ({brandName})
            </span>
          </div>

          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', margin: '16px 0' }} />

          {/* Services */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '12px',
            }}
          >
            Serviços selecionados
          </p>

          {services.map((s) => (
            <div
              key={s.id}
              className="flex justify-between items-center"
              style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
                {s.label}
              </span>
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '14px', color: 'white' }}>
                {formatBRL(s.priceCents)}
              </span>
            </div>
          ))}

          <div style={{ borderTop: '1px solid rgba(255,107,0,0.2)', margin: '16px 0' }} />

          {/* Total */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '4px',
            }}
          >
            Total estimado
          </p>
          <p
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: '38px',
              color: '#FF6B00',
              textShadow: '0 0 30px rgba(255,107,0,0.4)',
              lineHeight: 1.1,
            }}
          >
            {formatBRL(totalCents)}
          </p>

          <div className="mt-3">
            <span
              className="inline-flex items-center"
              style={{
                background: 'rgba(255,107,0,0.1)',
                border: '1px solid rgba(255,107,0,0.25)',
                borderRadius: '99px',
                padding: '4px 12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                color: 'rgba(255,107,0,0.7)',
              }}
            >
              Valores base • Sujeito a avaliação
            </span>
          </div>
        </div>

        {/* Info line */}
        <div className="flex items-center gap-2 mt-4 justify-center">
          <Info className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
            Confirmação final após avaliação presencial do aparelho
          </span>
        </div>
      </main>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 z-10" style={{ background: '#0a0a0aee', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-lg mx-auto space-y-2">
          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 cursor-pointer"
            style={{
              background: '#FF6B00',
              borderRadius: '14px',
              padding: '16px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              fontSize: '15px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'white',
              boxShadow: '0 8px 32px rgba(255,107,0,0.35)',
              border: 'none',
            }}
          >
            <ArrowRight className="w-5 h-5" />
            Continuar para envio
          </button>
          <button
            onClick={handleEdit}
            className="w-full flex items-center justify-center gap-2 cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              padding: '16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <Pencil className="w-4 h-4" />
            Editar serviços
          </button>
        </div>
      </div>
      <GuaranteeTermsModal
        open={openTerms}
        onClose={() => setOpenTerms(false)}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
}
