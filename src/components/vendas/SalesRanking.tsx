import React, { useMemo } from "react";
import { Product } from "@/types/inventory";
import { SALES_USERS } from "@/types/inventory";

export function SalesRanking({ sales, selected }: { sales: Product[]; selected?: string }) {
  const totals = useMemo(() => {
    const map = new Map<string, number>();
    SALES_USERS.forEach(u => map.set(u, 0));
    sales.forEach(s => {
      if (!s.soldBy) return;
      const prev = map.get(s.soldBy) || 0;
      map.set(s.soldBy, prev + (s.soldPrice || 0));
    });
    const arr = Array.from(map.entries()).map(([user, total]) => ({ user, total }));
    arr.sort((a, b) => b.total - a.total);
    return arr;
  }, [sales]);

  const list = selected ? totals.filter(t => t.user === selected) : totals;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Ranking de Vendas</h3>
      <div className="space-y-2">
        {list.map((t, i) => (
          <div key={t.user} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${i===0 ? 'bg-yellow-500' : i===1 ? 'bg-slate-400' : 'bg-slate-600'}`}>
                {i+1}
              </div>
              <div>
                <div className="font-medium">{t.user}</div>
                <div className="text-xs text-muted-foreground">Total vendido</div>
              </div>
            </div>
            <div className="font-semibold">{t.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
