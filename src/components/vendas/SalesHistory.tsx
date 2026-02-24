import React from "react";
import { Product } from "@/types/inventory";

export function SalesHistory({ sales }: { sales: Product[] }) {
  if (sales.length === 0) return <div className="text-sm text-muted-foreground">Nenhuma venda encontrada.</div>;

  return (
    <div>
      <h3 className="font-semibold mb-3">Histórico de Vendas</h3>
      <div className="space-y-3">
        {sales.map(s => (
          <div key={s.id} className="rounded-lg border bg-muted/10 p-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium">{s.name} <span className="text-xs text-muted-foreground">({s.sku})</span></div>
                <div className="text-xs text-muted-foreground">Vendido por <strong>{s.soldBy}</strong> em {s.soldAt ? new Date(s.soldAt).toLocaleString('pt-BR') : '—'}</div>
                {s.soldPrice !== undefined && <div className="text-sm mt-1 font-semibold">{s.soldPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>}
                {s.deliveryAddress && (
                  <div className="text-xs text-muted-foreground mt-1">Entrega: {s.deliveryAddress} • Status: {s.deliveryStatus}</div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{s.soldUnit}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
