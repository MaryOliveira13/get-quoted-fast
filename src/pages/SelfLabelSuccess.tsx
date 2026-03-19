import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Download, MessageSquare } from "lucide-react";
import { formatBRL } from "@/lib/money";
import { STORE_SHIPPING_ADDRESS } from "@/config/store";
import jsPDF from "jspdf";
import QRCode from "react-qr-code";
import { createRoot } from "react-dom/client";

interface LastPedido {
  id: string;
  codigo: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  marca: string;
  modelo: string;
  servico: string;
  valor: number;
  acessorios: string;
  problema: string;
}

export default function SelfLabelSuccess() {
  const navigate = useNavigate();

  let pedido: LastPedido | null = null;
  try {
    const raw = localStorage.getItem("lastPedido");
    pedido = raw ? JSON.parse(raw) : null;
  } catch {
    pedido = null;
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center px-4 py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg font-semibold text-center">Nenhum pedido encontrado.</p>
          <Button variant="outline" onClick={() => navigate("/orcamento")}>Voltar</Button>
        </div>
      </div>
    );
  }

  const addr = STORE_SHIPPING_ADDRESS;

  const handleWhatsApp = () => {
    const mensagem = `*NOVO PEDIDO - POWER CELL*
*Codigo:* ${pedido!.codigo}
--------------------------------
*CLIENTE:*
- Nome: ${pedido!.nome}
- CPF: ${pedido!.cpf}
- Telefone: ${pedido!.telefone}
- Email: ${pedido!.email}

*ENDERECO:*
- ${pedido!.rua}, ${pedido!.numero}
- ${pedido!.bairro} - ${pedido!.cidade}/${pedido!.uf}
- CEP: ${pedido!.cep}

*APARELHO:*
- Marca: ${pedido!.marca}
- Modelo: ${pedido!.modelo}
- Servico: ${pedido!.servico}
- Valor do servico: R$ ${pedido!.valor.toFixed(2).replace(".", ",")}
- Acessorios: ${pedido!.acessorios || "Nenhum"}
- Problema: ${pedido!.problema}

*FRETE:*
- A definir

*STATUS:* Pendente

_Pedido enviado pelo app Power Cell_`.trim();

    const url = `https://wa.me/553198562010?text=${encodeURIComponent(mensagem)}`;
    try {
      window.top!.location.href = url;
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const m = 20;
    let y = m;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(255, 107, 0);
    doc.text("POWER CELL", m, y);
    y += 8;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("ETIQUETA DE ENVIO", m, y);
    y += 10;

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Codigo: ${pedido!.codigo}`, m, y);
    y += 12;

    // Line
    doc.setDrawColor(255, 107, 0);
    doc.setLineWidth(0.5);
    doc.line(m, y, 190, y);
    y += 10;

    // Remetente
    doc.setFontSize(14);
    doc.setTextColor(255, 107, 0);
    doc.text("REMETENTE (Cliente)", m, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nome: ${pedido!.nome}`, m, y); y += 6;
    doc.text(`Endereco: ${pedido!.rua}, ${pedido!.numero}`, m, y); y += 6;
    doc.text(`${pedido!.bairro} - ${pedido!.cidade}/${pedido!.uf}`, m, y); y += 6;
    doc.text(`CEP: ${pedido!.cep}`, m, y); y += 10;

    // Destinatario
    doc.setFontSize(14);
    doc.setTextColor(255, 107, 0);
    doc.text("DESTINATARIO (Power Cell)", m, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Power Cell Assistencia Tecnica", m, y); y += 6;
    doc.text(`${addr.street}, ${addr.number} - ${addr.district}`, m, y); y += 6;
    doc.text(`${addr.city} - ${addr.state}`, m, y); y += 6;
    doc.text(`CEP: ${addr.zip}`, m, y); y += 10;

    // Line
    doc.line(m, y, 190, y);
    y += 10;

    // Servico
    doc.setFontSize(14);
    doc.setTextColor(255, 107, 0);
    doc.text("SERVICO", m, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Aparelho: ${pedido!.modelo} (${pedido!.marca})`, m, y); y += 6;
    doc.text(`Servico: ${pedido!.servico}`, m, y); y += 6;
    doc.text(`Valor: R$ ${pedido!.valor.toFixed(2).replace(".", ",")}`, m, y); y += 6;
    if (pedido!.acessorios) {
      doc.text(`Acessorios: ${pedido!.acessorios}`, m, y); y += 6;
    }
    doc.text(`Problema: ${pedido!.problema}`, m, y, { maxWidth: 170 }); y += 12;

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} as ${new Date().toLocaleTimeString("pt-BR")}`, m, 275);

    // QR Code - render to canvas
    const canvas = document.createElement("canvas");
    const size = 80;
    canvas.width = size;
    canvas.height = size;

    // Use a temp div to render QR
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    document.body.appendChild(tempDiv);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const qrContainer = document.createElement("div");
    tempDiv.appendChild(qrContainer);

    // Simple QR as text fallback
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`ID: ${pedido!.id}`, 140, 275);

    document.body.removeChild(tempDiv);

    doc.save(`Etiqueta-${pedido!.codigo}.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)" }}
    >
      {/* Check icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: "rgba(255,107,0,0.15)", border: "2px solid rgba(255,107,0,0.4)" }}
      >
        <CheckCircle className="w-10 h-10" style={{ color: "#FF6B00" }} />
      </div>

      {/* Title */}
      <h1
        className="text-3xl tracking-wider mb-4 text-center"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 900,
          textTransform: "uppercase",
          color: "white",
        }}
      >
        PEDIDO ENVIADO!
      </h1>

      {/* Code badge */}
      <div
        className="mb-3"
        style={{
          background: "rgba(255,107,0,0.1)",
          border: "1px solid rgba(255,107,0,0.3)",
          borderRadius: "99px",
          padding: "8px 20px",
        }}
      >
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            color: "#FF6B00",
            fontSize: "16px",
          }}
        >
          Seu codigo: {pedido.codigo}
        </span>
      </div>

      {/* Subtitle */}
      <p
        className="text-center mb-10"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: "13px",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        Guarde este codigo para acompanhar seu pedido
      </p>

      {/* WhatsApp button */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full transition-all"
          style={{
            background: "#FF6B00",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            color: "white",
            fontSize: "15px",
            boxShadow: "0 0 20px rgba(255,107,0,0.4)",
          }}
        >
          <MessageSquare className="w-5 h-5" />
          Enviar pelo WhatsApp
        </button>

        {/* PDF button */}
        <button
          onClick={handleDownloadPDF}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,107,0,0.3)",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            color: "rgba(255,255,255,0.6)",
            fontSize: "15px",
          }}
        >
          <Download className="w-5 h-5" />
          Baixar etiqueta PDF
        </button>
      </div>
    </div>
  );
}
