import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getQuoteDraft, getOsDraft } from "@/lib/storage";
import { getPhotos, clearPhotos } from "@/lib/photoStore";
import { formatBRL } from "@/lib/money";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const STEPS = ["Dados", "Aparelho", "Confirmação"];

export default function SelfLabelConfirm() {
  const navigate = useNavigate();
  const quote = getQuoteDraft();
  const draft = getOsDraft();
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleGenerate = async () => {
    setSaving(true);
    try {
      // 1. Generate sequential code
      const { data: codeData, error: codeError } = await supabase.rpc("generate_pedido_code");
      if (codeError) throw codeError;
      const codigo = codeData as string;

      // 2. Build services text
      const servicoText = quote.services.map((s) => s.label).join(", ");
      const valorTotal = quote.totalCents;

      // 3. Insert pedido
      const { data: pedido, error: insertError } = await supabase
        .from("pedidos")
        .insert({
          codigo,
          nome: draft.fullName || "",
          cpf: draft.cpf || "",
          telefone: draft.phone || "",
          email: draft.email || "",
          cep: draft.cep || "",
          rua: `${draft.street || ""}, ${draft.number || ""}${draft.complement ? ` - ${draft.complement}` : ""}`,
          bairro: draft.district || "",
          cidade: draft.city || "",
          uf: draft.uf || "",
          marca: quote.brandName,
          modelo: quote.modelName,
          servico: servicoText,
          valor: valorTotal,
          acessorios: draft.accessories?.join(", ") || "",
          problema: draft.problem || "",
          status: "pendente",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;
      const pedidoId = pedido.id;

      // 4. Upload photos
      const photos = getPhotos();
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const ext = file.name.split(".").pop() || "jpg";
        const filePath = `${pedidoId}/${Date.now()}_${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("fotos-pedidos")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("fotos-pedidos")
          .getPublicUrl(filePath);

        await supabase.from("fotos_pedido").insert({
          pedido_id: pedidoId,
          url: urlData.publicUrl,
        });
      }

      clearPhotos();

      // 5. Save to localStorage for success page
      localStorage.setItem("lastPedido", JSON.stringify({
        id: pedidoId,
        codigo,
        nome: draft.fullName,
        cpf: draft.cpf,
        telefone: draft.phone,
        email: draft.email,
        cep: draft.cep,
        rua: draft.street,
        numero: draft.number,
        complemento: draft.complement,
        bairro: draft.district,
        cidade: draft.city,
        uf: draft.uf,
        marca: quote.brandName,
        modelo: quote.modelName,
        servico: servicoText,
        valor: valorTotal,
        acessorios: draft.accessories?.join(", ") || "",
        problema: draft.problem || "",
      }));

      navigate("/envio/etiqueta-propria/sucesso");
    } catch (err: any) {
      console.error("Erro ao salvar pedido:", err);
      toast.error("Erro ao salvar pedido. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHeader title="Confirmação" backTo="/envio/etiqueta-propria/aparelho" />
      <Stepper steps={STEPS} current={2} />

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <div className="rounded-xl border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Dados Pessoais</h3>
          <p className="text-sm">{draft.fullName}</p>
          <p className="text-sm text-muted-foreground">CPF: {draft.cpf}</p>
          <p className="text-sm text-muted-foreground">Tel: {draft.phone}</p>
          <p className="text-sm text-muted-foreground">{draft.email}</p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Endereco</h3>
          <p className="text-sm">
            {draft.street}, {draft.number}
            {draft.complement ? ` - ${draft.complement}` : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            {draft.district} — {draft.city}/{draft.uf}
          </p>
          <p className="text-sm text-muted-foreground">CEP: {draft.cep}</p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Aparelho</h3>
          <p className="text-sm">{draft.deviceType} — {draft.deviceBrand}</p>
          <p className="text-sm text-muted-foreground">
            Valor declarado: {formatBRL(draft.deviceValueCents || 0)}
          </p>
          <p className="text-sm text-muted-foreground">Problema: {draft.problem}</p>
          {draft.accessories && draft.accessories.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Acessorios: {draft.accessories.join(", ")}
            </p>
          )}
          {draft.photoCount && (
            <p className="text-sm text-muted-foreground">
              Fotos enviadas: {draft.photoCount}
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Servicos</h3>
          {quote.services.map((s) => (
            <div key={s.id} className="flex justify-between text-sm">
              <span>- {s.label}</span>
              <span className="text-muted-foreground">{formatBRL(s.priceCents)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatBRL(quote.totalCents)}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 px-1 py-2">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(v) => setAgreed(v === true)}
          />
          <label htmlFor="agree" className="text-sm text-muted-foreground leading-snug cursor-pointer">
            Declaro que as informacoes sao verdadeiras e concordo com os termos de servico.
          </label>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t px-4 py-4">
        <div className="max-w-lg mx-auto">
          <Button
            size="lg"
            className="w-full text-base"
            disabled={!agreed || saving}
            onClick={handleGenerate}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Gerar Ordem de Servico"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
