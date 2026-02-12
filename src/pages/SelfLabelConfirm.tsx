import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getQuoteDraft, getOsDraft, setOsRecord, generateOsCode } from "@/lib/storage";
import { formatBRL } from "@/lib/money";
import { AlertCircle } from "lucide-react";

const STEPS = ["Dados", "Aparelho", "Confirmação"];

export default function SelfLabelConfirm() {
  const navigate = useNavigate();
  const quote = getQuoteDraft();
  const draft = getOsDraft();
  const [agreed, setAgreed] = useState(false);

  if (!quote) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Confirmação" backTo="/envio/etiqueta-propria/aparelho" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">Nenhum orçamento encontrado.</p>
          <Button variant="outline" onClick={() => navigate("/orcamento")}>Voltar</Button>
        </div>
      </div>
    );
  }

  const handleGenerate = () => {
    const osCode = generateOsCode();
    setOsRecord({
      osCode,
      brandName: quote.brandName,
      modelName: quote.modelName,
      services: quote.services,
      totalCents: quote.totalCents,
      client: draft,
      createdAt: new Date().toISOString(),
    });
    navigate("/envio/etiqueta-propria/sucesso");
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHeader title="Confirmação" backTo="/envio/etiqueta-propria/aparelho" />
      <Stepper steps={STEPS} current={2} />

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Personal data */}
        <div className="rounded-xl border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">👤 Dados Pessoais</h3>
          <p className="text-sm">{draft.fullName}</p>
          <p className="text-sm text-muted-foreground">CPF: {draft.cpf}</p>
          <p className="text-sm text-muted-foreground">Tel: {draft.phone}</p>
          <p className="text-sm text-muted-foreground">{draft.email}</p>
        </div>

        {/* Address */}
        <div className="rounded-xl border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">📍 Endereço</h3>
          <p className="text-sm">
            {draft.street}, {draft.number}
            {draft.complement ? ` - ${draft.complement}` : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            {draft.district} — {draft.city}/{draft.uf}
          </p>
          <p className="text-sm text-muted-foreground">CEP: {draft.cep}</p>
        </div>

        {/* Device */}
        <div className="rounded-xl border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">📱 Aparelho</h3>
          <p className="text-sm">{draft.deviceType} — {draft.deviceBrand}</p>
          <p className="text-sm text-muted-foreground">
            Valor declarado: {formatBRL(draft.deviceValueCents || 0)}
          </p>
          <p className="text-sm text-muted-foreground">Problema: {draft.problem}</p>
          {draft.accessories && draft.accessories.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Acessórios: {draft.accessories.join(", ")}
            </p>
          )}
          {draft.photoCount && (
            <p className="text-sm text-muted-foreground">
              Fotos enviadas: {draft.photoCount}
            </p>
          )}
        </div>

        {/* Services */}
        <div className="rounded-xl border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">🔧 Serviços</h3>
          {quote.services.map((s) => (
            <div key={s.id} className="flex justify-between text-sm">
              <span>• {s.label}</span>
              <span className="text-muted-foreground">{formatBRL(s.priceCents)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatBRL(quote.totalCents)}</span>
          </div>
        </div>

        {/* Agree */}
        <div className="flex items-start gap-3 px-1 py-2">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(v) => setAgreed(v === true)}
          />
          <label htmlFor="agree" className="text-sm text-muted-foreground leading-snug cursor-pointer">
            Declaro que as informações são verdadeiras e concordo com os termos de serviço.
          </label>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t px-4 py-4">
        <div className="max-w-lg mx-auto">
          <Button
            size="lg"
            className="w-full text-base"
            disabled={!agreed}
            onClick={handleGenerate}
          >
            Gerar Ordem de Serviço
          </Button>
        </div>
      </div>
    </div>
  );
}
