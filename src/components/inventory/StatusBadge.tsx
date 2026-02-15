import { ProductStatus } from "@/types/inventory";

interface StatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

const statusConfig: Record<ProductStatus, { bg: string; text: string }> = {
  "Disponível": { bg: "bg-green-600", text: "text-white" },
  "Vendido": { bg: "bg-red-600", text: "text-white" },
  "Pedido": { bg: "bg-yellow-600", text: "text-white" },
  "Reservado": { bg: "bg-gray-600", text: "text-white" },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${config.bg} ${config.text} ${className}`}>
      {status}
    </span>
  );
}
