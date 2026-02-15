import { useState } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { Product, ProductCategory, StoreUnit, SofaDetails, SystemUser, SYSTEM_USERS, Manufacturer, MANUFACTURERS, OrderDetails, ProductStatus } from "@/types/inventory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Armchair, User, Image as ImageIcon, X } from "lucide-react";

const categories: ProductCategory[] = ["Sofá", "Poltrona", "Cadeira", "Banqueta", "Mesa", "Outros"];
const units: StoreUnit[] = ["Shopping Praça Nova", "Camobi", "Estoque"];
const fabrics = ["Veludo", "Linho", "Suede", "Couro", "Chenille", "Boucle", "Jacquard"];
const colors = ["Cinza", "Bege", "Marrom", "Preto", "Azul", "Verde", "Terracota", "Branco", "Caramelo"];

interface EditProductDialogProps {
  product: Product;
}

export function EditProductDialog({ product }: EditProductDialogProps) {
  const { updateProduct } = useInventory();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: product.name,
    sku: product.sku,
    category: product.category as ProductCategory,
    unit: product.unit as StoreUnit,
    color: product.color,
    description: product.description,
    manufacturer: product.manufacturer as Manufacturer,
    createdBy: product.createdBy as SystemUser,
  });

  const [sofaDetails, setSofaDetails] = useState<SofaDetails>(
    product.sofaDetails || {
      size: "2.00",
      fabric: "Veludo",
      manufacturer: "DALLA COSTA",
      seats: 3,
    }
  );

  const [status, setStatus] = useState<ProductStatus>(product.status);
  const [orderDate, setOrderDate] = useState(product.orderDetails?.orderDate ? new Date(product.orderDetails.orderDate).toISOString().split('T')[0] : "");
  const [expectedDate, setExpectedDate] = useState(product.orderDetails?.expectedDate ? new Date(product.orderDetails.expectedDate).toISOString().split('T')[0] : "");
  const [images, setImages] = useState<string[]>(product.images || []);
  const [editUser, setEditUser] = useState<SystemUser>("ANA");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxImages = 7;
    const remainingSlots = maxImages - images.length;

    if (files.length > remainingSlots) {
      alert(`Você pode adicionar apenas ${remainingSlots} imagem(ns) mais. Máximo é ${maxImages} imagens.`);
      return;
    }

    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione apenas arquivos de imagem");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImages(prev => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.sku.trim()) return;
    if (status === "Pedido" && (!orderDate || !expectedDate)) {
      alert("Data do pedido e data esperada são obrigatórias");
      return;
    }

    const updates: Partial<Product> = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category,
      unit: form.unit,
      color: form.color,
      description: form.description.trim(),
      manufacturer: form.manufacturer,
      createdBy: form.createdBy,
      status: status,
      images: images.length > 0 ? images : undefined,
      ...(form.category === "Sofá" ? { sofaDetails: { ...sofaDetails, size: `${sofaDetails.size}m` } } : {}),
      ...(status === "Pedido" ? { orderDetails: { orderDate: new Date(orderDate).toISOString(), expectedDate: new Date(expectedDate).toISOString() } } : {}),
    };

    updateProduct(product.id, updates, editUser, `Editado por ${editUser}`);
    setOpen(false);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const updateSofa = (field: keyof SofaDetails, value: string | number) => setSofaDetails(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Editar Produto</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Editado por <strong>{editUser}</strong>
            </p>
            <select value={editUser} onChange={e => setEditUser(e.target.value as SystemUser)} className="w-full rounded-lg border bg-card px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-ring">
              {SYSTEM_USERS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" /> Cadastrado por
              </Label>
              <select value={form.createdBy} onChange={e => update("createdBy", e.target.value as SystemUser)} className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {SYSTEM_USERS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Nome do produto *</Label>
              <Input placeholder="Ex: Sofá Retrátil Florença" value={form.name} onChange={e => update("name", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Código *</Label>
              <Input placeholder="Ex: LC-0019" value={form.sku} onChange={e => update("sku", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <select value={form.category} onChange={e => update("category", e.target.value)} className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Unidade</Label>
              <select value={form.unit} onChange={e => update("unit", e.target.value)} className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select value={status} onChange={e => setStatus(e.target.value as ProductStatus)} className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="Disponível">Disponível</option>
                <option value="Pedido">Pedido (Fábrica)</option>
                <option value="Vendido">Vendido</option>
                <option value="Reservado">Reservado</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <select value={form.color} onChange={e => update("color", e.target.value)} className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {colors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Fabricante</Label>
              <select value={form.manufacturer} onChange={e => update("manufacturer", e.target.value)} className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {form.category === "Sofá" && (
            <div className="rounded-xl border bg-accent/30 p-4">
              <h3 className="mb-4 font-display font-semibold flex items-center gap-2">
                <Armchair className="h-5 w-5" /> Especificações do Sofá
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tamanho (metros)</Label>
                  <select value={sofaDetails.size} onChange={e => updateSofa("size", e.target.value)} className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="1.50">1,50m</option>
                    <option value="1.80">1,80m</option>
                    <option value="2.00">2,00m</option>
                    <option value="2.20">2,20m</option>
                    <option value="2.50">2,50m</option>
                    <option value="2.80">2,80m</option>
                    <option value="3.00">3,00m</option>
                    <option value="3.20">3,20m</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Número de Lugares</Label>
                  <select value={sofaDetails.seats} onChange={e => updateSofa("seats", Number(e.target.value))} className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value={2}>2 lugares</option>
                    <option value={3}>3 lugares</option>
                    <option value={4}>4 lugares</option>
                    <option value={5}>5 lugares</option>
                    <option value={6}>6 lugares</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Tecido</Label>
                  <select value={sofaDetails.fabric} onChange={e => updateSofa("fabric", e.target.value)} className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {fabrics.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Fabricante do Sofá</Label>
                  <select value={sofaDetails.manufacturer} onChange={e => updateSofa("manufacturer", e.target.value)} className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {status === "Pedido" && (
            <div className="rounded-xl border bg-primary/10 p-4">
              <h3 className="mb-4 font-display font-semibold text-primary">Informações do Pedido para Fábrica *</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orderDate">Data do Pedido *</Label>
                  <Input id="orderDate" type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedDate">Data Esperada de Chegada *</Label>
                  <Input id="expectedDate" type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} required />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input placeholder="Detalhes adicionais do produto" value={form.description} onChange={e => update("description", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Imagens do Produto ({images.length}/7)
            </Label>
            <div className="border-2 border-dashed rounded-lg p-4 bg-accent/5 hover:bg-accent/10 transition-colors">
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Clique para selecionar imagens</span>
                <span className="text-xs text-muted-foreground">Máximo 7 imagens | PNG, JPG, WebP</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={images.length >= 7}
                />
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Imagem ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!form.name.trim() || !form.sku.trim()}>Salvar Edições</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
