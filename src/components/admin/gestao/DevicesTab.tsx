import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DbDeviceModel, logAdminAction, slugify, useBrands, useDeviceModels, useInvalidateCatalog, useRepairPrices,
} from "@/hooks/useCatalog";

const PAGE_SIZE = 25;

export default function DevicesTab() {
  const { data: brands = [] } = useBrands(true);
  const { data: models = [], isLoading } = useDeviceModels(true);
  const { data: prices = [] } = useRepairPrices(true);
  const invalidate = useInvalidateCatalog();

  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<DbDeviceModel | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ brand_id: "", name: "", slug: "", active: true });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<DbDeviceModel | null>(null);

  const brandName = (id: string) => brands.find((b) => b.id === id)?.name ?? "-";
  const priceCount = (modelId: string) => prices.filter((p) => p.device_model_id === modelId).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return models.filter((m) => {
      if (brandFilter !== "all" && m.brand_id !== brandFilter) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || brandName(m.brand_id).toLowerCase().includes(q);
    });
  }, [models, search, brandFilter, brands]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setForm({ brand_id: brandFilter !== "all" ? brandFilter : brands[0]?.id ?? "", name: "", slug: "", active: true });
    setCreating(true);
  };
  const openEdit = (m: DbDeviceModel) => {
    setForm({ brand_id: m.brand_id, name: m.name, slug: m.slug, active: m.active });
    setEditing(m);
  };

  const save = async () => {
    const name = form.name.trim();
    if (!form.brand_id) return toast.error("Selecione a marca");
    if (!name) return toast.error("Informe o nome do aparelho");
    const slug = (form.slug.trim() || slugify(name)).toLowerCase();
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("device_models")
          .update({ brand_id: form.brand_id, name, slug, active: form.active })
          .eq("id", editing.id);
        if (error) throw error;
        await logAdminAction({ action: "update", table_name: "device_models", record_id: editing.id, data_before: editing, data_after: { ...form, name, slug } });
        toast.success("Aparelho atualizado");
      } else {
        const { data, error } = await supabase
          .from("device_models")
          .insert({ brand_id: form.brand_id, name, slug, active: form.active, sort_order: 0 })
          .select()
          .single();
        if (error) throw error;
        await logAdminAction({ action: "create", table_name: "device_models", record_id: data?.id, data_after: data });
        toast.success("Aparelho criado");
      }
      invalidate();
      setEditing(null);
      setCreating(false);
    } catch (e: any) {
      toast.error(e?.message?.includes("duplicate") ? "Esse aparelho já existe nessa marca" : e?.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (m: DbDeviceModel) => {
    const { error } = await supabase.from("device_models").update({ active: !m.active }).eq("id", m.id);
    if (error) return toast.error(error.message);
    await logAdminAction({ action: !m.active ? "activate" : "deactivate", table_name: "device_models", record_id: m.id, data_before: m });
    invalidate();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    if (priceCount(toDelete.id) > 0) {
      await supabase.from("device_models").update({ active: false }).eq("id", toDelete.id);
      await logAdminAction({ action: "deactivate_instead_of_delete", table_name: "device_models", record_id: toDelete.id, data_before: toDelete });
      toast.info("Aparelho possui preços cadastrados: foi desativado em vez de excluído");
    } else {
      const { error } = await supabase.from("device_models").delete().eq("id", toDelete.id);
      if (error) return toast.error(error.message);
      await logAdminAction({ action: "delete", table_name: "device_models", record_id: toDelete.id, data_before: toDelete });
      toast.success("Aparelho excluído");
    }
    setToDelete(null);
    invalidate();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar aparelho ou marca..." className="pl-9" />
        </div>
        <Select value={brandFilter} onValueChange={(v) => { setBrandFilter(v); setPage(1); }}>
          <SelectTrigger className="sm:w-52"><SelectValue placeholder="Marca" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as marcas</SelectItem>
            {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Novo aparelho</Button>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} aparelhos</p>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_140px_110px_100px_130px] gap-3 px-4 py-2.5 bg-secondary/50 text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
          <span>Aparelho</span><span>Marca</span><span>Preços</span><span>Status</span><span className="text-right">Ações</span>
        </div>
        {isLoading && <p className="p-4 text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && current.length === 0 && <p className="p-4 text-sm text-muted-foreground">Nenhum aparelho encontrado.</p>}
        {current.map((m) => (
          <div key={m.id} className="grid md:grid-cols-[1fr_140px_110px_100px_130px] gap-2 md:gap-3 px-4 py-3 border-t border-border items-center">
            <span className="font-semibold text-foreground text-sm">{m.name}</span>
            <span className="text-xs text-muted-foreground">{brandName(m.brand_id)}</span>
            <span className="text-xs text-muted-foreground">{priceCount(m.id)} serviços</span>
            <Badge variant={m.active ? "default" : "secondary"} className="w-fit">{m.active ? "Ativo" : "Inativo"}</Badge>
            <div className="flex items-center gap-1 md:justify-end">
              <Switch checked={m.active} onCheckedChange={() => toggleActive(m)} aria-label="Ativar aparelho" />
              <Button size="icon" variant="ghost" onClick={() => openEdit(m)} aria-label="Editar"><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setToDelete(m)} aria-label="Excluir"><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
          <span className="text-xs text-muted-foreground">Página {page} de {pageCount}</span>
          <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
        </div>
      )}

      <Dialog open={creating || !!editing} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar aparelho" : "Novo aparelho"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Marca</Label>
              <Select value={form.brand_id} onValueChange={(v) => setForm((f) => ({ ...f, brand_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione a marca" /></SelectTrigger>
                <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Nome do aparelho</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))} placeholder="Ex.: Galaxy S24" />
            </div>
            <div className="space-y-1.5">
              <Label>Identificador (slug)</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="galaxy-s24" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} />
              <Label>Aparelho ativo no site</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); }}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se houver preços cadastrados, o aparelho será apenas desativado para preservar o histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
