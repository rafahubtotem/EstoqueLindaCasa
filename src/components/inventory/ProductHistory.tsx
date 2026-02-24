import { HistoryEntry } from "@/types/inventory";
import { Clock, ArrowRight, FileText, Plus, Edit } from "lucide-react";

export function ProductHistory({ history }: { history: HistoryEntry[] }) {
  // Histórico já vem ordenado (mais recente primeiro) do contexto
  const sorted = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getActionIcon = (action: HistoryEntry["action"]) => {
    switch (action) {
      case "CREATED":
        return <Plus className="h-4 w-4" />;
      case "STATUS_CHANGED":
        return <FileText className="h-4 w-4" />;
      case "TRANSFERRED":
        return <ArrowRight className="h-4 w-4" />;
      case "EDITED":
        return <Edit className="h-4 w-4" />;
      case "SOLD":
        return <FileText className="h-4 w-4" />;
      case "DELIVERY_INFO_SET":
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActionLabel = (entry: HistoryEntry) => {
    switch (entry.action) {
      case "CREATED":
        return "Produto Cadastrado";
      case "STATUS_CHANGED":
        // Check if this is a delivery status change based on the reason
        if (entry.details?.reason?.includes("Entregue")) {
          return `Status de Entrega: ${entry.details?.oldStatus} → ${entry.details?.newStatus}`;
        }
        return `Status Alterado: ${entry.details?.oldStatus} → ${entry.details?.newStatus}`;
      case "TRANSFERRED":
        return `Transferído: ${entry.details?.oldUnit} → ${entry.details?.newUnit}`;
      case "EDITED":
        return "Produto Editado";
      case "SOLD":
        return "Marcado como Vendido";
      case "DELIVERY_INFO_SET":
        return "Venda Finalizada";
      case "UPDATED":
        return "Atualizado";
      default:
        return entry.action;
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Clock className="h-4 w-4" /> Histórico de Alterações (mais recente primeiro)
      </h4>
      {sorted.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum registro.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map(entry => (
            <div key={entry.id} className="flex gap-3 text-xs border-l-2 border-accent/30 pl-3 py-2">
              <div className="mt-1 shrink-0">
                {getActionIcon(entry.action)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{getActionLabel(entry)}</p>
                <p className="text-muted-foreground">
                  por <strong>{entry.user}</strong> • {new Date(entry.timestamp).toLocaleString("pt-BR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
                {entry.details?.reason && (
                  <p className="text-muted-foreground mt-1 italic">
                    📝 {entry.details.reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
