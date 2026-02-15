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
      <div className="container py-6 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral</p>
        </div>

        <StatsCards />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Últimas vendas */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Últimas Vendas</h2>
              <Link to="/produtos" className="flex items-center gap-1 text-xs text-primary hover:underline">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {recentSold.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma venda registrada.</p>
            ) : (
              <div className="space-y-3">
                {recentSold.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedProduct(p)}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        por {p.soldBy} • {p.soldAt ? new Date(p.soldAt).toLocaleDateString("pt-BR") : "—"} • {p.soldUnit}
                      </p>
                    </div>
                    <StatusBadge status="Vendido" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pedidos a caminho */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Pedidos a Caminho</h2>
            </div>
            {recentOrdered.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum pedido pendente.</p>
            ) : (
              <div className="space-y-3">
                {recentOrdered.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedProduct(p)}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Destino: {p.unit}</p>
                    </div>
                    <StatusBadge status="Pedido" />
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
