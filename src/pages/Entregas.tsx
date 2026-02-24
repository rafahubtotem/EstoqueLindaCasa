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
    <div key={p.id} className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">Produto</div>
          <div className="font-semibold">{p.name} ({p.sku})</div>
          <div className="text-sm mt-2 space-y-1">
            <div>Endereço: <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.deliveryAddress || "")}`} target="_blank" rel="noreferrer" className="text-primary underline">{p.deliveryAddress}</a></div>
            {p.deliveryReferencePoint && <div>Ponto de Referência: <strong>{p.deliveryReferencePoint}</strong></div>}
            <div>Tipo: <strong>{p.deliveryType || "Não informado"}</strong></div>
            {p.deliveryType === "Apartamento" && (
              <>
                <div>Andar: <strong>{p.deliveryFloor || "Não informado"}</strong></div>
                <div>Acesso: <strong>{p.deliveryAccess || "Não informado"}</strong></div>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-sm">Status: <strong>{p.deliveryStatus}</strong></div>
          {p.deliveryStatus !== "Entregue" && (
            <div className="flex gap-2">
              {expandable && <Button variant="outline" onClick={() => { setDelivering(delivering === p.id ? null : p.id); }}>Ver mapa</Button>}
              <Button onClick={() => { markDelivered(p.id, "ANA"); }}>Marcar como entregue</Button>
            </div>
          )}
        </div>
      </div>
      {expandable && delivering === p.id && (
        <div className="mt-3">
          <iframe title="map-details" src={`https://www.google.com/maps?q=${encodeURIComponent(p.deliveryAddress || "")}&output=embed`} width="100%" height={240} />
          <div className="mt-2 flex gap-2">
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.deliveryAddress || "")}`} target="_blank" rel="noreferrer" className="text-primary underline">Abrir no Maps</a>
            <Button variant="ghost" onClick={() => setDelivering(null)}>Fechar</Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="container py-6">
        <h1 className="font-display text-2xl mb-6">Entregas</h1>

        {/* Entregas Pendentes */}
        <div className="mb-8">
          <h2 className="font-semibold text-lg mb-3">Entregas Pendentes ({entregasPendentes.length})</h2>
          {entregasPendentes.length === 0 ? (
            <div className="rounded-lg border bg-card p-4 text-muted-foreground">Nenhuma entrega pendente.</div>
          ) : (
            <div className="grid gap-3">
              {entregasPendentes.map(p => renderEntrega(p, true))}
            </div>
          )}
        </div>

        {/* Histórico de Entregas */}
        {historicoEntregas.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg mb-3">Histórico de Entregas ({historicoEntregas.length})</h2>
            <div className="grid gap-3">
              {historicoEntregas.map(p => renderEntrega(p, false))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
