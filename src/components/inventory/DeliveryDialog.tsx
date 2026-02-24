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
  const [address, setAddress] = useState("");
  const [referencePoint, setReferencePoint] = useState("");
  const [type, setType] = useState<"Casa" | "Apartamento">("Casa");
  const [floor, setFloor] = useState("");
  const [access, setAccess] = useState<"Escada" | "Elevador">("Escada");
  const [isSaving, setIsSaving] = useState(false);

  // Sincroniza o estado do formulário com o produto quando abre
  useEffect(() => {
    if (open) {
      setAddress(product.deliveryAddress || "");
      setReferencePoint(product.deliveryReferencePoint || "");
      setType(product.deliveryType || "Casa");
      setFloor(product.deliveryFloor || "");
      setAccess(product.deliveryAccess || "Escada");
      setIsSaving(false);
    }
  }, [open, product]);

  const handleSave = () => {
    if (!address.trim()) {
      alert("Preencha o endereço completo do cliente.");
      return;
    }
    if (type === "Apartamento" && !floor.trim()) {
      alert("Preencha o andar do apartamento.");
      return;
    }
    
    setIsSaving(true);
    
    // Salva o endereço no contexto
    setDeliveryInfo(
      product.id,
      address.trim(),
      (product.soldBy || "SISTEMA") as any,
      referencePoint || undefined,
      type,
      floor || undefined,
      type === "Apartamento" ? access : undefined
    );
    
    // Aguarda um pouco para garantir que o contexto foi atualizado
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 200);
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  const mapsQuery = encodeURIComponent(address || product.name + " " + (product.unit || ""));
  const embedSrc = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Endereço de Entrega</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Produto: <strong>{product.name}</strong> ({product.sku})
          </p>

          <div className="space-y-2">
            <Label>Endereço completo *</Label>
            <textarea
              className="w-full rounded-lg border bg-card/70 backdrop-blur-md px-3 py-2 text-sm min-h-20 resize-none border-white/20 dark:border-white/10 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Rua, número, bairro, cidade, estado, CEP"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label>Ponto de Referência (opcional)</Label>
            <input
              className="w-full rounded-lg border bg-card/70 backdrop-blur-md px-3 py-2 text-sm border-white/20 dark:border-white/10 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
              value={referencePoint}
              onChange={e => setReferencePoint(e.target.value)}
              placeholder="Ex: Próximo ao mercado, perto da praça, etc."
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Imóvel *</Label>
            <select
              className="w-full rounded-lg border bg-card/70 backdrop-blur-md px-3 py-2 text-sm border-white/20 dark:border-white/10 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
              value={type}
              onChange={e => setType(e.target.value as "Casa" | "Apartamento")}
              disabled={isSaving}
            >
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
            </select>
          </div>

          {type === "Apartamento" && (
            <>
              <div className="space-y-2">
                <Label>Andar *</Label>
                <input
                  className="w-full rounded-lg border bg-card/70 backdrop-blur-md px-3 py-2 text-sm border-white/20 dark:border-white/10 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
                  value={floor}
                  onChange={e => setFloor(e.target.value)}
                  placeholder="Ex: 3º, Cobertura, etc."
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label>Acesso *</Label>
                <select
                  className="w-full rounded-lg border bg-card/70 backdrop-blur-md px-3 py-2 text-sm border-white/20 dark:border-white/10 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
                  value={access}
                  onChange={e => setAccess(e.target.value as "Escada" | "Elevador")}
                  disabled={isSaving}
                >
                  <option value="Escada">Escada</option>
                  <option value="Elevador">Elevador</option>
                </select>
              </div>
            </>
          )}

          {address.trim() && (
            <div className="mt-2">
              <Label>Visualização no mapa</Label>
              <div className="h-48 w-full border rounded-md overflow-hidden mt-2 border-white/20 dark:border-white/10">
                <iframe title="map" src={embedSrc} width="100%" height="100%" style={{ border: 'none' }} />
              </div>
              <div className="mt-2">
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline hover:no-underline transition-smooth text-sm"
                >
                  Abrir no Google Maps
                </a>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Voltar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !address.trim()}>
            {isSaving ? "Salvando..." : "Salvar e Finalizar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
