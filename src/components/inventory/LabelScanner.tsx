import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Tesseract from "tesseract.js";

export interface ExtractedLabelData {
  name: string;
  sku: string;
  size: string;
}

interface LabelScannerProps {
  open: boolean;
  onClose: () => void;
  onDataExtracted: (data: ExtractedLabelData) => void;
}

export function LabelScanner({ open, onClose, onDataExtracted }: LabelScannerProps) {
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
        setIsCameraActive(true);
      }
    } catch (err) {
      setError("Não foi possível acessar a câmera. Tente fazer upload da imagem.");
      console.error(err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageUrl = canvasRef.current.toDataURL("image/png");
        setPreviewImage(imageUrl);
        stopCamera();
        processImage(imageUrl);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const imageUrl = e.target?.result as string;
        setPreviewImage(imageUrl);
        processImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageUrl: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await Tesseract.recognize(imageUrl, "por");
      const text = result.data.text;
      setExtractedText(text);
    } catch (err) {
      setError("Erro ao processar imagem. Tente novamente com uma foto mais clara.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parseExtractedData = (text: string): ExtractedLabelData => {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

    let name = "";
    let sku = "";
    let size = "";

    // Heurística 1: Procurar padrões de código (EAN/UPC) - geralmente números de 12-13 dígitos ou códigos alfanuméricos
    const codeMatch = text.match(/\b([A-Z0-9]{4,})\b/);
    if (codeMatch) {
      sku = codeMatch[1];
    }

    // Heurística 2: Procurar por medidas/tamanhos comuns (ex: "P", "M", "G", "10cm", "500ml", etc)
    const sizeMatch = text.match(/(?:tamanho|size|medida|med|p|m|g|gg|pp|:)\s*([A-Z0-9\s\/\-\.]+)/i);
    if (sizeMatch) {
      size = sizeMatch[1].trim().toUpperCase();
    }

    // Heurística 3: O nome do produto é geralmente a primeira linha não-vazia ou a mais comprida
    const nameCandidate = lines.find(l => l.length > 5 && !l.match(/^\d{10,}/));
    if (nameCandidate) {
      name = nameCandidate.slice(0, 100);
    }

    // Se não encontrou SKU de forma clara, tenta pegar a primeira sequência de números
    if (!sku) {
      const numberMatch = text.match(/\b(\d{6,})\b/);
      if (numberMatch) {
        sku = numberMatch[1];
      }
    }

    return { name, sku, size };
  };

  const handleExtractData = () => {
    if (!extractedText) {
      setError("Nenhum texto foi extraído. Tente com outra imagem.");
      return;
    }

    const data = parseExtractedData(extractedText);

    if (!data.name && !data.sku) {
      setError("Não foi possível extrair informações válidas. Verifique a clareza da foto.");
      return;
    }

    onDataExtracted(data);
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    setPreviewImage(null);
    setExtractedText("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Escanear Etiqueta do Produto</DialogTitle>
          <DialogDescription>
            Fotografe ou carregue a imagem da etiqueta do produto para extrair informações automaticamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Visualização de câmera ou imagem */}
          {!previewImage ? (
            <div className="space-y-3">
              {isCameraActive ? (
                <div className="relative h-80 bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    width={1280}
                    height={720}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 border-4 border-dashed border-yellow-400 opacity-50 pointer-events-none" />
                </div>
              ) : (
                <div className="h-80 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  <p className="text-muted-foreground text-center">Nenhuma câmera ativa</p>
                </div>
              )}

              <div className="flex gap-2">
                {!isCameraActive ? (
                  <Button onClick={startCamera} variant="outline" className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Abrir Câmera
                  </Button>
                ) : (
                  <>
                    <Button onClick={capturePhoto} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Capturar Foto
                    </Button>
                    <Button onClick={stopCamera} variant="outline">
                      Cancelar
                    </Button>
                  </>
                )}

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative h-80 bg-muted rounded-lg overflow-hidden">
                <img src={previewImage} alt="Preview" className="h-full w-full object-contain" />
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  <p className="text-sm">Processando imagem com OCR...</p>
                </div>
              )}

              {extractedText && !loading && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-accent">Texto extraído:</p>
                      <p className="text-muted-foreground mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {extractedText}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleExtractData} disabled={loading || !extractedText} className="flex-1">
                  Preencher Formulário
                </Button>
                <Button
                  onClick={() => {
                    setPreviewImage(null);
                    setExtractedText("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Tirar Outra Foto
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive text-sm p-3 rounded-lg flex gap-2">
              <X className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
