import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ClipboardList,
  FileText,
  PackageCheck,
  Truck,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays, startOfDay, endOfDay, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

/* ─── Period helpers ─── */
type PeriodKey = "today" | "yesterday" | "7d" | "15d" | "30d" | "custom";

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "yesterday", label: "Ontem" },
  { key: "7d", label: "7 dias" },
  { key: "15d", label: "15 dias" },
  { key: "30d", label: "30 dias" },
  { key: "custom", label: "Personalizado" },
];

function getRange(key: PeriodKey, customFrom?: Date, customTo?: Date): { from: Date; to: Date } {
  const now = new Date();
  switch (key) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": {
      const y = subDays(now, 1);
      return { from: startOfDay(y), to: endOfDay(y) };
    }
    case "7d":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "15d":
      return { from: startOfDay(subDays(now, 14)), to: endOfDay(now) };
    case "30d":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    case "custom":
      return {
        from: customFrom ? startOfDay(customFrom) : startOfDay(subDays(now, 29)),
        to: customTo ? endOfDay(customTo) : endOfDay(now),
      };
  }
}

function getPreviousRange(from: Date, to: Date) {
  const days = differenceInDays(to, from) + 1;
  return { from: subDays(from, days), to: subDays(from, 1) };
}

/* ─── Status config ─── */
const STATUS_COLORS: Record<string, string> = {
  pendente: "#f97316",
  em_andamento: "#eab308",
  concluido: "#22c55e",
  cancelado: "#ef4444",
};
const STATUS_LABELS: Record<string, string> = {
  pendente: "Aguardando",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

/* ─── Component ─── */
export default function AdminDashboard() {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);

  // Raw data
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [envios, setEnvios] = useState<any[]>([]);
  const [recebimentos, setRecebimentos] = useState<any[]>([]);

  // Previous period counts
  const [prevCounts, setPrevCounts] = useState({ pedidos: 0, orcamentos: 0, envios: 0, recebimentos: 0 });

  const range = useMemo(() => getRange(period, customFrom, customTo), [period, customFrom, customTo]);

  useEffect(() => {
    fetchData();
  }, [range.from.toISOString(), range.to.toISOString()]);

  const fetchData = async () => {
    setLoading(true);
    const fromISO = range.from.toISOString();
    const toISO = range.to.toISOString();
    const prev = getPreviousRange(range.from, range.to);

    const [pedRes, orcRes, envRes, recRes, prevPed, prevOrc, prevEnv, prevRec] = await Promise.all([
      supabase.from("pedidos").select("*").gte("created_at", fromISO).lte("created_at", toISO),
      supabase.from("orcamentos").select("*").gte("created_at", fromISO).lte("created_at", toISO),
      supabase.from("envios").select("*").gte("created_at", fromISO).lte("created_at", toISO),
      supabase.from("recebimentos").select("*").gte("created_at", fromISO).lte("created_at", toISO),
      supabase.from("pedidos").select("id", { count: "exact", head: true }).gte("created_at", prev.from.toISOString()).lte("created_at", prev.to.toISOString()),
      supabase.from("orcamentos").select("id", { count: "exact", head: true }).gte("created_at", prev.from.toISOString()).lte("created_at", prev.to.toISOString()),
      supabase.from("envios").select("id", { count: "exact", head: true }).gte("created_at", prev.from.toISOString()).lte("created_at", prev.to.toISOString()),
      supabase.from("recebimentos").select("id", { count: "exact", head: true }).gte("created_at", prev.from.toISOString()).lte("created_at", prev.to.toISOString()),
    ]);

    setPedidos(pedRes.data || []);
    setOrcamentos(orcRes.data || []);
    setEnvios(envRes.data || []);
    setRecebimentos(recRes.data || []);
    setPrevCounts({
      pedidos: prevPed.count || 0,
      orcamentos: prevOrc.count || 0,
      envios: prevEnv.count || 0,
      recebimentos: prevRec.count || 0,
    });
    setLoading(false);
  };

  /* ─── Derived data ─── */
  const counts = {
    pedidos: pedidos.length,
    orcamentos: orcamentos.length,
    envios: envios.length,
    recebimentos: recebimentos.length,
  };

  function pctChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : null;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Status distribution from pedidos
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    pedidos.forEach((p) => {
      const s = p.status || "pendente";
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([key, value]) => ({
      name: STATUS_LABELS[key] || key,
      value,
      color: STATUS_COLORS[key] || "#888",
    }));
  }, [pedidos]);

  const totalStatus = statusData.reduce((a, b) => a + b.value, 0);

  // Area chart data — group by day
  const areaData = useMemo(() => {
    const days = differenceInDays(range.to, range.from) + 1;
    const buckets: Record<string, { recebimentos: number; envios: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = subDays(range.to, days - 1 - i);
      const key = format(d, "dd/MM");
      buckets[key] = { recebimentos: 0, envios: 0 };
    }
    recebimentos.forEach((r) => {
      const key = format(new Date(r.data_chegada || r.created_at), "dd/MM");
      if (buckets[key]) buckets[key].recebimentos++;
    });
    envios.forEach((e) => {
      const key = format(new Date(e.data_envio || e.created_at), "dd/MM");
      if (buckets[key]) buckets[key].envios++;
    });
    return Object.entries(buckets).map(([date, v]) => ({ date, ...v }));
  }, [recebimentos, envios, range]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const items: { type: string; name: string; date: Date; icon: typeof ClipboardList; color: string }[] = [];
    pedidos.slice(0, 10).forEach((p) =>
      items.push({ type: "Novo pedido", name: p.nome || "Cliente", date: new Date(p.created_at), icon: ClipboardList, color: "text-primary" })
    );
    orcamentos.slice(0, 10).forEach((o) =>
      items.push({ type: "Orçamento gerado", name: o.cliente_nome, date: new Date(o.created_at), icon: FileText, color: "text-blue-400" })
    );
    envios.slice(0, 10).forEach((e) =>
      items.push({ type: "Envio registrado", name: e.cliente_nome, date: new Date(e.created_at), icon: Truck, color: "text-green-400" })
    );
    recebimentos.slice(0, 10).forEach((r) =>
      items.push({ type: "Recebimento", name: r.cliente_nome, date: new Date(r.created_at), icon: PackageCheck, color: "text-yellow-400" })
    );
    return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);
  }, [pedidos, orcamentos, envios, recebimentos]);

  function timeAgo(d: Date) {
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `há ${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `há ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `há ${days}d`;
  }

  /* ─── Cards config ─── */
  const cards = [
    { label: "Pedidos Recebidos", value: counts.pedidos, prev: prevCounts.pedidos, icon: ClipboardList },
    { label: "Orçamentos Gerados", value: counts.orcamentos, prev: prevCounts.orcamentos, icon: FileText },
    { label: "Envios Realizados", value: counts.envios, prev: prevCounts.envios, icon: Truck },
    { label: "Recebimentos", value: counts.recebimentos, prev: prevCounts.recebimentos, icon: PackageCheck },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold font-[Montserrat] uppercase tracking-wide">Dashboard</h1>

        <div className="flex flex-wrap items-center gap-1.5">
          {PERIODS.map((p) =>
            p.key === "custom" ? (
              <Popover key={p.key}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5",
                      period === "custom"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Calendar className="w-3 h-3" />
                    {p.label}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 space-y-3" align="end">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">De:</p>
                    <CalendarComponent
                      mode="single"
                      selected={customFrom}
                      onSelect={(d) => { setCustomFrom(d); if (d && customTo) setPeriod("custom"); }}
                      className="p-2 pointer-events-auto"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Até:</p>
                    <CalendarComponent
                      mode="single"
                      selected={customTo}
                      onSelect={(d) => { setCustomTo(d); if (d && customFrom) setPeriod("custom"); }}
                      className="p-2 pointer-events-auto"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!customFrom || !customTo}
                    onClick={() => setPeriod("custom")}
                  >
                    Aplicar
                  </Button>
                </PopoverContent>
              </Popover>
            ) : (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  period === p.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const pct = pctChange(c.value, c.prev);
          return (
            <div key={c.label} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">{c.label}</span>
                <c.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-bold font-[Montserrat]">{c.value}</p>
              <div className="flex items-center gap-1 text-xs">
                {pct === null ? (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Minus className="w-3 h-3" /> Sem dados anteriores
                  </span>
                ) : pct >= 0 ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {pct}% vs período anterior
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> {Math.abs(pct)}% vs período anterior
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Recebimentos vs Envios</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="gradRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradEnv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(0 0% 10%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="recebimentos" stroke="#f97316" strokeWidth={2} fill="url(#gradRec)" name="Recebimentos" />
              <Area type="monotone" dataKey="envios" stroke="#94a3b8" strokeWidth={2} fill="url(#gradEnv)" name="Envios" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Distribuição de Status</h3>
          {statusData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">Sem dados</p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-2xl font-bold font-[Montserrat]">{totalStatus}</p>
                    <p className="text-[10px] text-muted-foreground">total</p>
                  </div>
                </div>
              </div>
              <div className="w-full space-y-2">
                {statusData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-muted-foreground">{s.name}</span>
                    </div>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Atividades Recentes</h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className={cn("p-1.5 rounded-lg bg-secondary", a.color)}>
                  <a.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    <span className="font-medium">{a.type}</span>
                    <span className="text-muted-foreground"> — {a.name}</span>
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">{timeAgo(a.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
