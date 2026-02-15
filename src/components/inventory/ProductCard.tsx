import { useState } from "react";
import { Product } from "@/types/inventory";
import { StatusBadge } from "./StatusBadge";
import { ProductActions } from "./ProductActions";
import { ProductDetailDialog } from "./ProductDetailDialog";
import { ImageViewer } from "./ImageViewer";
import { Package, Factory } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setDetailOpen(true)}
        className="group animate-fade-in cursor-pointer rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/30"
      >
        <div className="flex gap-4 p-4">
          {/* Miniatura */}
          <div className="shrink-0">
            {product.images && product.images.length > 0 ? (
              <ImageViewer
                images={product.images}
                alt={product.name}
                className="h-20 w-20 sm:h-24 sm:w-24"
              />
            ) : product.imageUrl ? (
              <ImageViewer
                src={product.imageUrl}
                alt={product.name}
                className="h-20 w-20 sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-lg bg-muted">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">{product.sku}</span>
              <StatusBadge status={product.status} />
            </div>
            <h3 className="mt-1 font-display font-semibold truncate group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>📍 {product.unit}</span>
              <span>🎨 {product.color}</span>
              <span className="flex items-center gap-1"><Factory className="h-3 w-3" /> {product.manufacturer}</span>
              {product.category === "Sofá" && product.sofaDetails && (
                <span>📐 {product.sofaDetails.size}</span>
              )}
            </div>
            {product.status === "Vendido" && product.soldBy && (
              <div className="mt-1.5 inline-block rounded-md bg-sold/10 px-2 py-0.5 text-xs text-sold">
                Vendido por <strong>{product.soldBy}</strong> • {product.soldUnit}
              </div>
            )}
          </div>

          {/* Ações (para não fechar o card ao clicar) */}
          <div className="shrink-0" onClick={e => e.stopPropagation()}>
            <ProductActions product={product} />
          </div>
        </div>
      </div>

      <ProductDetailDialog
        product={product}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
