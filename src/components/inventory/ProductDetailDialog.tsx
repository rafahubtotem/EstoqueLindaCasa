import { Product } from "@/types/inventory";
import { StatusBadge } from "./StatusBadge";
import { ProductHistory } from "./ProductHistory";
import { ProductActions } from "./ProductActions";
import { ImageViewer } from "./ImageViewer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, MapPin, Palette, Ruler, Factory, Armchair } from "lucide-react";

interface ProductDetailDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-muted-foreground">{product.sku}</span>
              <DialogTitle className="font-display text-xl mt-1">{product.name}</DialogTitle>
            </div>
            <StatusBadge status={product.status} />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Imagem principal */}
          {product.images && product.images.length > 0 ? (
            <ImageViewer
              images={product.images}
              alt={product.name}
              className="h-48 sm:h-56 w-full object-cover"
            />
          ) : product.imageUrl && (
            <ImageViewer
              src={product.imageUrl}
              alt={product.name}
              className="h-48 sm:h-56 w-full object-cover"
            />
          )}

          {/* Informações básicas */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Unidade</p>
                <p className="font-medium">{product.unit}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Categoria</p>
                <p className="font-medium">{product.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Cor</p>
                <p className="font-medium">{product.color}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Factory className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Fabricante</p>
                <p className="font-medium">{product.manufacturer}</p>
              </div>
            </div>
          </div>

          {/* Detalhes específicos do sofá */}
          {product.category === "Sofá" && product.sofaDetails && (
            <div className="rounded-xl border bg-accent/30 p-4">
              <h3 className="mb-3 font-display font-semibold flex items-center gap-2">
                <Armchair className="h-5 w-5" />
                Especificações do Sofá
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Tamanho:</span>{" "}
                    <strong>{product.sofaDetails.size}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🛋️</span>
                  <span className="text-sm">
                    <span className="text-muted-foreground">Lugares:</span>{" "}
                    <strong>{product.sofaDetails.seats}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🧵</span>
                  <span className="text-sm">
                    <span className="text-muted-foreground">Tecido:</span>{" "}
                    <strong>{product.sofaDetails.fabric}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Fabricante:</span>{" "}
                    <strong>{product.sofaDetails.manufacturer}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Descrição */}
          {product.description && (
            <div>
              <h3 className="mb-2 font-display font-semibold">Descrição</h3>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>
          )}

          {/* Info de venda */}
          {product.status === "Vendido" && product.soldBy && (
            <div className="rounded-lg bg-sold/10 p-4 border border-sold/20">
              <h3 className="mb-2 font-display font-semibold text-sold">Informações da Venda</h3>
              <div className="grid gap-2 text-sm">
                <p><span className="text-muted-foreground">Vendedor:</span> <strong>{product.soldBy}</strong></p>
                <p><span className="text-muted-foreground">Data:</span> <strong>{product.soldAt ? new Date(product.soldAt).toLocaleString("pt-BR") : "—"}</strong></p>
                <p><span className="text-muted-foreground">Local:</span> <strong>{product.soldUnit}</strong></p>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <ProductActions product={product} />
          </div>

          {/* Histórico */}
          <div className="border-t pt-4">
            <ProductHistory history={product.history} />
          </div>

          {/* Datas */}
          <div className="flex flex-col gap-2 text-xs text-muted-foreground border-t pt-3">
            <div className="flex justify-between">
              <span>Criado em: {new Date(product.createdAt).toLocaleDateString("pt-BR")}</span>
              <span>por <strong>{product.createdBy}</strong></span>
            </div>
            <div>
              <span>Atualizado em: {new Date(product.updatedAt).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
