import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, Pencil, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DbBrand, logAdminAction, slugify, useBrands, useDeviceModels, useInvalidateCatalog } from "@/hooks/useCatalog";

export default function BrandsTab() {
  const { data: brands = [], isLoading } = useBrands(true);
  const { data: models = [] } = useDeviceModels(true);
  const invalidate = useInvalidateCatalog();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<DbBrand | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", active: true });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<DbBrand | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? brands.filter((b) => b.name.toLowerCase().includes(q) || b.slug.includes(q)) : brands;
  }, [brands, search]);

  const modelCount = (brandId: string) => models.filter((m) => m.brand_id === brandId).length;

  const openCreate = () => {
    setForm({ name: "", slug: "", active: true });
    setCreating(true);
  };
  const openEdit = (b: DbBrand) => {
    setForm({ name: b.name, slug: b.slug, active: b.active });
    setEditing(b);
  };

  const save = async () => {
    const name = form.name.trim();
    if (!name) return toast.error("Informe o nome da marca");
    const slug = (form.slug.trim() || slugify(name)).toLowerCase();
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("brands")
          .update({ name, slug, active: form.active })
          .eq("id", editing.id);
        if (error) throw error;
        await logAdminAction({ action: "update", table_name: "brands", record_id: editing.id, data_before: editing, data_after: { name, slug, active: form.active } });
        toast.success("Marca atualizada");
      } else {
        const sort = (brands.at(-1)?.sort_order ?? 0) + 10;
        const { data, error } = await supabase
          .from("brands")
          .insert({ name, slug, active: form.active, sort_order: sort })
          .select()
          .single();
        if (error) throw error;
        await logAdminAction({ action: "create", table_name: "brands", record_id: data?.id, data_after: data });
        toast.success("Marca criada");
      }
      invalidate();
      setEditing(null);
      setCreating(false);
    } catch (e: any) {
      toast.error(e?.message?.includes("duplicate") ? "Já existe uma marca com esse nome ou identificador" : e?.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b: DbBrand) => {
    const { error } = await supabase.from("brands").update({ active: !b.active }).eq("id", b.id);
    if (error) return toast.error(error.message);
    await logAdminAction({ action: !b.active ? "activate" : "deactivate", table_name: "brands", record_id: b.id, data_before: b });
    invalidate();
  };

  const move = async (b: DbBrand, dir: -1 | 1) => {
    const idx = brands.findIndex((x) => x.id === b.id);
    const other = brands[idx + dir];
    if (!other) return;
    await supabase.from("brands").update({ sort_order: other.sort_order }).eq("id", b.id);
    await supabase.from("brands").update({ sort_order: b.sort_order }).eq("id", other.id);
    invalidate();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const count = modelCount(toDelete.id);
    if (count > 0) {
      await supabase.from("brands").update({ active: false }).eq("id", toDelete.id);
      await logAdminAction({ action: "deactivate_instead_of_delete", table_name: "brands", record_id: toDelete.id, data_before: toDelete });
      toast.info("Marca possui aparelhos vinculados: foi desativada em vez de excluída");
    } else {
      const { error } = await supabase.from("brands").delete().eq("id", toDelete.id);
      if (error) return toast.error(error.message);
      await logAdminAction({ action: "delete", table_name: "brands", record_id: toDelete.id, data_before: toDelete });
      toast.success("Marca excluída");
    }
    setToDelete(null);
    invalidate();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar marca..." className="pl-9" />
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Nova marca</Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_140px_120px_100px_170px] gap-3 px-4 py-2.5 bg-secondary/50 text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
          <span>Marca</span><span>Identificador</span><span>Aparelhos</span><span>Status</span><span className="text-right">Ações</span>
        </div>
        {isLoading && <p className="p-4 text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && filtered.length === 0 && <p className="p-4 text-sm text-muted-foreground">Nenhuma marca encontrada.</p>}
        {filtered.map((b) => (
          <div key={b.id} className="grid md:grid-cols-[1fr_140px_120px_100px_170px] gap-2 md:gap-3 px-4 py-3 border-t border-border items-center">
            <span className="font-semibold text-foreground text-sm">{b.name}</span>
            <span className="text-xs text-muted-foreground font-mono">{b.slug}</span>
            <span className="text-xs text-muted-foreground">{modelCount(b.id)} aparelhos</span>
            <Badge variant={b.active ? "default" : "secondary"} className="w-fit">{b.active ? "Ativa" : "Inativa"}</Badge>
            <div className="flex items-center gap-1 md:justify-end">
              <Button size="icon" variant="ghost" onClick={() => move(b, -1)} aria-label="Subir"><ArrowUp className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => move(b, 1)} aria-label="Descer"><ArrowDown className="w-4 h-4" /></Button>
              <Switch checked={b.active} onCheckedChange={() => toggleActive(b)} aria-label="Ativar marca" />
              <Button size="icon" variant="ghost" onClick={() => openEdit(b)} aria-label="Editar"><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setToDelete(b)} aria-label="Excluir"><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={creating || !!editing} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar marca" : "Nova marca"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))} placeholder="Ex.: Samsung" />
            </div>
            <div className="space-y-1.5">
              <Label>Identificador (slug)</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="samsung" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} />
              <Label>Marca ativa no site</Label>
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
              Se existirem aparelhos vinculados, a marca será apenas desativada para preservar o histórico de orçamentos.
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
