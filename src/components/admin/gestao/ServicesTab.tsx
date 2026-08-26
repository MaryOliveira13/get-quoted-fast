import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, Pencil, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DbRepairService, logAdminAction, slugify, useInvalidateCatalog, useRepairPrices, useRepairServices,
} from "@/hooks/useCatalog";

export default function ServicesTab() {
  const { data: services = [], isLoading } = useRepairServices(true);
  const { data: prices = [] } = useRepairPrices(true);
  const invalidate = useInvalidateCatalog();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<DbRepairService | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", active: true });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<DbRepairService | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? services.filter((s) => s.name.toLowerCase().includes(q)) : services;
  }, [services, search]);

  const priceCount = (id: string) => prices.filter((p) => p.repair_service_id === id).length;

  const openCreate = () => { setForm({ name: "", slug: "", description: "", active: true }); setCreating(true); };
  const openEdit = (s: DbRepairService) => {
    setForm({ name: s.name, slug: s.slug, description: s.description ?? "", active: s.active });
    setEditing(s);
  };

  const save = async () => {
    const name = form.name.trim();
    if (!name) return toast.error("Informe o nome do serviço");
    const slug = (form.slug.trim() || slugify(name)).toLowerCase();
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("repair_services")
          .update({ name, slug, description: form.description.trim() || null, active: form.active })
          .eq("id", editing.id);
        if (error) throw error;
        await logAdminAction({ action: "update", table_name: "repair_services", record_id: editing.id, data_before: editing, data_after: { ...form, name, slug } });
        toast.success("Serviço atualizado");
      } else {
        const sort = (services.at(-1)?.sort_order ?? 0) + 10;
        const { data, error } = await supabase
          .from("repair_services")
          .insert({ name, slug, description: form.description.trim() || null, active: form.active, sort_order: sort })
          .select()
          .single();
        if (error) throw error;
        await logAdminAction({ action: "create", table_name: "repair_services", record_id: data?.id, data_after: data });
        toast.success("Serviço criado");
      }
      invalidate();
      setEditing(null);
      setCreating(false);
    } catch (e: any) {
      toast.error(e?.message?.includes("duplicate") ? "Já existe um serviço com esse nome" : e?.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: DbRepairService) => {
    const { error } = await supabase.from("repair_services").update({ active: !s.active }).eq("id", s.id);
    if (error) return toast.error(error.message);
    await logAdminAction({ action: !s.active ? "activate" : "deactivate", table_name: "repair_services", record_id: s.id, data_before: s });
    invalidate();
  };

  const move = async (s: DbRepairService, dir: -1 | 1) => {
    const idx = services.findIndex((x) => x.id === s.id);
    const other = services[idx + dir];
    if (!other) return;
    await supabase.from("repair_services").update({ sort_order: other.sort_order }).eq("id", s.id);
    await supabase.from("repair_services").update({ sort_order: s.sort_order }).eq("id", other.id);
    invalidate();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    if (priceCount(toDelete.id) > 0) {
      await supabase.from("repair_services").update({ active: false }).eq("id", toDelete.id);
      await logAdminAction({ action: "deactivate_instead_of_delete", table_name: "repair_services", record_id: toDelete.id, data_before: toDelete });
      toast.info("Serviço possui preços vinculados: foi desativado em vez de excluído");
    } else {
      const { error } = await supabase.from("repair_services").delete().eq("id", toDelete.id);
      if (error) return toast.error(error.message);
      await logAdminAction({ action: "delete", table_name: "repair_services", record_id: toDelete.id, data_before: toDelete });
      toast.success("Serviço excluído");
    }
    setToDelete(null);
    invalidate();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar serviço..." className="pl-9" />
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Novo serviço</Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_1fr_110px_100px_170px] gap-3 px-4 py-2.5 bg-secondary/50 text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
          <span>Serviço</span><span>Descrição</span><span>Preços</span><span>Status</span><span className="text-right">Ações</span>
        </div>
        {isLoading && <p className="p-4 text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && filtered.length === 0 && <p className="p-4 text-sm text-muted-foreground">Nenhum serviço encontrado.</p>}
        {filtered.map((s) => (
          <div key={s.id} className="grid md:grid-cols-[1fr_1fr_110px_100px_170px] gap-2 md:gap-3 px-4 py-3 border-t border-border items-center">
            <span className="font-semibold text-foreground text-sm">{s.name}</span>
            <span className="text-xs text-muted-foreground truncate">{s.description ?? "-"}</span>
            <span className="text-xs text-muted-foreground">{priceCount(s.id)} aparelhos</span>
            <Badge variant={s.active ? "default" : "secondary"} className="w-fit">{s.active ? "Ativo" : "Inativo"}</Badge>
            <div className="flex items-center gap-1 md:justify-end">
              <Button size="icon" variant="ghost" onClick={() => move(s, -1)} aria-label="Subir"><ArrowUp className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => move(s, 1)} aria-label="Descer"><ArrowDown className="w-4 h-4" /></Button>
              <Switch checked={s.active} onCheckedChange={() => toggleActive(s)} aria-label="Ativar serviço" />
              <Button size="icon" variant="ghost" onClick={() => openEdit(s)} aria-label="Editar"><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setToDelete(s)} aria-label="Excluir"><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={creating || !!editing} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar serviço" : "Novo serviço"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))} placeholder="Ex.: Troca de tela" />
            </div>
            <div className="space-y-1.5">
              <Label>Identificador (slug)</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="troca-de-tela" />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição (opcional)</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} />
              <Label>Serviço ativo no site</Label>
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
            <AlertDialogDescription>Serviços com preços vinculados são apenas desativados.</AlertDialogDescription>
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
