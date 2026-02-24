import { useInventory } from "@/contexts/InventoryContext";
import { Package, CheckCircle, Clock, ShoppingBag, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const iconMap = {
  total: Package,
  available: CheckCircle,
  sold: ShoppingBag,
  ordered: Clock,
};

export function StatsCards() {
  const { stats } = useInventory();
  const navigate = useNavigate();

  const cards = [
    { label: "Total de Produtos", value: stats.total, icon: "total" as const, color: "text-foreground" },
    { label: "Disponíveis", value: stats.available, icon: "available" as const, color: "text-available" },
    { label: "Vendidos", value: stats.sold, icon: "sold" as const, color: "text-sold" },
    { label: "Pedidos (a caminho)", value: stats.ordered, icon: "ordered" as const, color: "text-ordered" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => {
        const Icon = iconMap[card.icon];
        // tornar alguns cards clicáveis (status filters)
        const isClickable = ["Disponíveis", "Vendidos", "Pedidos (a caminho)"].includes(card.label);
        const handleClick = () => {
          if (!isClickable) {
            navigate(`/produtos`);
            return;
          }
          // mapear label para status query
          const map: Record<string, string> = {
            "Disponíveis": "Disponível",
            "Vendidos": "Vendido",
            "Pedidos (a caminho)": "Pedido",
          };
          const status = map[card.label];
          navigate(`/produtos?status=${encodeURIComponent(status)}`);
        };

        return (
          <div
            key={card.label}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={isClickable ? handleClick : undefined}
            onKeyDown={isClickable ? (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") handleClick(); } : undefined}
            className={`animate-fade-in rounded-xl border bg-card/70 backdrop-blur-md p-3 sm:p-5 shadow-sm border-white/20 dark:border-white/10 transition-smooth ${isClickable ? "cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">{card.label}</span>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
            </div>
            <p className={`mt-2 font-display text-2xl sm:text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        );
      })}
      <div className="col-span-full grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        {(["Shopping Praça Nova", "Camobi", "Estoque"] as const).map(unit => (
          <div
            key={unit}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/produtos?unit=${encodeURIComponent(unit)}`)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") navigate(`/produtos?unit=${encodeURIComponent(unit)}`); }}
            className="animate-fade-in flex cursor-pointer items-center gap-2 sm:gap-3 rounded-xl border bg-card/70 backdrop-blur-md p-3 sm:p-4 shadow-sm border-white/20 dark:border-white/10 transition-smooth hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <div className="flex h-8 sm:h-10 w-8 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{unit}</p>
              <p className="font-display text-lg sm:text-xl font-bold">{stats.byUnit[unit]} produtos</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
