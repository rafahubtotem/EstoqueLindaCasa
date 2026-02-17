import { useState } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { ProductCategory, StoreUnit, SofaDetails, SystemUser, SYSTEM_USERS, Manufacturer, MANUFACTURERS, OrderDetails } from "@/types/inventory";
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
import { Plus, Armchair, Barcode, User, Image as ImageIcon, X } from "lucide-react";
import { LabelScanner, ExtractedLabelData } from "./LabelScanner";

const categories: ProductCategory[] = ["Sofá", "Poltrona", "Cadeira", "Banqueta", "Mesa", "Outros"];
const units: StoreUnit[] = ["Shopping Praça Nova", "Camobi", "Estoque"];
const fabrics = ["Veludo", "Linho", "Suede", "Couro", "Chenille", "Boucle", "Jacquard"];
const colors = ["Cinza", "Bege", "Marrom", "Preto", "Azul", "Verde", "Terracota", "Branco", "Caramelo"];

interface AddProductDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function AddProductDialog({ open: controlledOpen, onOpenChange, trigger }: AddProductDialogProps = {}) {
  const { addProduct } = useInventory();
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };
  const [scannerOpen, setScannerOpen] = useState(false);
  const [noteId, setNoteId] = useState<string>(`note-${Date.now()}`);
  const [quantity, setQuantity] = useState(1);
  
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Sofá" as ProductCategory,
    unit: "Estoque" as StoreUnit,
    color: "Cinza",
    description: "",
    manufacturer: "DALLA COSTA" as Manufacturer,
    createdBy: "ANA" as SystemUser,
  });

  const [sofaDetails, setSofaDetails] = useState<SofaDetails>({
    size: "2.00",
    fabric: "Veludo",
    manufacturer: "DALLA COSTA",
    seats: 3,
  });

  const [status, setStatus] = useState<"Disponível" | "Pedido">("Disponível");
  const [orderDate, setOrderDate] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [orderNumber, setOrderNumber] = useState<string>(`PED-${new Date().getFullYear()}-${Date.now()}`);
  const [batchItems, setBatchItems] = useState<Array<any>>([]);
  const [exclusiveSkus, setExclusiveSkus] = useState<string[]>([]); // para modo normal (quantidade)
  const [exclusiveEditorOpen, setExclusiveEditorOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);

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

  const handleLabelExtracted = (data: ExtractedLabelData) => {
    if (data.name) setForm(prev => ({ ...prev, name: data.name }));
    if (data.sku) setForm(prev => ({ ...prev, sku: data.sku }));
    if (data.size) setSofaDetails(prev => ({ ...prev, size: data.size }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (status !== "Pedido") {
      const anyExclusive = exclusiveSkus && exclusiveSkus.some(s => s && s.trim());
      if (!form.sku.trim() && !anyExclusive) return;
    }
    if (status === "Pedido" && (!orderDate || !expectedDate)) {
      alert("Data do pedido e data esperada são obrigatórias");
      return;
    }
    if (quantity < 1) {
      alert("Quantidade deve ser pelo menos 1");
      return;
    }

    // Se for pedido (fábrica) e houver itens em lote, cadastrar cada item com sku único baseado no número do pedido
    if (status === "Pedido") {
      const orderDetails = {
        orderId: orderNumber,
        amount: batchItems.reduce((s, it) => s + (it.quantity || 1), 0),
        currency: "BRL",
        orderedDate: new Date(orderDate).toISOString(),
        expectedDelivery: new Date(expectedDate).toISOString(),
      } as OrderDetails;

      const itemsToCreate = batchItems.length > 0 ? batchItems : [{ ...form, sofaDetails, quantity }];

      itemsToCreate.forEach((item: any, idx: number) => {
        const itemQty = item.quantity || 1;
        for (let j = 0; j < itemQty; j++) {
          const seq = String(j + 1).padStart(3, "0");
          const itemSeq = String(idx + 1).padStart(3, "0");
          const providedExclusive = item.exclusiveSkus && item.exclusiveSkus[j] && item.exclusiveSkus[j].trim();
          const baseSku = (item.sku && item.sku.trim()) ? item.sku.trim() : `${orderNumber}-${itemSeq}`;
          const finalSku = providedExclusive ? `${orderNumber}-${item.exclusiveSkus[j].trim()}` : `${orderNumber}-${baseSku}-${seq}`;

          addProduct({
            name: (item.name || form.name).trim(),
            sku: finalSku,
            noteId: orderNumber,
            category: item.category || form.category,
            status: status,
            unit: item.unit || form.unit,
            color: item.color || form.color,
            description: (item.description || form.description).trim(),
            manufacturer: item.manufacturer || form.manufacturer,
            createdBy: item.createdBy || form.createdBy,
            sofaDetails: (item.category || form.category) === "Sofá" ? { ...(item.sofaDetails || sofaDetails), size: `${(item.sofaDetails || sofaDetails).size}m` } : undefined,
            orderDetails,
          });
        }
      });
    } else {
      // Cadastrar múltiplos produtos com a mesma nota (modo normal)
      for (let i = 0; i < quantity; i++) {
        const seq = String(i + 1).padStart(3, "0");
        const providedSku = exclusiveSkus[i] && exclusiveSkus[i].trim() ? exclusiveSkus[i].trim() : form.sku.trim();
        const finalSku = providedSku ? `${noteId}-${providedSku}-${seq}` : `${noteId}-${seq}`;

        addProduct({
          name: form.name.trim(),
          sku: finalSku,
          noteId: noteId, // Mesmo noteId para agrupar os produtos da mesma nota
          category: form.category,
          status: status,
          unit: form.unit,
          color: form.color,
          description: form.description.trim(),
          manufacturer: form.manufacturer,
          createdBy: form.createdBy,
          sofaDetails: form.category === "Sofá" ? { ...sofaDetails, size: `${sofaDetails.size}m` } : undefined,
          orderDetails: status === "Pedido" ? { orderedDate: new Date(orderDate).toISOString(), expectedDelivery: new Date(expectedDate).toISOString() } : undefined,
        });
      }
    }

    // Reset form
    setNoteId(`note-${Date.now()}`);
    setOrderNumber(`PED-${new Date().getFullYear()}-${Date.now()}`);
    setBatchItems([]);
    setQuantity(1);
    setExclusiveSkus([]);
    setExclusiveEditorOpen(false);
    setForm({ name: "", sku: "", category: "Sofá", unit: "Estoque", color: "Cinza", description: "", manufacturer: "DALLA COSTA", createdBy: "ANA" });
    setSofaDetails({ size: "2.00", fabric: "Veludo", manufacturer: "DALLA COSTA", seats: 3 });
    setStatus("Disponível");
    setOrderDate("");
    setExpectedDate("");
    setImages([]);
    setOpen(false);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const updateSofa = (field: keyof SofaDetails, value: string | number) => setSofaDetails(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Novo Produto
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Cadastrar Produto</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="bg-accent/10 border border-accent rounded-lg p-4">
            <Button onClick={() => setScannerOpen(true)} variant="outline" className="w-full gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              <Barcode className="h-4 w-4" /> Escanear Etiqueta do Produto
            </Button>
            <p className="text-xs text-accent mt-2">Fotografe a etiqueta para preencher automaticamente nome, código e medida</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" /> Cadastrado por *
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
              <Label>Quantidade *</Label>
              <Input 
                type="number" 
                min="1" 
                placeholder="Quantos produtos com esta nota?" 
                value={quantity} 
                onChange={e => {
                  const v = Math.max(1, parseInt(e.target.value) || 1);
                  setQuantity(v);
                  setExclusiveSkus(prev => (prev && prev.slice(0, v)) || Array(v).fill(""));
                }} 
              />
              {quantity > 1 && (
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setExclusiveEditorOpen(!exclusiveEditorOpen); if (!exclusiveEditorOpen) setExclusiveSkus(Array(quantity).fill("")); }}>Códigos exclusivos</Button>
                    <p className="text-sm text-muted-foreground">(Preencha códigos únicos por unidade — opcional)</p>
                  </div>
                  {exclusiveEditorOpen && (
                    <div className="grid gap-2 sm:grid-cols-3">
                      {Array.from({ length: quantity }).map((_, i) => (
                        <Input key={i} placeholder={`Código único #${i+1}`} value={exclusiveSkus[i] || ""} onChange={e => {
                          const v = e.target.value; setExclusiveSkus(prev => { const arr = [...(prev || [])]; arr[i] = v; return arr; });
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              )}
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
              <select value={status} onChange={e => setStatus(e.target.value as "Disponível" | "Pedido")} className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="Disponível">Disponível</option>
                <option value="Pedido">Pedido (Fábrica)</option>
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
                  <Label>Número do Pedido *</Label>
                  <Input placeholder="Ex: PED-2026-0001" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderDate">Data do Pedido *</Label>
                  <Input id="orderDate" type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedDate">Data Esperada de Chegada *</Label>
                  <Input id="expectedDate" type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} required />
                </div>
              </div>

              <div className="mt-4">
                <h4 className="mb-2 font-medium">Itens do Pedido</h4>
                <p className="text-sm text-muted-foreground mb-2">Adicione múltiplos produtos com variações distintas. Cada item receberá um SKU único baseado no número do pedido.</p>

                <div className="space-y-3">
                  {batchItems.map((it, idx) => (
                    <div key={idx} className="p-3 border rounded-lg bg-card">
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input placeholder="Nome do item" value={it.name || ""} onChange={e => {
                          const v = e.target.value; setBatchItems(prev => prev.map((p,i)=> i===idx?{...p,name:v}:p));
                        }} />
                        <Input placeholder="SKU (sufixo opcional)" value={it.sku || ""} onChange={e => {
                          const v = e.target.value; setBatchItems(prev => prev.map((p,i)=> i===idx?{...p,sku:v}:p));
                        }} />
                        <Input type="number" min={1} placeholder="Quantidade" value={it.quantity || 1} onChange={e => {
                          const v = Math.max(1, parseInt(e.target.value) || 1);
                          setBatchItems(prev => prev.map((p,i)=> i===idx?{...p,quantity:v, exclusiveSkus: (p.exclusiveSkus && p.exclusiveSkus.slice(0,v)) || Array(v).fill("")}:p));
                        }} />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3 mt-2">
                        <select value={it.category || form.category} onChange={e => setBatchItems(prev => prev.map((p,i)=> i===idx?{...p,category:e.target.value}:p))} className="rounded-lg border bg-card px-3 py-2 text-sm">
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={it.color || form.color} onChange={e => setBatchItems(prev => prev.map((p,i)=> i===idx?{...p,color:e.target.value}:p))} className="rounded-lg border bg-card px-3 py-2 text-sm">
                          {colors.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={it.manufacturer || form.manufacturer} onChange={e => setBatchItems(prev => prev.map((p,i)=> i===idx?{...p,manufacturer:e.target.value}:p))} className="rounded-lg border bg-card px-3 py-2 text-sm">
                          {MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" onClick={() => setBatchItems(prev => prev.filter((_,i)=>i!==idx))}>Remover</Button>
                        <Button variant="outline" onClick={() => setBatchItems(prev => prev.map((p,i)=> i===idx?{...p,exclusiveOpen:!p.exclusiveOpen}:p))}>Códigos exclusivos</Button>
                      </div>
                      {it.exclusiveOpen && (
                        <div className="mt-2 space-y-2">
                          <Label>Códigos exclusivos por unidade</Label>
                          <div className="grid gap-2 sm:grid-cols-3">
                            {Array.from({ length: it.quantity || 1 }).map((_, k) => (
                              <Input key={k} placeholder={`Código único #${k+1}`} value={(it.exclusiveSkus && it.exclusiveSkus[k]) || ""} onChange={e => {
                                const v = e.target.value;
                                setBatchItems(prev => prev.map((p,i)=> {
                                  if (i!==idx) return p;
                                  const arr = (p.exclusiveSkus && [...p.exclusiveSkus]) || Array(p.quantity || 1).fill("");
                                  arr[k] = v;
                                  return { ...p, exclusiveSkus: arr };
                                }));
                              }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div>
                    <Button onClick={() => setBatchItems(prev => [...prev, { name: "", sku: "", quantity: 1, category: form.category, color: form.color, manufacturer: form.manufacturer, exclusiveSkus: [], exclusiveOpen: false }])}>Adicionar Item</Button>
                  </div>
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
          <Button onClick={handleSubmit} disabled={!form.name.trim() || (status !== "Pedido" && !form.sku.trim() && !(exclusiveSkus && exclusiveSkus.some(s=>s && s.trim())))}>Cadastrar</Button>
        </DialogFooter>
      </DialogContent>

      <LabelScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onDataExtracted={handleLabelExtracted} />
    </Dialog>
  );
}
