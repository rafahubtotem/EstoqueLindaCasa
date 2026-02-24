import { useState } from "react";
import { Product, StoreUnit, SystemUser, SALES_USERS } from "@/types/inventory";
import { useInventory } from "@/contexts/InventoryContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DeliveryDialog } from "./DeliveryDialog";

const units: StoreUnit[] = ["Shopping Praça Nova", "Camobi", "Estoque"];

interface SellDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SellDialog({ product, open, onOpenChange }: SellDialogProps) {
  const { updateProductStatus } = useInventory();
  const [sellerUser, setSellerUser] = useState<SystemUser>("ANA");
  const [sellUnit, setSellUnit] = useState<StoreUnit>(product.unit);
  const [price, setPrice] = useState<number | "">(product.soldPrice ?? "");
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [showSellForm, setShowSellForm] = useState(true);

  const handleSell = () => {
    updateProductStatus(
      product.id,
      "Vendido",
      sellerUser,
      `Vendido na unidade ${sellUnit}`,
      sellerUser,
      sellUnit,
      undefined,
      typeof price === "number" && !isNaN(price) ? price : undefined,
    );
    // Oculta formulário de venda e abre diálogo de entrega
    setShowSellForm(false);
    setDeliveryOpen(true);
  };

  const handleDeliveryClose = () => {
    // Quando fecha o diálogo de entrega, fecha tudo
    setShowSellForm(true);
    setDeliveryOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && showSellForm} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Registrar Venda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Produto: <strong>{product.name}</strong> ({product.sku})
            </p>
            <div className="space-y-2">
              <Label htmlFor="seller">Quem realizou a venda? *</Label>
              <select
                id="seller"
                value={sellerUser}
                onChange={e => setSellerUser(e.target.value as SystemUser)}
                className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {SALES_USERS.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Local da venda</Label>
              <select
                id="unit"
                value={sellUnit}
                onChange={e => setSellUnit(e.target.value as StoreUnit)}
                className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço de Venda (R$) *</Label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price as any}
                onChange={e => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ex: 1299.90"
                className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSell} disabled={!price || (typeof price === "number" && price <= 0)}>Próximo: Endereço</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeliveryDialog product={product} open={deliveryOpen} onClose={handleDeliveryClose} />
    </>
  );
}
