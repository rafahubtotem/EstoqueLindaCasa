import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCards } from "@/components/inventory/StatsCards";
import { useInventory } from "@/contexts/InventoryContext";
import { StatusBadge } from "@/components/inventory/StatusBadge";
import { ProductDetailDialog } from "@/components/inventory/ProductDetailDialog";
import { Product } from "@/types/inventory";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const { products } = useInventory();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const recentSold = products
    .filter(p => p.status === "Vendido" && p.soldAt)
    .sort((a, b) => new Date(b.soldAt!).getTime() - new Date(a.soldAt!).getTime())
    .slice(0, 5);

  const recentOrdered = products.filter(p => p.status === "Pedido").slice(0, 5);

  return (
    <AppLayout>
      <div className="container py-4 sm:py-6 space-y-6 sm:space-y-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Visão geral</p>
        </div>

        <StatsCards />

        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Últimas vendas */}
          <div className="rounded-xl border bg-card/70 backdrop-blur-md p-3 sm:p-5 shadow-sm border-white/20 dark:border-white/10 transition-smooth hover:shadow-md">
            <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="font-display text-base sm:text-lg font-semibold">Últimas Vendas</h2>
              <Link to="/produtos" className="flex items-center gap-1 text-xs text-primary hover:underline transition-smooth">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {recentSold.length === 0 ? (
              <p className="text-xs sm:text-sm text-muted-foreground">Nenhuma venda registrada.</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentSold.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedProduct(p)}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 cursor-pointer hover:bg-muted transition-smooth"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        por {p.soldBy} • {p.soldAt ? new Date(p.soldAt).toLocaleDateString("pt-BR") : "—"} • {p.soldUnit}
                      </p>
                    </div>
                    <div className="self-start sm:self-auto">
                      <StatusBadge status="Vendido" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pedidos a caminho */}
          <div className="rounded-xl border bg-card/70 backdrop-blur-md p-3 sm:p-5 shadow-sm border-white/20 dark:border-white/10 transition-smooth hover:shadow-md">
            <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="font-display text-base sm:text-lg font-semibold">Pedidos a Caminho</h2>
            </div>
            {recentOrdered.length === 0 ? (
              <p className="text-xs sm:text-sm text-muted-foreground">Nenhum pedido pendente.</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentOrdered.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedProduct(p)}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 cursor-pointer hover:bg-muted transition-smooth"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Destino: {p.unit}</p>
                    </div>
                    <div className="self-start sm:self-auto">
                      <StatusBadge status="Pedido" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedProduct && (
          <ProductDetailDialog
            product={selectedProduct}
            open={!!selectedProduct}
            onOpenChange={(open) => {
              if (!open) setSelectedProduct(null);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Index;
