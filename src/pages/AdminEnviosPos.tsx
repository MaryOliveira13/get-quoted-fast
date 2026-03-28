import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { STORE_SHIPPING_ADDRESS, STORE_NAME } from "@/config/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Truck, FileDown } from "lucide-react";
import { toast } from "sonner";

interface ClienteOption {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  cep: string | null;
  rua: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
}

interface ShippingQuote {
  id: number;
  name: string;
  company: { name: string };
  price: string;
  delivery_time: number;
}

export default function AdminEnviosPos() {
  const [search, setSearch] = useState("");
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteOption | null>(null);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<ShippingQuote | null>(null);
  const [generatingLabel, setGeneratingLabel] = useState(false);
  const [labelUrl, setLabelUrl] = useState<string | null>(null);

  const searchClientes = async (q: string) => {
    if (q.length < 2) { setClientes([]); return; }
    setLoadingClientes(true);
    // Search in pedidos for client data
    const { data } = await supabase
      .from("pedidos")
      .select("id, nome, telefone, email, cep, rua, bairro, cidade, uf")
      .or(`nome.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(10);

    const unique = new Map<string, ClienteOption>();
    (data || []).forEach((p: any) => {
      const key = (p.nome || "").toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, p);
      }
    });
    setClientes(Array.from(unique.values()));
    setLoadingClientes(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => searchClientes(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelectCliente = (c: ClienteOption) => {
    setSelectedCliente(c);
    setSearch(c.nome || "");
    setClientes([]);
    setQuotes([]);
    setSelectedQuote(null);
    setLabelUrl(null);
  };

  const fetchQuotes = async () => {
    if (!selectedCliente?.cep) {
      toast.error("Cliente sem CEP cadastrado");
      return;
    }
    setLoadingQuotes(true);
    try {
      const { data, error } = await supabase.functions.invoke("melhorenvio-quote", {
        body: {
          from: { postal_code: STORE_SHIPPING_ADDRESS.zip.replace("-", "") },
          to: { postal_code: selectedCliente.cep.replace("-", "") },
        },
      });
      if (error) throw error;
      const valid = (data || []).filter((q: any) => !q.error && q.price);
      setQuotes(valid);
      if (valid.length === 0) toast.info("Nenhuma cotação disponível");
    } catch {
      toast.error("Erro ao cotar frete");
    }
    setLoadingQuotes(false);
  };

  const generateLabel = async () => {
    if (!selectedCliente || !selectedQuote) return;
    setGeneratingLabel(true);
    try {
      // Create order for reverse shipping (store → client)
      const { data: orderData, error: orderError } = await supabase.functions.invoke("order-create", {
        body: {
          customer_name: selectedCliente.nome,
          customer_phone: selectedCliente.telefone || "",
          cpf: "00000000000", // Admin flow
          brand: "N/A",
          model: "N/A",
          services: [],
          repair_estimate_total: 0,
          shipping_amount: parseFloat(selectedQuote.price),
          shipping_option: selectedQuote,
          customer_cep: selectedCliente.cep,
          customer_street: selectedCliente.rua,
          customer_district: selectedCliente.bairro,
          customer_city: selectedCliente.cidade,
          customer_uf: selectedCliente.uf,
        },
      });

      if (orderError) throw orderError;
      const orderId = orderData?.id;

      if (orderId) {
        // Generate label
        const { data: labelData, error: labelError } = await supabase.functions.invoke("generate-label", {
          body: { order_id: orderId },
        });

        if (labelError) throw labelError;
        if (labelData?.label_url_pdf) {
          setLabelUrl(labelData.label_url_pdf);
          toast.success("Etiqueta gerada com sucesso!");
        } else {
          toast.info("Etiqueta em processamento. Verifique em alguns instantes.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar etiqueta");
    }
    setGeneratingLabel(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold font-[Montserrat] uppercase tracking-wide">Envios Pós-Manutenção</h1>
      <p className="text-sm text-muted-foreground">Gere etiquetas para enviar aparelhos de volta aos clientes.</p>

      {/* Step 1: Search client */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">1. Selecionar cliente</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedCliente(null); }}
          />
          {loadingClientes && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {clientes.length > 0 && !selectedCliente && (
          <div className="border border-border rounded-lg overflow-hidden">
            {clientes.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectCliente(c)}
                className="w-full text-left px-4 py-2.5 hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
              >
                <p className="text-sm font-medium">{c.nome}</p>
                <p className="text-xs text-muted-foreground">{c.email} — {c.cidade}/{c.uf}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Address confirmation */}
      {selectedCliente && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">2. Confirmação de endereços</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-secondary/50 p-3 space-y-1">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Remetente (Loja)</p>
              <p className="text-sm">{STORE_NAME}</p>
              <p className="text-xs text-muted-foreground">
                {STORE_SHIPPING_ADDRESS.street}, {STORE_SHIPPING_ADDRESS.number}
              </p>
              <p className="text-xs text-muted-foreground">
                {STORE_SHIPPING_ADDRESS.district} — {STORE_SHIPPING_ADDRESS.city}/{STORE_SHIPPING_ADDRESS.state}
              </p>
              <p className="text-xs text-muted-foreground">CEP: {STORE_SHIPPING_ADDRESS.zip}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3 space-y-1">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Destinatário (Cliente)</p>
              <p className="text-sm">{selectedCliente.nome}</p>
              <p className="text-xs text-muted-foreground">{selectedCliente.rua}</p>
              <p className="text-xs text-muted-foreground">
                {selectedCliente.bairro} — {selectedCliente.cidade}/{selectedCliente.uf}
              </p>
              <p className="text-xs text-muted-foreground">CEP: {selectedCliente.cep}</p>
            </div>
          </div>

          <Button onClick={fetchQuotes} disabled={loadingQuotes} className="w-full gap-2">
            {loadingQuotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            Cotar frete
          </Button>
        </div>
      )}

      {/* Step 3: Select shipping */}
      {quotes.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">3. Selecionar transportadora</h3>
          <div className="space-y-2">
            {quotes.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuote(q)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  selectedQuote?.id === q.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{q.company?.name} — {q.name}</p>
                    <p className="text-xs text-muted-foreground">{q.delivery_time} dias úteis</p>
                  </div>
                  <span className="text-sm font-bold font-[Montserrat] text-primary">
                    R$ {parseFloat(q.price).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={generateLabel}
            disabled={!selectedQuote || generatingLabel}
            className="w-full gap-2"
          >
            {generatingLabel ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Gerar etiqueta
          </Button>
        </div>
      )}

      {/* Step 4: Label generated */}
      {labelUrl && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-primary">✓ Etiqueta gerada!</h3>
          <div className="flex gap-3">
            <Button asChild className="gap-2">
              <a href={labelUrl} target="_blank" rel="noopener noreferrer">
                <FileDown className="w-4 h-4" /> Baixar etiqueta
              </a>
            </Button>
            <Button variant="outline" onClick={() => window.open(labelUrl, "_blank")} className="gap-2">
              Imprimir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
