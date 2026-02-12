import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOsDraft, updateOsDraft, getQuoteDraft } from "@/lib/storage";
import { AlertCircle } from "lucide-react";

const STEPS = ["Dados", "Aparelho", "Confirmação"];

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

export default function SelfLabelPersonal() {
  const navigate = useNavigate();
  const quote = getQuoteDraft();
  const draft = getOsDraft();

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
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Dados Pessoais" backTo="/envio" />
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">Nenhum orçamento encontrado. Volte e selecione os serviços.</p>
          <Button variant="outline" onClick={() => navigate("/orcamento")}>Voltar</Button>
        </div>
      </div>
    );
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
    updateOsDraft(form);
    navigate("/envio/etiqueta-propria/aparelho");
  };

  const inputClass = (field: string) => errors[field] ? "border-destructive" : "";

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHeader title="Dados Pessoais" backTo="/envio" />
      <Stepper steps={STEPS} current={0} />

      <main className="px-4 py-4 max-w-lg mx-auto space-y-5">
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h3 className="font-semibold text-base">Dados pessoais</h3>

          <div className="space-y-1">
            <Label htmlFor="fullName">Nome completo *</Label>
            <Input id="fullName" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputClass("fullName")} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cpf">CPF *</Label>
            <Input id="cpf" value={form.cpf} onChange={(e) => set("cpf", maskCPF(e.target.value))} className={inputClass("cpf")} placeholder="000.000.000-00" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone">Telefone (WhatsApp) *</Label>
            <Input id="phone" value={form.phone} onChange={(e) => set("phone", maskPhone(e.target.value))} className={inputClass("phone")} placeholder="(00) 00000-0000" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">E-mail *</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass("email")} />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h3 className="font-semibold text-base">Endereço</h3>

          <div className="space-y-1">
            <Label htmlFor="cep">CEP *</Label>
            <Input id="cep" value={form.cep} onChange={(e) => set("cep", maskCEP(e.target.value))} className={inputClass("cep")} placeholder="00000-000" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="street">Rua *</Label>
            <Input id="street" value={form.street} onChange={(e) => set("street", e.target.value)} className={inputClass("street")} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="number">Número *</Label>
              <Input id="number" value={form.number} onChange={(e) => set("number", e.target.value)} className={inputClass("number")} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" value={form.complement} onChange={(e) => set("complement", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="district">Bairro *</Label>
            <Input id="district" value={form.district} onChange={(e) => set("district", e.target.value)} className={inputClass("district")} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="city">Cidade *</Label>
              <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass("city")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="uf">UF *</Label>
              <select
                id="uf"
                value={form.uf}
                onChange={(e) => set("uf", e.target.value)}
                className={`flex h-10 w-full rounded-md border bg-background px-2 py-2 text-sm ${errors.uf ? "border-destructive" : "border-input"}`}
              >
                <option value="">UF</option>
                {BR_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
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
