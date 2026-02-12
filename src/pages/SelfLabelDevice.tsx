import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getQuoteDraft, updateOsDraft } from "@/lib/storage";
import { formatBRL } from "@/lib/money";
import { AlertCircle, Camera, X } from "lucide-react";

const STEPS = ["Dados", "Aparelho", "Confirmação"];
const DEVICE_TYPES = ["Celular", "Tablet", "Notebook", "Outro"];
const ACCESSORIES = [
  "Carregador", "Cabo USB", "Fone de ouvido", "Capa protetora",
  "Película", "Cartão de memória", "Chip SIM",
];

export default function SelfLabelDevice() {
  const navigate = useNavigate();
  const quote = getQuoteDraft();

  const defaultProblem = quote
    ? quote.services.map((s) => `${s.label} — ${formatBRL(s.priceCents)}`).join("; ")
    : "";

  const [deviceType, setDeviceType] = useState("Celular");
  const [brand, setBrand] = useState(quote?.brandName || "");
  const [valueCents, setValueCents] = useState("");
  const [problem, setProblem] = useState(defaultProblem);
  const [accessories, setAccessories] = useState<Set<string>>(new Set());
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  if (!quote) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Aparelho" backTo="/envio/etiqueta-propria/dados" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">Nenhum orçamento encontrado.</p>
          <Button variant="outline" onClick={() => navigate("/orcamento")}>Voltar</Button>
        </div>
      </div>
    );
  }

  const toggleAcc = (a: string) => {
    setAccessories((prev) => {
      const next = new Set(prev);
      next.has(a) ? next.delete(a) : next.add(a);
      return next;
    });
  };

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - photos.length;
    const toAdd = files.slice(0, remaining);
    setPhotos((p) => [...p, ...toAdd]);
    setPreviews((p) => [...p, ...toAdd.map((f) => URL.createObjectURL(f))]);
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
    updateOsDraft({
      deviceType,
      deviceBrand: brand,
      deviceValueCents: Math.round(parseFloat(valueCents.replace(",", ".")) * 100) || 0,
      problem,
      accessories: Array.from(accessories),
      photoCount: photos.length,
    });
    navigate("/envio/etiqueta-propria/confirmacao");
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHeader title="Aparelho" backTo="/envio/etiqueta-propria/dados" />
      <Stepper steps={STEPS} current={1} />

      <main className="px-4 py-4 max-w-lg mx-auto space-y-5">
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h3 className="font-semibold text-base">Dados do aparelho</h3>

          <div className="space-y-1">
            <Label>Tipo do aparelho *</Label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
            >
              {DEVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Marca</Label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Valor do aparelho (R$) *</Label>
            <Input
              value={valueCents}
              onChange={(e) => { setValueCents(e.target.value); setErrors((p) => ({ ...p, valueCents: false })); }}
              placeholder="Ex: 2500,00"
              className={errors.valueCents ? "border-destructive" : ""}
            />
          </div>

          <div className="space-y-1">
            <Label>Problema relatado *</Label>
            <textarea
              value={problem}
              onChange={(e) => { setProblem(e.target.value); setErrors((p) => ({ ...p, problem: false })); }}
              rows={3}
              className={`flex w-full rounded-md border bg-background px-3 py-2 text-sm ${errors.problem ? "border-destructive" : "border-input"}`}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-base">Acessórios enviados junto</h3>
          <div className="flex flex-wrap gap-2">
            {ACCESSORIES.map((a) => (
              <button
                key={a}
                onClick={() => toggleAcc(a)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  accessories.has(a)
                    ? "bg-whatsapp/10 border-whatsapp text-whatsapp"
                    : "bg-secondary border-border text-muted-foreground"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-base">
            Fotos do aparelho * <span className="text-muted-foreground font-normal text-sm">({photos.length}/5)</span>
          </h3>
          {errors.photos && (
            <p className="text-sm text-destructive">Envie pelo menos 2 fotos.</p>
          )}
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-foreground/30 transition-colors">
                <Camera className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground mt-1">Adicionar</span>
                <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t px-4 py-4">
        <div className="max-w-lg mx-auto">
          <Button size="lg" className="w-full text-base" onClick={handleContinue}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
