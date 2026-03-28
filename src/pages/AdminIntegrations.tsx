import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2, Plug, RefreshCw, Save, Key } from "lucide-react";
import { toast } from "sonner";

export default function AdminIntegrations() {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading");
  const [tokenPrefix, setTokenPrefix] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("melhorenvio-get-token-status");
      if (error) throw error;
      if (data?.connected) {
        setStatus("connected");
        setTokenPrefix(data.tokenPrefix || null);
        setUpdatedAt(data.updatedAt || null);
      } else {
        setStatus("disconnected");
        setTokenPrefix(null);
        setUpdatedAt(null);
      }
    } catch {
      setStatus("disconnected");
    } finally {
      setTesting(false);
    }
  };

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) {
      toast.error("Cole o token antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("melhorenvio-set-token", {
        body: { accessToken: tokenInput.trim() },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      toast.success("Token salvo com sucesso!");
      setTokenInput("");
      await checkStatus();
    } catch (err) {
      toast.error("Erro ao salvar token.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("melhorenvio-ping");
      if (error) throw error;
      if (data?.connected) {
        toast.success(`Conexão OK — ${data.user?.name || "conectado"}`);
        setStatus("connected");
      } else {
        toast.error(data?.error || "Não foi possível validar o token.");
        setStatus("disconnected");
      }
    } catch {
      toast.error("Erro ao testar conexão.");
      setStatus("disconnected");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-bold font-[Montserrat] uppercase tracking-wide">Integrações</h1>
        {/* Status Card */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plug className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Melhor Envio</h2>
              <p className="text-sm text-muted-foreground">Cotação e geração de etiquetas</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-secondary">
            {status === "loading" || testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Verificando...</span>
              </>
            ) : status === "connected" ? (
              <>
                <CheckCircle className="w-4 h-4 text-whatsapp" />
                <span className="text-sm font-medium text-whatsapp">Conectado</span>
                {tokenPrefix && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    Token: {tokenPrefix}
                  </span>
                )}
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Não conectado</span>
              </>
            )}
          </div>

          {updatedAt && status === "connected" && (
            <p className="text-xs text-muted-foreground">
              Último update: {new Date(updatedAt).toLocaleString("pt-BR")}
            </p>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={testing}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${testing ? "animate-spin" : ""}`} />
            Testar conexão
          </Button>
        </div>

        {/* Token Input Card */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Token de acesso manual</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Cole aqui o <strong>access_token</strong> do Melhor Envio (sandbox ou produção).
            O token será salvo de forma segura no backend.
          </p>
          <Textarea
            placeholder="Cole o access_token aqui..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            rows={4}
            className="font-mono text-xs"
          />
          <Button
            onClick={handleSaveToken}
            disabled={saving || !tokenInput.trim()}
            className="w-full"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar token
          </Button>
        </div>

        {/* Info */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-sm">📋 Informações</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• O token é armazenado no banco, nunca no frontend</li>
            <li>• Apenas o prefixo do token é exibido por segurança</li>
            <li>• Use "Testar conexão" para validar se o token está funcionando</li>
            <li>• Após salvar, o cálculo de frete deve funcionar automaticamente</li>
          </ul>
        </div>
    </div>
  );
}
