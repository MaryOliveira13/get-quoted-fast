import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getShippingDraft, updateShippingDraft, getQuoteDraft } from "@/lib/storage";
import { AlertCircle, ArrowLeft } from "lucide-react";

const STEPS = ["Dados Pessoais", "Aparelho", "Confirmação"];

const BR_STATES = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA",
  "PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

function maskCPF(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function maskCEP(v: string) {
  return v.replace(/\D/g, "").slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export default function ShippingPersonal() {
  const navigate = useNavigate();
  const quote = getQuoteDraft();
  const draft = getShippingDraft();

  const [form, setForm] = useState({
    fullName: draft.fullName || "",
    cpf: draft.cpf || "",
    phone: draft.phone || "",
    email: draft.email || "",
    cep: draft.cep || "",
    street: draft.street || "",
    number: draft.number || "",
    complement: draft.complement || "",
    district: draft.district || "",
    city: draft.city || "",
    uf: draft.uf || "",
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  if (!quote) {
    return <Navigate to="/" replace />;
  }

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: false }));
  };

  const required = ["fullName", "cpf", "phone", "email", "cep", "street", "number", "district", "city", "uf"];

  const validate = () => {
    const errs: Record<string, boolean> = {};
    required.forEach((k) => {
      if (!(form as any)[k]?.trim()) errs[k] = true;
    });
    if (form.cpf.replace(/\D/g, "").length !== 11) errs.cpf = true;
    if (form.phone.replace(/\D/g, "").length < 10) errs.phone = true;
    if (!form.email.includes("@")) errs.email = true;
    if (form.cep.replace(/\D/g, "").length !== 8) errs.cep = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    updateShippingDraft(form);
    navigate("/envio/aparelho");
  };

  const inputStyle = "w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#111111] px-[14px] py-[12px] text-[14px] font-medium text-[rgba(255,255,255,0.85)] font-['Inter'] placeholder:text-[rgba(255,255,255,0.25)] focus:outline-none focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,107,0,0.04)] transition-colors";

  const inputErrorStyle = "border-destructive";

  const labelStyle = "font-['Inter'] font-semibold text-[11px] uppercase tracking-[1px] text-[rgba(255,255,255,0.4)] mb-[6px] block";

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden" style={{ background: '#0d0d0d' }}>
      {/* Glow decorativo */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-60px',
          right: '-60px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)',
        }}
      />

      {/* PageHeader removed because TechHeader is already present globally */}
      
      <div className="max-w-lg mx-auto px-4 pt-4">
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="p-2 -ml-2 rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px] text-[rgba(255,255,255,0.8)]"
          aria-label="Voltar para a página inicial"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Custom Stepper */}
      <div className="flex items-center justify-center gap-0 px-4 py-2">
        {STEPS.map((label, i) => {
          const active = i === 0;
          const done = i < 0;
          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="flex items-center justify-center rounded-full font-['Montserrat'] font-extrabold text-[13px]"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: active ? '#FF6B00' : 'rgba(255,255,255,0.06)',
                    border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    color: active ? 'white' : 'rgba(255,255,255,0.3)',
                    boxShadow: active ? '0 0 16px rgba(255,107,0,0.5)' : 'none',
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="font-['Inter'] font-semibold text-[10px] uppercase text-center max-w-[64px]"
                  style={{ color: active ? '#FF6B00' : 'rgba(255,255,255,0.25)' }}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="mx-2 mb-5"
                  style={{
                    width: '48px',
                    height: '1px',
                    background: done ? '#FF6B00' : 'rgba(255,255,255,0.08)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <main className="px-4 py-2 max-w-lg mx-auto space-y-5 relative z-10" style={{ paddingBottom: '100px' }}>
        {/* Card 1 - Dados Pessoais */}
        <div
          className="space-y-4"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '0.5px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            padding: '18px 16px',
          }}
        >
          <div className="flex items-center gap-2">
            <div style={{ width: '3px', height: '14px', background: '#FF6B00', borderRadius: '99px' }} />
            <h3 className="font-['Montserrat'] font-extrabold text-[12px] uppercase tracking-[2px] text-primary">
              Dados Pessoais
            </h3>
          </div>

          <div>
            <label htmlFor="fullName" className={labelStyle}>Nome completo *</label>
            <input id="fullName" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={`${inputStyle} ${errors.fullName ? inputErrorStyle : ''}`} />
          </div>

          <div>
            <label htmlFor="cpf" className={labelStyle}>CPF *</label>
            <input id="cpf" value={form.cpf} onChange={(e) => set("cpf", maskCPF(e.target.value))} className={`${inputStyle} ${errors.cpf ? inputErrorStyle : ''}`} placeholder="000.000.000-00" />
          </div>

          <div>
            <label htmlFor="phone" className={labelStyle}>Telefone (WhatsApp) *</label>
            <input id="phone" value={form.phone} onChange={(e) => set("phone", maskPhone(e.target.value))} className={`${inputStyle} ${errors.phone ? inputErrorStyle : ''}`} placeholder="(00) 00000-0000" />
          </div>

          <div>
            <label htmlFor="email" className={labelStyle}>E-mail *</label>
            <input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={`${inputStyle} ${errors.email ? inputErrorStyle : ''}`} />
          </div>
        </div>

        {/* Card 2 - Endereço */}
        <div
          className="space-y-4"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '0.5px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            padding: '18px 16px',
          }}
        >
          <div className="flex items-center gap-2">
            <div style={{ width: '3px', height: '14px', background: '#FF6B00', borderRadius: '99px' }} />
            <h3 className="font-['Montserrat'] font-extrabold text-[12px] uppercase tracking-[2px] text-primary">
              Endereço
            </h3>
          </div>

          <div>
            <label htmlFor="cep" className={labelStyle}>CEP *</label>
            <input id="cep" value={form.cep} onChange={(e) => set("cep", maskCEP(e.target.value))} className={`${inputStyle} ${errors.cep ? inputErrorStyle : ''}`} placeholder="00000-000" />
          </div>

          <div>
            <label htmlFor="street" className={labelStyle}>Rua *</label>
            <input id="street" value={form.street} onChange={(e) => set("street", e.target.value)} className={`${inputStyle} ${errors.street ? inputErrorStyle : ''}`} />
          </div>

          <div className="grid grid-cols-2 gap-[10px]">
            <div>
              <label htmlFor="number" className={labelStyle}>Número *</label>
              <input id="number" value={form.number} onChange={(e) => set("number", e.target.value)} className={`${inputStyle} ${errors.number ? inputErrorStyle : ''}`} />
            </div>
            <div>
              <label htmlFor="complement" className={labelStyle}>Complemento</label>
              <input id="complement" value={form.complement} onChange={(e) => set("complement", e.target.value)} className={inputStyle} />
            </div>
          </div>

          <div>
            <label htmlFor="district" className={labelStyle}>Bairro *</label>
            <input id="district" value={form.district} onChange={(e) => set("district", e.target.value)} className={`${inputStyle} ${errors.district ? inputErrorStyle : ''}`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
            <div>
              <label htmlFor="city" className={labelStyle}>Cidade *</label>
              <input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} className={`${inputStyle} ${errors.city ? inputErrorStyle : ''}`} />
            </div>
            <div>
              <label htmlFor="uf" className={labelStyle}>UF *</label>
              <select
                id="uf"
                value={form.uf}
                onChange={(e) => set("uf", e.target.value)}
                className={`${inputStyle} ${errors.uf ? inputErrorStyle : ''}`}
              >
                <option value="">UF</option>
                {BR_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </main>

      <div 
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{ 
          padding: '16px 16px 32px',
          background: 'linear-gradient(to top, #0d0d0d 60%, transparent)',
        }}
      >
        <div className="max-w-lg mx-auto">
          <Button size="lg" className="w-full text-base" onClick={handleContinue}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
