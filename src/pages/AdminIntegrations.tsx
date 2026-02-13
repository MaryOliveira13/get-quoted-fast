import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2, Plug, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

export default function AdminIntegrations() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading");
  const [meUser, setMeUser] = useState<{ name: string; email: string } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (searchParams.get("connected") === "true") {
      toast.success("Melhor Envio conectado com sucesso!");
    }
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("melhorenvio-ping");
      if (error) throw error;
      if (data?.connected) {
        setStatus("connected");
        setMeUser(data.user);
      } else {
        setStatus("disconnected");
        setMeUser(null);
      }
    } catch {
      setStatus("disconnected");
      setMeUser(null);
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("melhorenvio-authorize");
      if (error) throw error;
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error("Erro ao obter URL de autorização");
      }
    } catch (err) {
      toast.error("Erro ao conectar com Melhor Envio");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Integrações" backTo="/" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
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

          {/* Status */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-secondary">
            {status === "loading" || testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Verificando conexão...</span>
              </>
            ) : status === "connected" ? (
              <>
                <CheckCircle className="w-4 h-4 text-whatsapp" />
                <span className="text-sm font-medium text-whatsapp">Conectado</span>
                {meUser && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {meUser.name} ({meUser.email})
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

          {/* Actions */}
          <div className="flex gap-3">
            {status !== "connected" ? (
              <Button onClick={handleConnect} className="flex-1">
                Conectar Melhor Envio
              </Button>
            ) : (
              <Button variant="outline" onClick={handleConnect} className="flex-1">
                Reconectar
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={checkConnection}
              disabled={testing}
            >
              <RefreshCw className={`w-4 h-4 ${testing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-sm">📋 Informações</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Os tokens OAuth são armazenados de forma segura no backend</li>
            <li>• O refresh automático acontece quando o token expira</li>
            <li>• Nenhuma credencial é exposta no frontend</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
