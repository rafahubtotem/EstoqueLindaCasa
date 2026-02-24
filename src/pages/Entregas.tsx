import { useInventory } from "@/contexts/InventoryContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function Entregas() {
  const { products, markDelivered } = useInventory();
  const [delivering, setDelivering] = useState<string | null>(null);

  const entregasPendentes = products.filter(p => p.deliveryAddress && p.deliveryStatus !== "Entregue");
  const historicoEntregas = products.filter(p => p.deliveryAddress && p.deliveryStatus === "Entregue");

  const renderEntrega = (p: any, expandable: boolean = true) => (
    <div key={p.id} className="p-3 sm:p-4 border rounded-lg bg-card/70 backdrop-blur-md border-white/20 dark:border-white/10 transition-smooth hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs sm:text-sm text-muted-foreground">Produto</div>
          <div className="font-semibold text-sm sm:text-base truncate">{p.name} ({p.sku})</div>
          <div className="text-xs sm:text-sm mt-2 space-y-1 break-words">
            <div>Endereço: <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.deliveryAddress || "")}`} target="_blank" rel="noreferrer" className="text-primary underline hover:no-underline transition-smooth">{p.deliveryAddress}</a></div>
            {p.deliveryReferencePoint && <div>Ponto de Referência: <strong>{p.deliveryReferencePoint}</strong></div>}
            {p.soldBy && <div>Vendedor: <strong>{p.soldBy}</strong></div>}
            {p.soldAt && <div>Data da Venda: <strong>{new Date(p.soldAt).toLocaleString("pt-BR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</strong></div>}
            <div>Tipo: <strong>{p.deliveryType || "Não informado"}</strong></div>
            {p.deliveryType === "Apartamento" && (
              <>
                <div>Andar: <strong>{p.deliveryFloor || "Não informado"}</strong></div>
                <div>Acesso: <strong>{p.deliveryAccess || "Não informado"}</strong></div>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
          <div className="text-xs sm:text-sm">Status: <strong>{p.deliveryStatus}</strong></div>
          {p.deliveryStatus !== "Entregue" && (
            <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
              {expandable && <Button variant="outline" className="text-xs sm:text-sm w-full sm:w-auto" onClick={() => { setDelivering(delivering === p.id ? null : p.id); }}>Ver mapa</Button>}
              <Button className="text-xs sm:text-sm w-full sm:w-auto" onClick={() => { markDelivered(p.id, "ANA"); }}>Entregue</Button>
            </div>
          )}
        </div>
      </div>
      {expandable && delivering === p.id && (
        <div className="mt-3">
          <iframe title="map-details" src={`https://www.google.com/maps?q=${encodeURIComponent(p.deliveryAddress || "")}&output=embed`} width="100%" height={240} className="rounded-lg" />
          <div className="mt-2 flex gap-2 flex-col sm:flex-row">
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.deliveryAddress || "")}`} target="_blank" rel="noreferrer" className="text-primary underline text-xs sm:text-sm hover:no-underline transition-smooth">Abrir no Maps</a>
            <Button variant="ghost" className="text-xs sm:text-sm w-full sm:w-auto" onClick={() => setDelivering(null)}>Fechar</Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="container py-4 sm:py-6 space-y-6 sm:space-y-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-4">Entregas</h1>

        {/* Entregas Pendentes */}
        <div>
          <h2 className="font-semibold text-lg sm:text-xl mb-3 sm:mb-4">Entregas Pendentes ({entregasPendentes.length})</h2>
          {entregasPendentes.length === 0 ? (
            <div className="rounded-lg border bg-card/70 backdrop-blur-md p-3 sm:p-4 text-muted-foreground border-white/20 dark:border-white/10">Nenhuma entrega pendente.</div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {entregasPendentes.map(p => renderEntrega(p, true))}
            </div>
          )}
        </div>

        {/* Histórico de Entregas */}
        {historicoEntregas.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg sm:text-xl mb-3 sm:mb-4">Histórico de Entregas ({historicoEntregas.length})</h2>
            <div className="grid gap-3 sm:gap-4">
              {historicoEntregas.map(p => renderEntrega(p, false))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
