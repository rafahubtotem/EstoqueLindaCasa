import { useState } from "react";
import { Product, ProductStatus, StoreUnit, SystemUser } from "@/types/inventory";
import { useInventory } from "@/contexts/InventoryContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, ShoppingBag, Trash2, Edit } from "lucide-react";
import { SellDialog } from "./SellDialog";
import { UserSelectionDialog } from "./UserSelectionDialog";
import { OrderDetailsDialog } from "./OrderDetailsDialog";
import { EditProductDialog } from "./EditProductDialog";

const statuses: ProductStatus[] = ["Disponível", "Vendido", "Pedido", "Reservado"];
const units: StoreUnit[] = ["Shopping Praça Nova", "Camobi", "Estoque"];

export function ProductActions({ product }: { product: Product }) {
  const { updateProductStatus, transferProduct, deleteProduct } = useInventory();
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "status" | "transfer";
    value: ProductStatus | StoreUnit;
  } | null>(null);

  const handleStatusChange = (status: ProductStatus) => {
    if (status === "Vendido") {
      setShowSellDialog(true);
      return;
    }
    setPendingAction({ type: "status", value: status });
    setShowUserDialog(true);
  };

  const handleTransfer = (unit: StoreUnit) => {
    setPendingAction({ type: "transfer", value: unit });
    setShowUserDialog(true);
  };

  const handleConfirmAction = (user: SystemUser, reason: string) => {
    if (!pendingAction) return;

    if (pendingAction.type === "status") {
      updateProductStatus(product.id, pendingAction.value as ProductStatus, user, reason);
    } else if (pendingAction.type === "transfer") {
      transferProduct(product.id, pendingAction.value as StoreUnit, user, reason);
    }

    setPendingAction(null);
  };

  const handleDelete = () => {
    // Apenas ADMIN pode deletar
    const confirmed = confirm("Tem certeza que deseja deletar este produto? Apenas administradores podem fazer isso.");
    if (confirmed) {
      const success = deleteProduct(product.id, "ADMIN");
      if (!success) {
        alert("Apenas administradores podem deletar produtos.");
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 px-3 flex items-center gap-2 whitespace-nowrap">
            <span className="hidden md:inline">editar status do produto</span>
            <span className="md:hidden text-sm">editar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-50 w-48 bg-popover">
          <div onClick={e => e.stopPropagation()} className="px-2 py-1.5">
            <EditProductDialog product={product} />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Alterar status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-popover">
              {statuses.filter(s => s !== product.status).map(status => (
                <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Transferir
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-popover">
              {units.filter(u => u !== product.unit).map(unit => (
                <DropdownMenuItem key={unit} onClick={() => handleTransfer(unit)}>
                  {unit}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar produto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SellDialog
        product={product}
        open={showSellDialog}
        onOpenChange={setShowSellDialog}
      />
      <OrderDetailsDialog
        open={showOrderDialog}
        onClose={() => {
          setShowOrderDialog(false);
          setPendingAction(null);
        }}
        onConfirm={(user, orderDetails, reason) => {
          if (pendingAction?.type === "status") {
            updateProductStatus(product.id, pendingAction.value as ProductStatus, user, reason, undefined, undefined, orderDetails);
          }
          setShowOrderDialog(false);
          setPendingAction(null);
        }}
      />
      <UserSelectionDialog
        open={showUserDialog}
        onClose={() => {
          setShowUserDialog(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={
          pendingAction?.type === "status"
            ? `Alterar status para ${pendingAction.value}`
            : `Transferir para ${pendingAction?.value}`
        }
        description={
          pendingAction?.type === "status"
            ? "Informe quem está realizando esta alteração de status"
            : "Informe quem está realizando esta transferência"
        }
        action={pendingAction?.type === "status" ? "a alteração de status" : "a transferência"}
      />
    </>
  );
}
