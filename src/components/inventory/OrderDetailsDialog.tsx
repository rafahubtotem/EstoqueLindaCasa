import { useState } from "react";
import { SystemUser, SYSTEM_USERS, OrderDetails } from "@/types/inventory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

interface OrderDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (user: SystemUser, orderDetails: OrderDetails, reason: string) => void;
}

export function OrderDetailsDialog({
  open,
  onClose,
  onConfirm,
}: OrderDetailsDialogProps) {
  const [selectedUser, setSelectedUser] = useState<SystemUser>("ANA");
  const [orderDate, setOrderDate] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!selectedUser) {
      alert("Por favor, selecione um usuário");
      return;
    }
    if (!orderDate) {
      alert("Data do pedido é obrigatória");
      return;
    }
    if (!expectedDate) {
      alert("Data esperada de chegada é obrigatória");
      return;
    }

    const orderDetails: OrderDetails = {
      orderDate: new Date(orderDate).toISOString(),
      expectedDate: new Date(expectedDate).toISOString(),
    };

    onConfirm(selectedUser, orderDetails, reason);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setOrderDate("");
    setExpectedDate("");
    setReason("");
    setSelectedUser("ANA");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pedido para Fábrica</DialogTitle>
          <DialogDescription>
            Informe as datas do pedido e a previsão de chegada no estoque
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="user">Quem está registrando o pedido? *</Label>
            <select
              id="user"
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value as SystemUser)}
              className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SYSTEM_USERS.map(u => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data do Pedido *
            </Label>
            <Input
              id="orderDate"
              type="date"
              value={orderDate}
              onChange={e => setOrderDate(e.target.value)}
              className="text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data Esperada de Chegada *
            </Label>
            <Input
              id="expectedDate"
              type="date"
              value={expectedDate}
              onChange={e => setExpectedDate(e.target.value)}
              className="text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Observação (opcional)</Label>
            <Input
              id="reason"
              placeholder="Ex: Pedido referente ao reabastecimento de sofás..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Registrar Pedido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
