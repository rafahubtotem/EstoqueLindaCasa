import { useState } from "react";
import { SystemUser, SYSTEM_USERS } from "@/types/inventory";
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

interface UserSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (user: SystemUser, reason: string) => void;
  title: string;
  description: string;
  action: string;
}

export function UserSelectionDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  action,
}: UserSelectionDialogProps) {
  const [selectedUser, setSelectedUser] = useState<SystemUser>("ANA");
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!selectedUser) {
      alert("Por favor, selecione um usuário");
      return;
    }
    onConfirm(selectedUser, reason);
    setReason("");
    onClose();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="user">Quem está realizando {action}? *</Label>
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
            <Label htmlFor="reason">Motivo/Observação (opcional)</Label>
            <Input
              id="reason"
              placeholder="Ex: Produto danificado, cliente solicitou transferência..."
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
          <Button onClick={handleConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
