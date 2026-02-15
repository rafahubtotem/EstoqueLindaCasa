import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageViewerProps {
  src?: string;
  images?: string[];
  alt: string;
  className?: string;
}

export function ImageViewer({ src, images = [], alt, className = "" }: ImageViewerProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Use images array if provided, otherwise use single src
  const imageList = images.length > 0 ? images : (src ? [src] : []);
  
  if (imageList.length === 0) return null;

  const currentImage = imageList[currentIndex];

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={`group relative overflow-hidden rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
      >
        <img
          src={currentImage}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
          <span className="rounded-md bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            Ampliar
          </span>
        </div>
        {imageList.length > 1 && (
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1}/{imageList.length}
          </div>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="relative flex items-center justify-center">
            <img
              src={currentImage}
              alt={alt}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
            
            {imageList.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white hover:bg-black/80 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                
                <button
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white hover:bg-black/80 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-2 rounded-full text-sm">
                  {currentIndex + 1} / {imageList.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
