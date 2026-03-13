import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { getQuoteDraft, getShippingDraft, updateShippingDraft } from "@/lib/storage";
import { formatBRL } from "@/lib/money";
import { AlertCircle, Camera, X, Check, Play, TriangleAlert } from "lucide-react";

const STEPS = ["Dados Pessoais", "Aparelho", "Confirmação"];

const DEVICE_TYPES = ["Celular", "Tablet", "Notebook", "Smartwatch", "Outro"];

const ACCESSORIES = [
  "Carregador", "Cabo USB", "Fone de ouvido", "Capa protetora",
  "Película", "Cartão de memória", "Chip SIM",
];

const inputStyle = "w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#111111] px-[14px] py-[12px] text-[14px] font-medium text-[rgba(255,255,255,0.85)] font-['Inter'] placeholder:text-[rgba(255,255,255,0.25)] focus:outline-none focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,107,0,0.04)] transition-colors";
const inputErrorStyle = "border-destructive";
const labelStyle = "font-['Inter'] font-semibold text-[11px] uppercase tracking-[1px] text-[rgba(255,255,255,0.4)] mb-[6px] block";
const hintStyle = "font-['Inter'] font-normal text-[11px] text-[rgba(255,255,255,0.25)] mt-1";

export default function ShippingDevice() {
  const navigate = useNavigate();
  const quote = getQuoteDraft();
  const draft = getShippingDraft();

  const defaultProblem = quote
    ? quote.services.map((s) => `${s.label} — ${formatBRL(s.priceCents)}`).join("; ")
    : "";

  const [deviceType, setDeviceType] = useState("Celular");
  const [brand, setBrand] = useState(quote?.brandName || "");
  const [valueCents, setValueCents] = useState("");
  const [problem, setProblem] = useState(defaultProblem);
  const [accessories, setAccessories] = useState<Set<string>>(new Set());
  const [customAccessories, setCustomAccessories] = useState<string[]>([]);
  const [newAccessory, setNewAccessory] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  if (!quote) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Aparelho" backTo="/envio/dados-pessoais" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">Nenhum orçamento encontrado.</p>
          <Button variant="outline" onClick={() => navigate("/orcamento")}>Voltar</Button>
        </div>
      </div>
    );
  }

  const allAccessories = [...ACCESSORIES, ...customAccessories];

  const toggleAcc = (a: string) => {
    setAccessories((prev) => {
      const next = new Set(prev);
      next.has(a) ? next.delete(a) : next.add(a);
      return next;
    });
  };

  const addCustomAccessory = () => {
    const trimmed = newAccessory.trim();
    if (!trimmed || allAccessories.includes(trimmed)) return;
    setCustomAccessories((prev) => [...prev, trimmed]);
    setNewAccessory("");
  };

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - photos.length;
    const toAdd = files.slice(0, remaining);
    const newPhotos = [...photos, ...toAdd];
    setPhotos(newPhotos);
    const newPreviews = [...previews, ...toAdd.map((f) => URL.createObjectURL(f))];
    setPreviews(newPreviews);
    setErrors((p) => ({ ...p, photos: false }));
  };

  const removePhoto = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setPhotos((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const validate = () => {
    const errs: Record<string, boolean> = {};
    if (!valueCents.trim()) errs.valueCents = true;
    if (!problem.trim()) errs.problem = true;
    if (photos.length < 2) errs.photos = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    updateShippingDraft({
      devices: [{
        type: deviceType,
        brand,
        valueCents: Math.round(parseFloat(valueCents.replace(",", ".")) * 100) || 0,
        problem,
        accessories: Array.from(accessories),
      }],
    });
    navigate("/envio/confirmacao");
  };

  const emptySlots = Math.max(0, 4 - previews.length - (photos.length < 5 ? 1 : 0));

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0d0d0d' }}>
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

      <PageHeader title="Aparelho" backTo="/envio/dados-pessoais" />

      {/* Custom Stepper */}
      <div className="flex items-center justify-center gap-0 px-4 py-4">
        {STEPS.map((label, i) => {
          const done = i < 1;
          const active = i === 1;
          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="flex items-center justify-center rounded-full font-['Montserrat'] font-extrabold text-[13px]"
                  style={{
                    width: '32px',
                    height: '32px',
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
                  }}
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
        {/* Card 1 - Dados do aparelho */}
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
            <h3 className="font-['Montserrat'] font-extrabold text-[12px] uppercase tracking-[2px]" style={{ color: '#FF6B00' }}>
              Dados do Aparelho
            </h3>
          </div>

          <div>
            <label className={labelStyle}>Tipo do aparelho *</label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className={inputStyle}
            >
              {DEVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className={labelStyle}>Marca</label>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} className={inputStyle} />
          </div>

          <div>
            <label className={labelStyle}>Valor do aparelho (R$) *</label>
            <input
              value={valueCents}
              onChange={(e) => { setValueCents(e.target.value); setErrors((p) => ({ ...p, valueCents: false })); }}
              placeholder="Ex: 2500,00"
              className={`${inputStyle} ${errors.valueCents ? inputErrorStyle : ''}`}
            />
            <p className={hintStyle}>Usamos esse valor para o seguro do frete.</p>
          </div>

          <div>
            <label className={labelStyle}>Problema relatado *</label>
            <textarea
              value={problem}
              onChange={(e) => { setProblem(e.target.value); setErrors((p) => ({ ...p, problem: false })); }}
              rows={3}
              className={`${inputStyle} min-h-[80px] ${errors.problem ? inputErrorStyle : ''}`}
            />
          </div>
        </div>

        {/* Card 2 - Acessórios */}
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
            <h3 className="font-['Montserrat'] font-extrabold text-[12px] uppercase tracking-[2px]" style={{ color: '#FF6B00' }}>
              Acessórios Enviados Junto
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {allAccessories.map((a) => {
              const selected = accessories.has(a);
              return (
                <button
                  key={a}
                  onClick={() => toggleAcc(a)}
                  className="flex items-center gap-2 cursor-pointer transition-colors"
                  style={{
                    padding: '10px 12px',
                    background: selected ? 'rgba(255,107,0,0.08)' : '#111',
                    border: `1px solid ${selected ? 'rgba(255,107,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '10px',
                  }}
                >
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      background: selected ? '#FF6B00' : 'transparent',
                      border: selected ? '1.5px solid #FF6B00' : '1.5px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span
                    className="font-['Inter'] font-medium text-[12px] text-left"
                    style={{ color: selected ? 'white' : 'rgba(255,255,255,0.7)' }}
                  >
                    {a}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Adicionar acessório personalizado */}
          <div className="space-y-2 pt-1">
            <span className="font-['Inter'] font-medium text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              + Adicionar outro acessório
            </span>
            <div className="flex gap-2">
              <input
                value={newAccessory}
                onChange={(e) => setNewAccessory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomAccessory()}
                placeholder="Ex: Cabo Lightning..."
                className="flex-1 font-['Inter'] text-[13px] font-medium text-[rgba(255,255,255,0.85)] placeholder:text-[rgba(255,255,255,0.2)]"
                style={{
                  background: '#111',
                  border: '1px solid rgba(255,107,0,0.25)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                }}
              />
              <button
                onClick={addCustomAccessory}
                className="font-['Inter'] font-semibold text-[12px] cursor-pointer shrink-0"
                style={{
                  background: 'rgba(255,107,0,0.15)',
                  border: '1px solid rgba(255,107,0,0.35)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#FF6B00',
                }}
              >
                + Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Card 3 - Fotos */}
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
            <h3 className="font-['Montserrat'] font-extrabold text-[12px] uppercase tracking-[2px]" style={{ color: '#FF6B00' }}>
              Fotos do Aparelho
            </h3>
          </div>

          {errors.photos && (
            <p className="text-sm text-destructive">Envie pelo menos 2 fotos.</p>
          )}

          <div className="grid grid-cols-4 gap-2">
            {/* Slot de adicionar */}
            {photos.length < 5 && (
              <label
                className="flex flex-col items-center justify-center cursor-pointer transition-colors"
                style={{
                  aspectRatio: '1/1',
                  borderRadius: '10px',
                  border: '1.5px dashed rgba(255,107,0,0.3)',
                  background: 'rgba(255,107,0,0.04)',
                }}
              >
                <Camera className="w-5 h-5" style={{ color: 'rgba(255,107,0,0.5)' }} />
                <span className="font-['Inter'] text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Adicionar
                </span>
                <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
              </label>
            )}

            {/* Fotos adicionadas */}
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative overflow-hidden"
                style={{
                  aspectRatio: '1/1',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 rounded-full p-0.5"
                  style={{ background: 'rgba(0,0,0,0.7)' }}
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}

            {/* Slots vazios */}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  aspectRatio: '1/1',
                  borderRadius: '10px',
                  border: '1.5px dashed rgba(255,255,255,0.07)',
                  background: '#111',
                }}
              />
            ))}
          </div>

          <p className={hintStyle}>
            {photos.length} de 5 fotos adicionadas
          </p>
        </div>
      </main>

      {/* Botão Continuar - mantido como está */}
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
