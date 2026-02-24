import React, { useMemo, useState } from "react";
import { Product } from "@/types/inventory";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ELEGANT_COLORS = [
  "#F59E0B", "#EC4899", "#8B5CF6", "#3B82F6", "#06B6D4",
  "#10B981", "#F97316", "#EF4444", "#6366F1", "#14B8A6",
  "#D946EF", "#0EA5E9", "#84CC16", "#F43F5E", "#A78BFA",
];

export function SalesChart({ data, mode }: { data: Product[]; mode: "dias" | "meses" }) {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const series = useMemo(() => {
    const map = new Map<string, { value: number; products: Product[] }>();
    data.forEach(d => {
      if (!d.soldAt) return;
      const date = parseISO(d.soldAt);
      const key = mode === "dias" ? format(date, "yyyy-MM-dd") : format(date, "yyyy-MM");
      const prev = map.get(key) || { value: 0, products: [] };
      prev.value += d.soldPrice || 0;
      prev.products.push(d);
      map.set(key, prev);
    });
    const arr = Array.from(map.entries()).map(([k, v], idx) => ({
      label: k,
      value: v.value,
      products: v.products,
      color: ELEGANT_COLORS[idx % ELEGANT_COLORS.length],
    }));
    arr.sort((a, b) => a.label.localeCompare(b.label));
    return arr;
  }, [data, mode]);

  const selectedData = selectedPeriod
    ? series.find(s => s.label === selectedPeriod)
    : null;

  return (
    <>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart
            data={series}
            margin={{ top: 12, right: 12, left: 0, bottom: 24 }}
            onClick={(state) => {
              if (state && state.activeLabel) {
                setSelectedPeriod(state.activeLabel as string);
                setModalOpen(true);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickFormatter={(v) => (mode === "dias" ? v.slice(5) : v)}
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                value?.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              }
              cursor={{ fill: "rgba(255,255,255,0.1)" }}
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {series.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={selectedPeriod && selectedPeriod !== entry.label ? 0.4 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Clique em uma barra para ver detalhes</p>

      {selectedData && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Vendas de {mode === "dias" ? "dia" : "mês"}: {selectedData.label}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm font-medium">Total vendido:</span>
                <span className="text-lg font-semibold">
                  {selectedData.value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              {selectedData.products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border bg-muted/30 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {p.name} <span className="text-xs text-muted-foreground">({p.sku})</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Vendedor: <strong>{p.soldBy}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Local: <strong>{p.soldUnit}</strong>
                      </p>
                      {p.deliveryAddress && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Entrega: <strong>{p.deliveryAddress}</strong> • {p.deliveryStatus}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {p.soldPrice && (
                        <p className="font-semibold text-sm">
                          {p.soldPrice.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
