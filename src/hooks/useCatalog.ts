import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbBrand {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
}

export interface DbDeviceModel {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
}

export interface DbRepairService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  sort_order: number;
}

export interface DbRepairPrice {
  id: string;
  device_model_id: string;
  repair_service_id: string;
  price: number;
  active: boolean;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const STALE = 30 * 1000;

export function useBrands(includeInactive = false) {
  return useQuery({
    queryKey: ["brands", includeInactive],
    staleTime: STALE,
    queryFn: async (): Promise<DbBrand[]> => {
      let q = supabase.from("brands").select("*").order("sort_order").order("name");
      if (!includeInactive) q = q.eq("active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as DbBrand[];
    },
  });
}

export function useDeviceModels(includeInactive = false) {
  return useQuery({
    queryKey: ["device_models", includeInactive],
    staleTime: STALE,
    queryFn: async (): Promise<DbDeviceModel[]> => {
      let q = supabase.from("device_models").select("*").order("sort_order").order("name");
      if (!includeInactive) q = q.eq("active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as DbDeviceModel[];
    },
  });
}

export function useRepairServices(includeInactive = false) {
  return useQuery({
    queryKey: ["repair_services", includeInactive],
    staleTime: STALE,
    queryFn: async (): Promise<DbRepairService[]> => {
      let q = supabase.from("repair_services").select("*").order("sort_order").order("name");
      if (!includeInactive) q = q.eq("active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as DbRepairService[];
    },
  });
}

export function useRepairPrices(includeInactive = false) {
  return useQuery({
    queryKey: ["repair_prices", includeInactive],
    staleTime: STALE,
    queryFn: async (): Promise<DbRepairPrice[]> => {
      let q = supabase.from("repair_prices").select("*");
      if (!includeInactive) q = q.eq("active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((p: any) => ({ ...p, price: Number(p.price) })) as DbRepairPrice[];
    },
  });
}

/** Prices for a single device model, joined with service data */
export function useModelPrices(deviceModelId: string | null, includeInactive = false) {
  return useQuery({
    queryKey: ["model_prices", deviceModelId, includeInactive],
    enabled: !!deviceModelId,
    staleTime: STALE,
    queryFn: async () => {
      let q = supabase
        .from("repair_prices")
        .select("*, repair_services(id, name, slug, active, sort_order)")
        .eq("device_model_id", deviceModelId!);
      if (!includeInactive) q = q.eq("active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? [])
        .map((p: any) => ({ ...p, price: Number(p.price) }))
        .sort((a: any, b: any) => (a.repair_services?.sort_order ?? 0) - (b.repair_services?.sort_order ?? 0));
    },
  });
}

export function useInvalidateCatalog() {
  const qc = useQueryClient();
  return () => {
    ["brands", "device_models", "repair_services", "repair_prices", "model_prices"].forEach((k) =>
      qc.invalidateQueries({ queryKey: [k] })
    );
  };
}

/** Registers an administrative action in admin_audit_logs. Never store secrets here. */
export async function logAdminAction(params: {
  action: string;
  table_name: string;
  record_id?: string | null;
  data_before?: unknown;
  data_after?: unknown;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("admin_audit_logs").insert({
      admin_id: user?.id ?? null,
      admin_email: user?.email ?? null,
      action: params.action,
      table_name: params.table_name,
      record_id: params.record_id ?? null,
      data_before: (params.data_before ?? null) as any,
      data_after: (params.data_after ?? null) as any,
    } as any);
  } catch (e) {
    console.warn("audit log failed", e);
  }
}

export function formatPriceInput(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

export function parsePriceInput(value: string): number {
  const n = parseFloat(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
