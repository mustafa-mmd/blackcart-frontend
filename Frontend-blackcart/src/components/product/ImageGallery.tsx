import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  initialImage?: number;
  onImageChange?: (index: number) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  productName,
  initialImage = 0,
  onImageChange,
}) => {
  const safeImages = images.filter(Boolean);
  const [internalIndex, setInternalIndex] = useState(() => Math.min(initialImage, Math.max(safeImages.length - 1, 0)));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const selectedIndex = onImageChange
    ? Math.min(initialImage, Math.max(safeImages.length - 1, 0))
    : Math.min(internalIndex, Math.max(safeImages.length - 1, 0));
  const mainImageButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const selectImage = useCallback((index: number) => {
    if (safeImages.length === 0) return;
    const nextIndex = (index + safeImages.length) % safeImages.length;
    setInternalIndex(nextIndex);
    setImageLoaded(false);
    onImageChange?.(nextIndex);
  }, [onImageChange, safeImages.length]);

  const showPrevious = useCallback(() => selectImage(selectedIndex - 1), [selectImage, selectedIndex]);
  const showNext = useCallback(() => selectImage(selectedIndex + 1), [selectImage, selectedIndex]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    window.requestAnimationFrame(() => mainImageButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === 'ArrowLeft' && safeImages.length > 1) {
        event.preventDefault();
        showPrevious();
      } else if (event.key === 'ArrowRight' && safeImages.length > 1) {
        event.preventDefault();
        showNext();
      } else if (event.key === 'Tab') {
        const dialog = closeButtonRef.current?.closest('[role="dialog"]');
        const controls = dialog?.querySelectorAll<HTMLElement>('button:not([disabled])');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeLightbox, lightboxOpen, safeImages.length, showNext, showPrevious]);

  if (safeImages.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500">
        No product image available
      </div>
    );
  }

  const currentImage = safeImages[selectedIndex] || safeImages[0];

  return (
    <div className="w-full" aria-label={`${productName} image gallery`}>
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-gray-100" aria-hidden="true" />}
        <button
          ref={mainImageButtonRef}
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative block h-64 w-full cursor-zoom-in bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 md:h-80"
          aria-label={`Open larger image of ${productName}`}
        >
          <img
            src={currentImage}
            alt={`${productName} - image ${selectedIndex + 1} of ${safeImages.length}`}
            className={`h-full w-full object-contain transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
        </button>

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); showPrevious(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-950/70 p-2 text-white shadow-lg transition hover:bg-gray-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Previous product image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); showNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-950/70 p-2 text-white shadow-lg transition hover:bg-gray-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Next product image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute right-3 top-3 rounded-full bg-gray-950/70 px-2.5 py-1 text-xs font-medium text-white">
              {selectedIndex + 1} / {safeImages.length}
            </span>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Product image thumbnails">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => selectImage(index)}
              aria-label={`Show product image ${index + 1}`}
              aria-current={index === selectedIndex ? 'true' : undefined}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-0.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                index === selectedIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img src={image} alt="" className="h-full w-full object-cover" loading={index > 3 ? 'lazy' : 'eager'} />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} image viewer`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeLightbox();
          }}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-3 text-white transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close image viewer"
          >
            <X className="h-6 w-6" />
          </button>

          {safeImages.length > 1 && (
            <button type="button" onClick={showPrevious} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6" aria-label="Previous product image">
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          <img src={currentImage} alt={`${productName} - enlarged image ${selectedIndex + 1} of ${safeImages.length}`} className="max-h-full max-w-full select-none object-contain" />

          {safeImages.length > 1 && (
            <button type="button" onClick={showNext} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6" aria-label="Next product image">
              <ChevronRight className="h-7 w-7" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
