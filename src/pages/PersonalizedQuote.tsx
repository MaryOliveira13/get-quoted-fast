import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { openWhatsApp, msgOrcamentoPersonalizado } from "@/lib/whatsapp";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

export default function PersonalizedQuote() {
  const [params] = useSearchParams();
  const prefillBrand = params.get("brand") ?? "";
  const prefillModel = params.get("model") ?? "";

  const [nome, setNome] = useState("");
  const [modelo, setModelo] = useState(prefillModel || (prefillBrand ? `(${prefillBrand})` : ""));
  const [problema, setProblema] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [cep, setCep] = useState("");
  const [urgencia, setUrgencia] = useState("");
  const [agua, setAgua] = useState("");
  const [liga, setLiga] = useState("");

  const isValid = nome.trim() && modelo.trim() && problema.trim();

  const handleSend = () => {
    const msg = msgOrcamentoPersonalizado({
      nome: nome.trim(),
      modelo: modelo.trim(),
      marca: prefillBrand,
      problema: problema.trim(),
      cidade: cidade.trim() || undefined,
      uf: uf || undefined,
      cep: cep.trim() || undefined,
      urgencia: urgencia || undefined,
      agua: agua || undefined,
      liga: liga || undefined,
    });
    openWhatsApp(msg);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-card border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "block text-sm font-medium mb-1.5";

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHeader
        title="Orçamento Personalizado"
        subtitle="Preencha os dados abaixo"
        backTo="/orcamento"
      />

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Required fields */}
        <div>
          <label className={labelClass}>
            Nome completo <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            Modelo do aparelho <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: iPhone 15 Pro"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            O que o aparelho está tendo <span className="text-destructive">*</span>
          </label>
          <textarea
            placeholder="Descreva o problema..."
            value={problema}
            onChange={(e) => setProblema(e.target.value)}
            rows={3}
            className={inputClass + " resize-none"}
          />
        </div>

        {/* Optional fields */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-3">Campos opcionais</p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelClass}>Cidade</label>
              <input
                type="text"
                placeholder="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>UF</label>
              <select
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                className={inputClass}
              >
                <option value="">Selecione</option>
                {UF_LIST.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className={labelClass}>CEP</label>
            <input
              type="text"
              placeholder="00000-000"
              value={cep}
              onChange={(e) => setCep(formatCep(e.target.value))}
              className={inputClass}
              inputMode="numeric"
            />
          </div>

          <div className="mb-3">
            <label className={labelClass}>Urgência</label>
            <div className="flex gap-2">
              {["Baixa", "Média", "Alta"].map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgencia(urgencia === u ? "" : u)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    urgencia === u
                      ? "bg-whatsapp/10 border-whatsapp text-foreground"
                      : "bg-card border-border text-muted-foreground hover:border-foreground/20"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Caiu na água?</label>
              <div className="flex gap-2">
                {["Sim", "Não"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAgua(agua === v ? "" : v)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      agua === v
                        ? "bg-whatsapp/10 border-whatsapp text-foreground"
                        : "bg-card border-border text-muted-foreground hover:border-foreground/20"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Liga?</label>
              <div className="flex gap-2">
                {["Sim", "Não"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setLiga(liga === v ? "" : v)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      liga === v
                        ? "bg-whatsapp/10 border-whatsapp text-foreground"
                        : "bg-card border-border text-muted-foreground hover:border-foreground/20"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t px-4 py-4">
        <div className="max-w-lg mx-auto">
          <Button
            variant="whatsapp"
            size="lg"
            className="w-full text-base"
            disabled={!isValid}
            onClick={handleSend}
          >
            <MessageCircle className="w-5 h-5" />
            Enviar relatório para WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
