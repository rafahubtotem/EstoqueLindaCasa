import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useInventory } from "@/contexts/InventoryContext";
import { ProductStatus, StoreUnit } from "@/types/inventory";
import { ProductCard } from "./ProductCard";
import { Search, X, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const allStatuses: ProductStatus[] = ["Disponível", "Vendido", "Pedido", "Reservado"];
const allUnits: StoreUnit[] = ["Shopping Praça Nova", "Camobi", "Estoque"];

export function ProductList() {
  const { products } = useInventory();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "Todos">("Todos");
  const [searchParams] = useSearchParams();
  const initialUnit = (() => {
    const u = searchParams.get("unit");
    if (!u) return "Todos" as const;
    if ((allUnits as string[]).includes(u)) return u as StoreUnit;
    return "Todos" as const;
  })();
  const [unitFilter, setUnitFilter] = useState<StoreUnit | "Todos">(initialUnit);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Todos" || p.status === statusFilter;
    const matchUnit = unitFilter === "Todos" || p.unit === unitFilter;
    return matchSearch && matchStatus && matchUnit;
  });

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou código"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ProductStatus | "Todos")}
            className="rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="Todos">Todos os status</option>
            {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={unitFilter}
            onChange={e => setUnitFilter(e.target.value as StoreUnit | "Todos")}
            className="rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="Todos">Todas as unidades</option>
            {allUnits.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <div className="flex gap-1 rounded-lg border bg-card p-1">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} produto(s) encontrado(s)</p>

      {/* Lista ou Grid */}
      <div className={viewMode === "grid" 
        ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" 
        : "space-y-2"
      }>
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Nenhum produto encontrado.</p>
        </div>
      )}
    </div>
  );
}
