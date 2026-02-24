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
        className="group animate-fade-in cursor-pointer rounded-xl border bg-card/70 backdrop-blur-md shadow-sm border-white/20 dark:border-white/10 transition-smooth hover:shadow-md hover:border-primary/30"
      >
        <div className="flex gap-2 sm:gap-4 p-2 sm:p-4">
          {/* Miniatura */}
          <div className="shrink-0">
            {product.images && product.images.length > 0 ? (
              <ImageViewer
                images={product.images}
                alt={product.name}
                className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-lg"
              />
            ) : product.imageUrl ? (
              <ImageViewer
                src={product.imageUrl}
                alt={product.name}
                className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-lg"
              />
            ) : (
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 items-center justify-center rounded-lg bg-muted">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">{product.sku}</span>
              <StatusBadge status={product.status} />
            </div>
            <h3 className="mt-1 font-display font-semibold text-xs sm:text-base truncate group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
              <span>📍 {product.unit}</span>
              <span className="hidden sm:inline">🎨 {product.color}</span>
              <span className="hidden lg:flex items-center gap-1"><Factory className="h-3 w-3" /> {product.manufacturer}</span>
              {product.category === "Sofá" && product.sofaDetails && (
                <span className="hidden sm:inline">📐 {product.sofaDetails.size}</span>
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
