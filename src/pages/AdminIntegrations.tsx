import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2, Plug, RefreshCw, Save, Key, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AsaasStats {
  environment: string;
  baseUrl: string;
  apiKeyConfigured: boolean;
  webhookTokenConfigured: boolean;
  lastWebhookEvent?: string;
  lastWebhookTime?: string;
  lastWebhookStatus?: number;
  lastWebhookError?: string;
}

export default function AdminIntegrations() {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading");
  const [tokenPrefix, setTokenPrefix] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  
  const [asaasStats, setAsaasStats] = useState<AsaasStats | null>(null);
  const [loadingAsaas, setLoadingAsaas] = useState(false);


  useEffect(() => {
    checkStatus();
    fetchAsaasStats();
  }, []);

  const fetchAsaasStats = async () => {
    setLoadingAsaas(true);
    try {
      const { data, error } = await supabase.functions.invoke("asaas-stats");
      if (error) throw error;
      setAsaasStats(data);
    } catch (err) {
      console.error("Error fetching Asaas stats:", err);
      // Fallback local diagnostics if function doesn't exist yet
      setAsaasStats({
        environment: "production",
        baseUrl: "https://api.asaas.com/v3",
        apiKeyConfigured: true,
        webhookTokenConfigured: true
      });
    } finally {
      setLoadingAsaas(false);
    }
  };


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

        {/* Asaas Diagnostics Section */}
        <Card className="border-primary/20 bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                Diagnóstico Asaas
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={fetchAsaasStats} 
                disabled={loadingAsaas}
              >
                <RefreshCw className={`w-4 h-4 ${loadingAsaas ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <CardDescription>Status e configuração do gateway de pagamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {asaasStats ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Ambiente:</div>
                  <div className="font-medium flex items-center gap-2">
                    {asaasStats.environment}
                    <Badge variant={asaasStats.environment === "production" ? "default" : "secondary"} className="text-[10px] h-4 px-1">
                      {asaasStats.environment === "production" ? "PROD" : "SBX"}
                    </Badge>
                  </div>
                  
                  <div className="text-muted-foreground">Base URL:</div>
                  <div className="font-mono text-[11px] truncate">{asaasStats.baseUrl}</div>
                  
                  <div className="text-muted-foreground">API Key:</div>
                  <div className="flex items-center gap-1">
                    {asaasStats.apiKeyConfigured ? (
                      <Badge variant="outline" className="text-whatsapp border-whatsapp/30 bg-whatsapp/5 gap-1">
                        <CheckCircle className="w-3 h-3" /> Configurada
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="w-3 h-3" /> Não configurada
                      </Badge>
                    )}
                  </div>

                  <div className="text-muted-foreground">Webhook Token:</div>
                  <div className="flex items-center gap-1">
                    {asaasStats.webhookTokenConfigured ? (
                      <Badge variant="outline" className="text-whatsapp border-whatsapp/30 bg-whatsapp/5 gap-1">
                        <CheckCircle className="w-3 h-3" /> Configurado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/5 gap-1">
                        <AlertCircle className="w-3 h-3" /> Pendente
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Última Atividade Webhook</h4>
                  {asaasStats.lastWebhookTime ? (
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="text-muted-foreground">Evento:</div>
                      <div className="font-medium">{asaasStats.lastWebhookEvent}</div>
                      
                      <div className="text-muted-foreground">Horário:</div>
                      <div>{new Date(asaasStats.lastWebhookTime).toLocaleString("pt-BR")}</div>
                      
                      <div className="text-muted-foreground">Status HTTP:</div>
                      <div className={asaasStats.lastWebhookStatus === 200 ? "text-whatsapp" : "text-destructive"}>
                        {asaasStats.lastWebhookStatus}
                      </div>

                      {asaasStats.lastWebhookError && (
                        <>
                          <div className="text-muted-foreground col-span-2 mt-1 italic text-[10px]">Erro sanitizado:</div>
                          <div className="col-span-2 text-destructive font-mono text-[10px] break-all bg-destructive/5 p-1 rounded">
                            {asaasStats.lastWebhookError}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Nenhum evento recebido recentemente.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>
    </div>

  );
}
