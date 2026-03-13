import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/money";
import { setQuoteDraft } from "@/lib/storage";
import { AlertCircle, ArrowLeft, ArrowRight, Pencil, Smartphone } from "lucide-react";
import { GuaranteeTermsModal } from "@/components/GuaranteeTermsModal";
import { TechHeader } from "@/components/TechHeader";

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
        <TechHeader />
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
    <div className="min-h-screen pb-40 relative overflow-hidden" style={{ background: '#0d0d0d' }}>
      {/* Orange glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-80px',
          right: '-80px',
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Header with logo */}
      <TechHeader />

      {/* Subheader with back arrow + title */}
      <div
        className="sticky top-[90px] z-10 px-4 py-3"
        style={{ background: '#161616', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
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
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: 'white',
            }}
          >
            Revisão do orçamento
          </h1>
        </div>
      </div>

      <main className="px-4 py-6 max-w-lg mx-auto relative z-[1]">
        {/* Pill "PASSO FINAL" */}
        <div className="flex justify-center mb-5">
          <span
            className="inline-flex items-center gap-1.5"
            style={{
              background: 'rgba(255,107,0,0.12)',
              border: '1px solid rgba(255,107,0,0.3)',
              borderRadius: '99px',
              padding: '4px 12px',
              fontSize: '10px',
              fontWeight: 700,
              color: '#FF6B00',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6B00', display: 'inline-block' }} />
            Passo final
          </span>
        </div>

        {/* Device section */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 48,
              height: 48,
              background: 'rgba(255,107,0,0.1)',
              border: '1px solid rgba(255,107,0,0.3)',
              borderRadius: 12,
            }}
          >
            <Smartphone className="w-5 h-5" style={{ color: '#FF6B00' }} />
          </div>
          <div>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '20px', color: 'white', lineHeight: 1.2 }}>
              {modelName}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>
              {brandName}
            </p>
          </div>
        </div>

        {/* Services label */}
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'rgba(255,255,255,0.25)',
            marginBottom: '10px',
          }}
        >
          Serviços selecionados
        </p>

        {/* Service cards */}
        {services.map((s) => (
          <div
            key={s.id}
            className="flex justify-between items-center"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '0.5px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
              {s.label}
            </span>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '15px', color: 'white' }}>
              {formatBRL(s.priceCents)}
            </span>
          </div>
        ))}

        {/* Spacer */}
        <div style={{ height: 18 }} />

        {/* Total card */}
        <div
          className="flex justify-between items-center"
          style={{
            background: 'rgba(255,107,0,0.06)',
            border: '1px solid rgba(255,107,0,0.2)',
            borderRadius: '14px',
            padding: '18px 16px',
          }}
        >
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
              Total estimado
            </p>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '40px', color: '#FF6B00', lineHeight: 1.1 }}>
              {formatBRL(totalCents)}
            </p>
          </div>
          <div className="text-right">
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
              {services.length} {services.length === 1 ? 'serviço' : 'serviços'}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'rgba(255,107,0,0.5)' }}>
              Base estimada
            </p>
          </div>
        </div>

        {/* Notice */}
        <div
          className="flex items-center gap-1.5"
          style={{
            marginTop: 14,
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.02)',
            border: '0.5px solid rgba(255,255,255,0.05)',
            borderRadius: 8,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 400, color: 'rgba(255,255,255,0.25)' }}>
            Confirmação final após avaliação presencial do aparelho
          </span>
        </div>
      </main>

      {/* Fixed bottom bar — kept exactly as before */}
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
