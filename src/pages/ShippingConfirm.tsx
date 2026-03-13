import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { getQuoteDraft, getShippingDraft } from "@/lib/storage";
import { formatBRL } from "@/lib/money";
import { AlertCircle, Check } from "lucide-react";

const STEPS = ["Dados Pessoais", "Aparelho", "Confirmação"];

export default function ShippingConfirm() {
  const navigate = useNavigate();
  const quote = getQuoteDraft();
  const draft = getShippingDraft();
  const [agreed, setAgreed] = useState(false);

  if (!quote) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Confirmação" backTo="/envio/aparelho" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">Nenhum orçamento encontrado.</p>
          <Button variant="outline" onClick={() => navigate("/orcamento")}>Voltar</Button>
        </div>
      </div>
    );
  }

  const device = draft.devices?.[0];

  const handleContinue = () => {
    if (draft.shippingMethod === "self_label") {
      navigate("/envio/frete");
    } else {
      navigate("/envio/frete");
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '18px 16px',
    marginBottom: '12px',
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0d0d0d' }}>
      {/* Glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-60px', right: '-60px', width: '240px', height: '240px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)',
        }}
      />

      <PageHeader title="Confirmação" backTo="/envio/aparelho" />

      {/* Stepper */}
      <div className="flex items-center justify-center gap-0 px-4 py-4">
        {STEPS.map((label, i) => {
          const done = i < 2;
          const active = i === 2;
          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="flex items-center justify-center rounded-full font-['Montserrat'] font-extrabold text-[13px]"
                  style={{
                    width: '32px', height: '32px',
                    background: done || active ? '#FF6B00' : 'rgba(255,255,255,0.06)',
                    border: done || active ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    color: done || active ? 'white' : 'rgba(255,255,255,0.3)',
                    boxShadow: active ? '0 0 16px rgba(255,107,0,0.5)' : 'none',
                  }}
                >
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className="font-['Inter'] font-semibold text-[10px] uppercase text-center max-w-[64px]"
                  style={{
                    color: active ? '#FF6B00' : done ? 'rgba(255,107,0,0.6)' : 'rgba(255,255,255,0.25)',
                    fontWeight: active ? 800 : 600,
                  }}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="mx-2 mb-5"
                  style={{
                    width: '48px', height: '1px',
                    background: done ? '#FF6B00' : 'rgba(255,255,255,0.08)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <main className="px-4 py-2 max-w-lg mx-auto relative z-10" style={{ paddingBottom: '100px' }}>
        {/* Dados Pessoais */}
        <div style={cardStyle} className="space-y-3">
          <div className="flex items-center gap-2">
            <div style={{ width: '3px', height: '14px', background: '#FF6B00', borderRadius: '99px' }} />
            <h3 className="font-['Montserrat'] font-extrabold text-[12px] uppercase tracking-[2px]" style={{ color: '#FF6B00' }}>
              Dados Pessoais
            </h3>
          </div>
          <p className="font-['Montserrat'] font-bold text-[16px] text-white">{draft.fullName}</p>
          <div className="space-y-1">
            <p className="font-['Inter'] text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>CPF </span>{draft.cpf}
            </p>
            <p className="font-['Inter'] text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Tel </span>{draft.phone}
            </p>
            <p className="font-['Inter'] text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Email </span>{draft.email}
            </p>
          </div>
        </div>

        {/* Endereço */}
        <div style={cardStyle} className="space-y-2">
          <div className="flex items-center gap-2">
            <div style={{ width: '3px', height: '14px', background: '#FF6B00', borderRadius: '99px' }} />
            <h3 className="font-['Montserrat'] font-extrabold text-[12px] uppercase tracking-[2px]" style={{ color: '#FF6B00' }}>
              Endereço
            </h3>
          </div>
          <p className="font-['Montserrat'] font-bold text-[15px] text-white">
            {draft.street}, {draft.number}
            {draft.complement ? ` - ${draft.complement}` : ""}
          </p>
          <p className="font-['Inter'] text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {draft.district} — {draft.city}/{draft.uf}
          </p>
          <p className="font-['Inter'] text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            CEP: {draft.cep}
          </p>
        </div>

        {/* Aparelho */}
        {device && (
          <div style={cardStyle} className="space-y-2">
            <div className="flex items-center gap-2">
              <div style={{ width: '3px', height: '14px', background: '#FF6B00', borderRadius: '99px' }} />
              <h3 className="font-['Montserrat'] font-extrabold text-[12px] uppercase tracking-[2px]" style={{ color: '#FF6B00' }}>
                Aparelho
              </h3>
            </div>
            <p className="font-['Montserrat'] font-bold text-[15px] text-white">
              {device.type} — {device.brand}
            </p>
            <div className="space-y-1">
              <p className="font-['Inter'] text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Valor declarado </span>
                {formatBRL(device.valueCents)}
              </p>
              <p className="font-['Inter'] text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Problema </span>
                {device.problem}
              </p>
              {device.accessories.length > 0 && (
                <p className="font-['Inter'] text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Acessórios </span>
                  {device.accessories.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Serviços */}
        <div style={cardStyle} className="space-y-0">
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: '3px', height: '14px', background: '#FF6B00', borderRadius: '99px' }} />
            <h3 className="font-['Montserrat'] font-extrabold text-[12px] uppercase tracking-[2px]" style={{ color: '#FF6B00' }}>
              Serviços
            </h3>
          </div>
          {quote.services.map((s) => (
            <div
              key={s.id}
              className="flex justify-between items-center"
              style={{
                padding: '10px 0',
                borderBottom: '0.5px solid rgba(255,255,255,0.05)',
              }}
            >
              <span className="font-['Inter'] font-medium text-[14px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {s.label}
              </span>
              <span className="font-['Montserrat'] font-bold text-[14px] text-white">
                {formatBRL(s.priceCents)}
              </span>
            </div>
          ))}
          <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,107,0,0.2)', paddingTop: '12px' }}>
            <div className="flex justify-between items-center">
              <span className="font-['Montserrat'] font-extrabold text-[12px] uppercase tracking-[1px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Total
              </span>
              <span className="font-['Montserrat'] font-black text-[28px]" style={{ color: '#FF6B00' }}>
                {formatBRL(quote.totalCents)}
              </span>
            </div>
          </div>
        </div>

        {/* Checkbox de declaração */}
        <div className="flex items-start gap-3 px-1 py-2">
          <button
            onClick={() => setAgreed(!agreed)}
            className="shrink-0 flex items-center justify-center transition-colors"
            style={{
              width: '20px', height: '20px', borderRadius: '6px',
              background: agreed ? '#FF6B00' : 'transparent',
              border: `1.5px solid ${agreed ? '#FF6B00' : 'rgba(255,107,0,0.4)'}`,
              marginTop: '2px',
            }}
          >
            {agreed && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
          <span
            onClick={() => setAgreed(!agreed)}
            className="font-['Inter'] text-[13px] cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}
          >
            Declaro que as informações são verdadeiras e concordo com os termos de envio e reparo.
          </span>
        </div>
      </main>

      {/* Botão Continuar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          padding: '16px 16px 32px',
          background: 'linear-gradient(to top, #0d0d0d 60%, transparent)',
        }}
      >
        <div className="max-w-lg mx-auto">
          <Button
            size="lg"
            className="w-full text-base"
            disabled={!agreed}
            onClick={handleContinue}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
