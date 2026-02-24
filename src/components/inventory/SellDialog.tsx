import { useState, useEffect } from "react";
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
  const { updateProductStatus, products, setDeliveryInfo } = useInventory();
  const [sellerUser, setSellerUser] = useState<SystemUser>("ANA");
  const [sellUnit, setSellUnit] = useState<StoreUnit>(product.unit);
  const [price, setPrice] = useState<number | "">(product.soldPrice ?? "");
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [showSellForm, setShowSellForm] = useState(true);
  const [localOpen, setLocalOpen] = useState(open);
  // Campos do formulário de entrega (inline)
  const [address, setAddress] = useState("");
  const [referencePoint, setReferencePoint] = useState("");
  const [type, setType] = useState<"Casa" | "Apartamento">("Casa");
  const [floor, setFloor] = useState("");
  const [access, setAccess] = useState<"Escada" | "Elevador">("Escada");
  const [isSaving, setIsSaving] = useState(false);

  // Sincroniza o estado local com o prop externo
  useEffect(() => {
    setLocalOpen(open);
    if (open) {
      setShowSellForm(true);
      setDeliveryOpen(false);
    }
  }, [open]);

  const handleSell = () => {
    // Marca como vendido no contexto
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
    
    // Abre imediatamente o formulário de entrega (evita problemas de timing)
    setShowSellForm(false);
    setDeliveryOpen(true);
    // inicializa campos de entrega a partir do produto atual (não depende do contexto async)
    setAddress(product.deliveryAddress || "");
    setReferencePoint(product.deliveryReferencePoint || "");
    setType((product.deliveryType as any) || "Casa");
    setFloor(product.deliveryFloor || "");
    setAccess((product.deliveryAccess as any) || "Escada");
  };

  const handleDeliveryClose = () => {
    // Quando fecha o diálogo de entrega, fecha tudo
    setShowSellForm(true);
    setDeliveryOpen(false);
    setLocalOpen(false);
    onOpenChange(false);
  };

  // Busca o produto atualizado do contexto
  const updatedProduct = products.find(p => p.id === product.id) || product;

  return (
    <>
      <Dialog open={localOpen} onOpenChange={(newOpen) => {
        if (!newOpen) {
          setLocalOpen(false);
          onOpenChange(false);
        }
      }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          {showSellForm ? (
            <>
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
                    className="w-full rounded-lg border bg-card/70 backdrop-blur-md px-3 py-2 text-sm border-white/20 dark:border-white/10 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
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
                    className="w-full rounded-lg border bg-card/70 backdrop-blur-md px-3 py-2 text-sm border-white/20 dark:border-white/10 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
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
                    className="w-full rounded-lg border bg-card/70 backdrop-blur-md px-3 py-2 text-sm border-white/20 dark:border-white/10 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setLocalOpen(false);
                  onOpenChange(false);
                }}>Cancelar</Button>
                <Button onClick={handleSell} disabled={!price || (typeof price === "number" && price <= 0)}>Próximo: Endereço</Button>
              </DialogFooter>
            </>
          ) : (
            // Formulário de entrega inline dentro do mesmo modal
            <>
              <DialogHeader>
                <DialogTitle className="font-display">Endereço de Entrega</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground">
                  Produto: <strong>{updatedProduct.name}</strong> ({updatedProduct.sku})
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
                      <iframe title="map" src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`} width="100%" height="100%" style={{ border: 'none' }} />
                    </div>
                    <div className="mt-2">
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="text-primary underline hover:no-underline transition-smooth text-sm">Abrir no Google Maps</a>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  // Voltar para o formulário de venda
                  setShowSellForm(true);
                }} disabled={isSaving}>Voltar</Button>
                <Button onClick={() => {
                  // Salvar endereço e fechar tudo
                  if (!address.trim()) { alert('Preencha o endereço completo do cliente.'); return; }
                  if (type === 'Apartamento' && !floor.trim()) { alert('Preencha o andar do apartamento.'); return; }
                  setIsSaving(true);
                  // Passa o vendedor selecionado como user
                  setDeliveryInfo(
                    product.id,
                    address.trim(),
                    sellerUser,
                    referencePoint || undefined,
                    type,
                    floor || undefined,
                    type === 'Apartamento' ? access : undefined
                  );
                  // Fecha imediatamente (setDeliveryInfo atualiza estado sincrono localmente)
                  setIsSaving(false);
                  setShowSellForm(true);
                  setLocalOpen(false);
                  onOpenChange(false);
                }} disabled={isSaving || !address.trim()}>
                  {isSaving ? 'Salvando...' : 'Salvar e Finalizar'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
