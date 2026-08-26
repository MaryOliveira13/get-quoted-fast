import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatBRL } from "@/lib/money";
import {
  logAdminAction, useBrands, useDeviceModels, useInvalidateCatalog, useRepairPrices, useRepairServices,
  parsePriceInput, formatPriceInput,
} from "@/hooks/useCatalog";

export default function PricesTab() {
  const { data: brands = [] } = useBrands(true);
  const { data: models = [] } = useDeviceModels(true);
  const { data: services = [] } = useRepairServices(true);
  const { data: prices = [] } = useRepairPrices(true);
  const invalidate = useInvalidateCatalog();

  const [brandFilter, setBrandFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, { value: string; active: boolean }>>({});
  const [saving, setSaving] = useState(false);

  const filteredModels = useMemo(() => {
    const q = search.trim().toLowerCase();
    return models.filter((m) => {
      if (brandFilter !== "all" && m.brand_id !== brandFilter) return false;
      if (!q) return true;
      const brand = brands.find((b) => b.id === m.brand_id)?.name ?? "";
      return m.name.toLowerCase().includes(q) || brand.toLowerCase().includes(q);
    }).slice(0, 200);
  }, [models, brands, brandFilter, search]);

  const modelPrices = useMemo(
    () => prices.filter((p) => p.device_model_id === selectedModel),
    [prices, selectedModel]
  );

  useEffect(() => {
    if (!selectedModel) return;
    const next: Record<string, { value: string; active: boolean }> = {};
    services.forEach((s) => {
      const existing = modelPrices.find((p) => p.repair_service_id === s.id);
      next[s.id] = {
        value: existing ? formatPriceInput(existing.price) : "",
        active: existing ? existing.active : true,
      };
    });
    setDraft(next);
  }, [selectedModel, services, prices]);

  const model = models.find((m) => m.id === selectedModel);
  const brandOf = (id: string) => brands.find((b) => b.id === id)?.name ?? "";

  const saveAll = async () => {
    if (!selectedModel) return;
    setSaving(true);
    try {
      for (const s of services) {
        const d = draft[s.id];
        const existing = modelPrices.find((p) => p.repair_service_id === s.id);
        const raw = (d?.value ?? "").trim();
        if (!raw) {
          if (existing) {
            await supabase.from("repair_prices").delete().eq("id", existing.id);
            await logAdminAction({ action: "delete", table_name: "repair_prices", record_id: existing.id, data_before: existing });
          }
          continue;
        }
        const price = parsePriceInput(raw);
        if (price <= 0) {
          toast.error(`Preço inválido para ${s.name}`);
          continue;
        }
        if (existing) {
          if (existing.price !== price || existing.active !== d.active) {
            const { error } = await supabase
              .from("repair_prices")
              .update({ price, active: d.active })
              .eq("id", existing.id);
            if (error) throw error;
            await logAdminAction({ action: "update", table_name: "repair_prices", record_id: existing.id, data_before: existing, data_after: { price, active: d.active } });
          }
        } else {
          const { data, error } = await supabase
            .from("repair_prices")
            .insert({ device_model_id: selectedModel, repair_service_id: s.id, price, active: d.active })
            .select()
            .single();
          if (error) throw error;
          await logAdminAction({ action: "create", table_name: "repair_prices", record_id: data?.id, data_after: data });
        }
      }
      invalidate();
      toast.success("Preços salvos");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar preços");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-4">
      {/* Model list */}
      <div className="space-y-3">
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger><SelectValue placeholder="Marca" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as marcas</SelectItem>
            {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar aparelho..." className="pl-9" />
        </div>
        <div className="rounded-xl border border-border max-h-[520px] overflow-y-auto">
          {filteredModels.map((m) => {
            const count = prices.filter((p) => p.device_model_id === m.id).length;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`w-full text-left px-3 py-2.5 border-b border-border last:border-b-0 transition-colors ${
                  selectedModel === m.id ? "bg-primary/15 text-primary" : "hover:bg-secondary"
                }`}
              >
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-[11px] text-muted-foreground">{brandOf(m.brand_id)} · {count} preços</p>
              </button>
            );
          })}
          {filteredModels.length === 0 && <p className="p-3 text-sm text-muted-foreground">Nenhum aparelho.</p>}
        </div>
      </div>

      {/* Price editor */}
      <div className="rounded-xl border border-border p-4">
        {!model && <p className="text-sm text-muted-foreground">Selecione um aparelho para editar os preços.</p>}
        {model && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground font-[Montserrat]">{model.name}</h3>
              <p className="text-xs text-muted-foreground">{brandOf(model.brand_id)}</p>
            </div>
            <div className="space-y-2">
              {services.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    {!s.active && <p className="text-[11px] text-muted-foreground">serviço inativo</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">R$</span>
                    <Input
                      value={draft[s.id]?.value ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, [s.id]: { value: e.target.value, active: d[s.id]?.active ?? true } }))}
                      placeholder="0,00"
                      inputMode="decimal"
                      className="w-28 text-right"
                    />
                  </div>
                  <Switch
                    checked={draft[s.id]?.active ?? true}
                    onCheckedChange={(v) => setDraft((d) => ({ ...d, [s.id]: { value: d[s.id]?.value ?? "", active: v } }))}
                    aria-label="Preço ativo"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Deixe o campo vazio para remover o preço desse serviço neste aparelho. Total cadastrado:{" "}
              {formatBRL(modelPrices.reduce((a, p) => a + p.price * 100, 0))}
            </p>
            <Button onClick={saveAll} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar preços"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
