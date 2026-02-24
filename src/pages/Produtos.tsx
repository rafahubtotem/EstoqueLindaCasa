import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductList } from "@/components/inventory/ProductList";
import { useInventory } from "@/contexts/InventoryContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddProductDialog } from "@/components/inventory/AddProductDialog";
import { ProductStatus, StoreUnit } from "@/types/inventory";
import { useSearchParams } from "react-router-dom";
import { SALES_USERS } from "@/types/inventory";

const Produtos = () => {
  const { products } = useInventory();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStatus = (() => {
    const s = searchParams.get("status");
    if (!s) return "Todos" as const;
    if (["Disponível", "Vendido", "Pedido", "Reservado"].includes(s)) return s as ProductStatus;
    return "Todos" as const;
  })();

  const initialUnit = (() => {
    const u = searchParams.get("unit");
    if (!u) return "Todos" as const;
    if (["Shopping Praça Nova", "Camobi", "Estoque"].includes(u)) return u as StoreUnit;
    return "Todos" as const;
  })();

  const initialSeller = (() => {
    const v = searchParams.get("seller");
    if (!v) return "Todos" as const;
    if (SALES_USERS.includes(v as any)) return v as typeof v;
    return "Todos" as const;
  })();

  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | "Todos">(initialStatus);
  const [selectedUnit, setSelectedUnit] = useState<StoreUnit | "Todos">(initialUnit);
  const [selectedSeller, setSelectedSeller] = useState<string | "Todos">(initialSeller as string | "Todos");

  // atualizar query params quando filtros mudarem
  const updateQueryParams = (status: string | "Todos", unit: string | "Todos", seller: string | "Todos") => {
    const params: Record<string, string> = {};
    if (status !== "Todos") params.status = status;
    if (unit !== "Todos") params.unit = unit;
    if (seller !== "Todos") params.seller = seller as string;
    setSearchParams(params);
  };

  // sincroniza quando filtros locais mudam
  useEffect(() => updateQueryParams(selectedStatus, selectedUnit, selectedSeller), [selectedStatus, selectedUnit, selectedSeller]);

  const filteredProducts = products.filter((product) => {
    const statusMatch = selectedStatus === "Todos" || product.status === selectedStatus;
    const unitMatch = selectedUnit === "Todos" || product.unit === selectedUnit;
    const sellerMatch = selectedSeller === "Todos" || (product.soldBy && product.soldBy === selectedSeller);
    return statusMatch && unitMatch && sellerMatch;
  });

  return (
    <AppLayout>
      <div className="container py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Produtos</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Gerencie seu inventário de produtos</p>
          </div>
          <Button onClick={() => setOpenAddDialog(true)} className="gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Produto</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-xs sm:text-sm bg-card/70 backdrop-blur-md border-white/20 dark:border-white/10 transition-smooth"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Disponível">Disponível</option>
            <option value="Vendido">Vendido</option>
            <option value="Pedido">Pedido</option>
            <option value="Reservado">Reservado</option>
          </select>

          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-xs sm:text-sm bg-card/70 backdrop-blur-md border-white/20 dark:border-white/10 transition-smooth"
          >
            <option value="Todos">Todas as Unidades</option>
            <option value="Shopping Praça Nova">Shopping Praça Nova</option>
            <option value="Camobi">Camobi</option>
            <option value="Estoque">Estoque</option>
          </select>

          <select
            value={selectedSeller}
            onChange={(e) => setSelectedSeller(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-xs sm:text-sm bg-card/70 backdrop-blur-md border-white/20 dark:border-white/10 transition-smooth"
          >
            <option value="Todos">Todos os Vendedores</option>
            {SALES_USERS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Mostrando {filteredProducts.length} de {products.length} produtos
          </p>
          <ProductList products={filteredProducts} />
        </div>

        <AddProductDialog open={openAddDialog} onOpenChange={setOpenAddDialog} />
      </div>
    </AppLayout>
  );
};

export default Produtos;
