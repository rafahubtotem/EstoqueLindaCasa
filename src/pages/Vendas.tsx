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
      <div className="container py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Vendas</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Ambiente de vendas — informações e ranking</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <select className="px-3 py-2 rounded-md bg-card/70 backdrop-blur-md border border-white/20 dark:border-white/10 transition-smooth text-sm w-full sm:w-auto" value={selectedSeller} onChange={e => setSelectedSeller(e.target.value as any)}>
              <option value="Todos">Todos os vendedores</option>
              {SALES_USERS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <div className="bg-card/70 backdrop-blur-md rounded-md px-2 py-1 flex gap-1 border border-white/20 dark:border-white/10 w-full sm:w-auto">
              <button className={`px-3 py-1 rounded text-sm font-medium transition-smooth flex-1 sm:flex-none ${mode === 'dias' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`} onClick={() => setMode('dias')}>Dias</button>
              <button className={`px-3 py-1 rounded text-sm font-medium transition-smooth flex-1 sm:flex-none ${mode === 'meses' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`} onClick={() => setMode('meses')}>Meses</button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border bg-card/70 backdrop-blur-md p-3 sm:p-4 border-white/20 dark:border-white/10">
            <SalesChart data={filtered} mode={mode} />
          </div>
          <div className="rounded-xl border bg-card/70 backdrop-blur-md p-3 sm:p-4 border-white/20 dark:border-white/10">
            <SalesRanking sales={sales} selected={selectedSeller === 'Todos' ? undefined : selectedSeller} />
          </div>
        </div>

        <div className="rounded-xl border bg-card/70 backdrop-blur-md p-3 sm:p-4 border-white/20 dark:border-white/10">
          <SalesHistory sales={filtered} />
        </div>
      </div>
    </AppLayout>
  );
}
