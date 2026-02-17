import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useInventory } from "@/contexts/InventoryContext";
import { Product } from "@/types/inventory";

interface DeliveryDialogProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

export function DeliveryDialog({ product, open, onClose }: DeliveryDialogProps) {
  const { setDeliveryInfo } = useInventory();
  const [address, setAddress] = useState(product.deliveryAddress || "");
  const [referencePoint, setReferencePoint] = useState(product.deliveryReferencePoint || "");
  const [type, setType] = useState<"Casa" | "Apartamento">(product.deliveryType || "Casa");
  const [floor, setFloor] = useState(product.deliveryFloor || "");
  const [access, setAccess] = useState<"Escada" | "Elevador">(product.deliveryAccess || "Escada");

  useEffect(() => {
    setAddress(product.deliveryAddress || "");
    setReferencePoint(product.deliveryReferencePoint || "");
    setType(product.deliveryType || "Casa");
    setFloor(product.deliveryFloor || "");
    setAccess(product.deliveryAccess || "Escada");
  }, [product]);

  const save = () => {
    if (!address.trim()) {
      alert("Preencha o endereço completo do cliente.");
      return;
    }
    if (type === "Apartamento" && !floor.trim()) {
      alert("Preencha o andar do apartamento.");
      return;
    }
    setDeliveryInfo(product.id, address.trim(), referencePoint || undefined, type, floor || undefined, type === "Apartamento" ? access : undefined);
    onClose();
  };

  const mapsQuery = encodeURIComponent(address || product.name + " " + (product.unit || ""));
  const embedSrc = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Endereço de Entrega</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">Produto: <strong>{product.name}</strong> ({product.sku})</p>

          <div className="space-y-2">
            <Label>Endereço completo *</Label>
            <textarea className="w-full rounded-lg border bg-card px-3 py-2 text-sm min-h-20 resize-none" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, número, bairro, cidade, estado, CEP" />
          </div>

          <div className="space-y-2">
            <Label>Ponto de Referência (opcional)</Label>
            <input className="w-full rounded-lg border bg-card px-3 py-2 text-sm" value={referencePoint} onChange={e => setReferencePoint(e.target.value)} placeholder="Ex: Próximo ao mercado, perto da praça, etc." />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Imóvel *</Label>
            <select className="w-full rounded-lg border bg-card px-3 py-2 text-sm" value={type} onChange={e => setType(e.target.value as "Casa" | "Apartamento")}>
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
            </select>
          </div>

          {type === "Apartamento" && (
            <>
              <div className="space-y-2">
                <Label>Andar *</Label>
                <input className="w-full rounded-lg border bg-card px-3 py-2 text-sm" value={floor} onChange={e => setFloor(e.target.value)} placeholder="Ex: 3º, Cobertura, etc." />
              </div>

              <div className="space-y-2">
                <Label>Acesso *</Label>
                <select className="w-full rounded-lg border bg-card px-3 py-2 text-sm" value={access} onChange={e => setAccess(e.target.value as "Escada" | "Elevador")}>
                  <option value="Escada">Escada</option>
                  <option value="Elevador">Elevador</option>
                </select>
              </div>
            </>
          )}

          {address.trim() && (
            <div className="mt-2">
              <Label>Visualização no mapa</Label>
              <div className="h-48 w-full border rounded-md overflow-hidden mt-2">
                <iframe title="map" src={embedSrc} width="100%" height="100%" />
              </div>
              <div className="mt-2">
                <a href={mapsLink} target="_blank" rel="noreferrer" className="text-primary underline">Abrir no Google Maps</a>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Salvar Endereço</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
