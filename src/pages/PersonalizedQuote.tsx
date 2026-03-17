import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, ArrowLeft } from "lucide-react";

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#111111",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: "12px 14px",
  fontFamily: "var(--font-body)",
  fontWeight: 500,
  fontSize: 14,
  color: "rgba(255,255,255,0.85)",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontWeight: 600,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "rgba(255,255,255,0.4)",
  marginBottom: 6,
  display: "block",
};

export default function PersonalizedQuote() {
  const navigate = useNavigate();
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

  const [errors, setErrors] = useState<{ nome?: boolean; modelo?: boolean; problema?: boolean }>({});

  const handleSend = () => {
    const newErrors = {
      nome: !nome.trim(),
      modelo: !modelo.trim(),
      problema: !problema.trim(),
    };
    setErrors(newErrors);

    if (newErrors.nome || newErrors.modelo || newErrors.problema) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    const mensagem = `🔧 *ORÇAMENTO PERSONALIZADO — POWER CELL*

👤 *Cliente:* ${nome.trim()}
📱 *Aparelho/Modelo:* ${modelo.trim()}
🔍 *Problema relatado:* ${problema.trim()}

📍 *Localização:*
- Cidade: ${cidade.trim() || 'Não informado'}
- UF: ${uf || 'Não informado'}
- CEP: ${cep.trim() || 'Não informado'}

⚡ *Urgência:* ${urgencia || 'Não informado'}
💧 *Caiu na água?* ${agua || 'Não informado'}
🔌 *Liga?* ${liga || 'Não informado'}

_Mensagem enviada pelo app Power Cell_`;

    const url = `https://wa.me/553198562010?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const errorBorder = "1px solid rgba(255,80,80,0.5)";

  const toggleBtn = (current: string, value: string, setter: (v: string) => void) => {
    const active = current === value;
    return (
      <button
        key={value}
        onClick={() => setter(active ? "" : value)}
        className="flex-1 transition-all"
        style={{
          background: active ? "rgba(255,107,0,0.12)" : "#111",
          border: active ? "1px solid rgba(255,107,0,0.45)" : "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: "10px 16px",
          fontFamily: "var(--font-body)",
          fontWeight: active ? 700 : 600,
          fontSize: 13,
          color: active ? "#FF6B00" : "rgba(255,255,255,0.35)",
          cursor: "pointer",
        }}
      >
        {value}
      </button>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#0d0d0d" }}>
      {/* Glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -60, right: -60, width: 240, height: 240,
          background: "radial-gradient(circle, rgba(255,107,0,0.15), transparent 70%)",
        }}
      />

      {/* Subheader */}
      <div
        className="sticky top-[90px] z-20"
        style={{
          background: "#161616",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/orcamento")} className="p-1" style={{ color: "#FF6B00" }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: "white",
                margin: 0,
              }}
            >
              Orçamento Personalizado
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                margin: 0,
              }}
            >
              Preencha os dados abaixo
            </p>
          </div>
        </div>
      </div>

      <main className="relative z-10 px-4 py-5 max-w-lg mx-auto space-y-4" style={{ paddingBottom: 120 }}>
        {/* Card 1 — Dados Principais */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "0.5px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: "18px 16px",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 3, height: 14, background: "#FF6B00", borderRadius: 99 }} />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: "#FF6B00",
              }}
            >
              Dados Principais
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label style={labelStyle}>
                Nome completo <span style={{ color: "#FF6B00" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{ ...inputStyle, ...(errors.nome ? { border: errorBorder } : {}) }}
                className="focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,107,0,0.04)]"
              />
            </div>

            <div>
              <label style={labelStyle}>
                Modelo do aparelho <span style={{ color: "#FF6B00" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: iPhone 15 Pro"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                style={{ ...inputStyle, ...(errors.modelo ? { border: errorBorder } : {}) }}
                className="focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,107,0,0.04)]"
              />
            </div>

            <div>
              <label style={labelStyle}>
                O que o aparelho está tendo <span style={{ color: "#FF6B00" }}>*</span>
              </label>
              <textarea
                placeholder="Descreva o problema..."
                value={problema}
                onChange={(e) => setProblema(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "none" as const, ...(errors.problema ? { border: errorBorder } : {}) }}
                className="focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,107,0,0.04)]"
              />
            </div>
          </div>
        </div>

        {/* Divider — Campos opcionais */}
        <div className="flex items-center gap-2.5" style={{ margin: "4px 0" }}>
          <div className="flex-1" style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 12,
              color: "rgba(255,255,255,0.2)",
            }}
          >
            Campos opcionais
          </span>
          <div className="flex-1" style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Card 2 — Informações Adicionais */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "0.5px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: "18px 16px",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 3, height: 14, background: "#FF6B00", borderRadius: 99 }} />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: "#FF6B00",
              }}
            >
              Informações Adicionais
            </span>
          </div>

          <div className="space-y-3">
            {/* Cidade + UF */}
            <div className="grid gap-2.5" style={{ gridTemplateColumns: "2fr 1fr" }}>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input
                  type="text"
                  placeholder="Cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  style={inputStyle}
                  className="focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,107,0,0.04)]"
                />
              </div>
              <div>
                <label style={labelStyle}>UF</label>
                <select
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  style={inputStyle}
                  className="focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,107,0,0.04)]"
                >
                  <option value="">Selecione</option>
                  {UF_LIST.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* CEP */}
            <div>
              <label style={labelStyle}>CEP</label>
              <input
                type="text"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(formatCep(e.target.value))}
                style={inputStyle}
                className="focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,107,0,0.04)]"
                inputMode="numeric"
              />
            </div>

            {/* Urgência */}
            <div>
              <label style={labelStyle}>Urgência</label>
              <div className="flex gap-2">
                {["Baixa", "Média", "Alta"].map((u) => toggleBtn(urgencia, u, setUrgencia))}
              </div>
            </div>

            {/* Caiu na água + Liga */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label style={labelStyle}>Caiu na água?</label>
                <div className="flex gap-2">
                  {["Sim", "Não"].map((v) => toggleBtn(agua, v, setAgua))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Liga?</label>
                <div className="flex gap-2">
                  {["Sim", "Não"].map((v) => toggleBtn(liga, v, setLiga))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50" style={{ padding: "16px 16px 32px", background: "linear-gradient(to top, #0d0d0d 60%, transparent)" }}>
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
