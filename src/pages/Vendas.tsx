import { AppLayout } from "@/components/layout/AppLayout";
import { useInventory } from "@/contexts/InventoryContext";
import { useMemo, useState } from "react";
import { SALES_USERS } from "@/types/inventory";
import { SalesChart } from "@/components/vendas/SalesChart";
import { SalesRanking } from "@/components/vendas/SalesRanking";
import { SalesHistory } from "@/components/vendas/SalesHistory";
import { format } from "date-fns";

export default function Vendas() {
  const { products } = useInventory();
  const [selectedSeller, setSelectedSeller] = useState<string | "Todos">("Todos");
  const [mode, setMode] = useState<"dias" | "meses">("dias");

  const sales = useMemo(() => products.filter(p => p.status === "Vendido" && p.soldAt), [products]);

  const filtered = useMemo(() => selectedSeller === "Todos" ? sales : sales.filter(s => s.soldBy === selectedSeller), [sales, selectedSeller]);

  return (
    <AppLayout>
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Vendas</h1>
            <p className="text-muted-foreground">Ambiente de vendas — informações e ranking</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 rounded-md bg-card" value={selectedSeller} onChange={e => setSelectedSeller(e.target.value as any)}>
              <option value="Todos">Todos os vendedores</option>
              {SALES_USERS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <div className="bg-card rounded-md px-2 py-1 flex gap-1">
              <button className={`px-3 py-1 rounded ${mode === 'dias' ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setMode('dias')}>Dias</button>
              <button className={`px-3 py-1 rounded ${mode === 'meses' ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setMode('meses')}>Meses</button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border bg-card p-4">
            <SalesChart data={filtered} mode={mode} />
          </div>
          <div className="rounded-xl border bg-card p-4">
            <SalesRanking sales={sales} selected={selectedSeller === 'Todos' ? undefined : selectedSeller} />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <SalesHistory sales={filtered} />
        </div>
      </div>
    </AppLayout>
  );
}
