import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, FileText, PackageCheck, Truck, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface Stats {
  totalPedidos: number;
  totalOrcamentos: number;
  totalEnvios: number;
  totalRecebimentos: number;
}

const STATUS_COLORS: Record<string, string> = {
  pendente: "#eab308",
  em_andamento: "#3b82f6",
  concluido: "#22c55e",
  cancelado: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalPedidos: 0, totalOrcamentos: 0, totalEnvios: 0, totalRecebimentos: 0 });
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; recebimentos: number; envios: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Fetch all in parallel
    const [pedidosRes, orcamentosRes, enviosRes, recebimentosRes, allPedidosRes] = await Promise.all([
      supabase.from("pedidos").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth),
      supabase.from("orcamentos").select("id", { count: "exact", head: true }),
      supabase.from("envios").select("id", { count: "exact", head: true }),
      supabase.from("recebimentos").select("id", { count: "exact", head: true }),
      supabase.from("pedidos").select("status, created_at"),
    ]);

    setStats({
      totalPedidos: pedidosRes.count || 0,
      totalOrcamentos: orcamentosRes.count || 0,
      totalEnvios: enviosRes.count || 0,
      totalRecebimentos: recebimentosRes.count || 0,
    });

    // Status distribution
    const pedidos = allPedidosRes.data || [];
    const statusCount: Record<string, number> = {};
    pedidos.forEach((p: any) => {
      const s = p.status || "pendente";
      statusCount[s] = (statusCount[s] || 0) + 1;
    });
    setStatusData(
      Object.entries(statusCount).map(([key, value]) => ({
        name: STATUS_LABELS[key] || key,
        value,
        color: STATUS_COLORS[key] || "#888",
      }))
    );

    // Monthly data (last 6 months)
    const months: { month: string; recebimentos: number; envios: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      months.push({ month: label, recebimentos: 0, envios: 0 });
    }

    // Simple approach: count from recebimentos/envios tables
    const [recData, envData] = await Promise.all([
      supabase.from("recebimentos").select("data_chegada"),
      supabase.from("envios").select("data_envio"),
    ]);

    (recData.data || []).forEach((r: any) => {
      const d = new Date(r.data_chegada);
      const idx = months.findIndex((m, i) => {
        const md = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return d.getMonth() === md.getMonth() && d.getFullYear() === md.getFullYear();
      });
      if (idx >= 0) months[idx].recebimentos++;
    });

    (envData.data || []).forEach((e: any) => {
      const d = new Date(e.data_envio);
      const idx = months.findIndex((m, i) => {
        const md = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return d.getMonth() === md.getMonth() && d.getFullYear() === md.getFullYear();
      });
      if (idx >= 0) months[idx].envios++;
    });

    setMonthlyData(months);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { label: "Pedidos (mês)", value: stats.totalPedidos, icon: ClipboardList, color: "text-primary" },
    { label: "Orçamentos", value: stats.totalOrcamentos, icon: FileText, color: "text-blue-400" },
    { label: "Envios", value: stats.totalEnvios, icon: Truck, color: "text-green-400" },
    { label: "Recebimentos", value: stats.totalRecebimentos, icon: PackageCheck, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-[Montserrat] uppercase tracking-wide">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">{c.label}</span>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <p className={`text-2xl font-bold font-[Montserrat] ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Recebimentos vs Envios (6 meses)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }}
              />
              <Bar dataKey="recebimentos" fill="#eab308" radius={[4, 4, 0, 0]} name="Recebimentos" />
              <Bar dataKey="envios" fill="#22c55e" radius={[4, 4, 0, 0]} name="Envios" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Distribuição de Status</h3>
          {statusData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">Sem dados</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={3}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }} />
                <Legend
                  formatter={(value: string) => <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
