// src/components/product/ImageGallery.tsx

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X, Maximize2, ZoomOut, RotateCw, Download } from 'lucide-react';
import '../../styles/image-gallery.css'; 

interface ImageGalleryProps {
  images: string[];
  productName: string;
  initialImage?: number;
  onImageChange?: (index: number) => void;
  zoomLevel?: number;
  showDownload?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  productName,
  initialImage = 0,
  onImageChange,
  zoomLevel = 2,
  showDownload = true
}) => {
  const [selectedIndex, setSelectedIndex] = useState(initialImage);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentZoom, setCurrentZoom] = useState(zoomLevel);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchZoomStart, setTouchZoomStart] = useState<number | null>(null);
  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Reset states when image changes
  useEffect(() => {
    setIsZoomed(false);
    setPanOffset({ x: 0, y: 0 });
    setRotation(0);
    setCurrentZoom(zoomLevel);
    setImageLoaded(false);
  }, [selectedIndex, zoomLevel]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isFullscreen);
      if (!isFullscreen) {
        document.body.style.overflow = 'auto';
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation with all pro shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle when in gallery context
      if (isFullscreen || imageContainerRef.current?.contains(document.activeElement)) {
        e.preventDefault();
        
        switch (e.key.toLowerCase()) {
          case 'arrowleft':
            handlePrev();
            break;
          case 'arrowright':
            handleNext();
            break;
          case 'escape':
            if (isFullscreen) handleCloseFullscreen();
            break;
          case 'z':
          case 'Z':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              handleResetZoom();
            } else {
              setIsZoomed(!isZoomed);
            }
            break;
          case '+':
          case '=':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              handleZoomIn();
            }
            break;
          case '-':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              handleZoomOut();
            }
            break;
          case '0':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              handleResetView();
            }
            break;
          case 'r':
            handleRotate();
            break;
          case 'f':
            if (!isFullscreen) handleOpenFullscreen();
            break;
          case ' ':
            e.preventDefault();
            if (isZoomed) {
              setIsPanning(!isPanning);
            } else {
              handleNext();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isZoomed, selectedIndex, isPanning, currentZoom]);

  // Handle wheel events for zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isZoomed || !imageContainerRef.current?.contains(e.target as Node)) return;
      
      e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl+Scroll
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setCurrentZoom(prev => {
          const newZoom = prev + delta;
          return Math.max(1, Math.min(newZoom, 5));
        });
      } else if (isZoomed) {
        // Pan with scroll when zoomed
        setPanOffset(prev => ({
          x: prev.x - e.deltaX * 0.5,
          y: prev.y - e.deltaY * 0.5
        }));
      }
    };

    const container = imageContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isZoomed]);

  // Smooth animation for panning
  useEffect(() => {
    if (!isPanning || !animationFrameRef.current) return;

    const animatePan = () => {
      if (!isPanning) return;
      
      const speed = 0.1;
      setPanOffset(prev => ({
        x: prev.x + (lastMousePos.current.x - prev.x) * speed,
        y: prev.y + (lastMousePos.current.y - prev.y) * speed
      }));
      
      animationFrameRef.current = requestAnimationFrame(animatePan);
    };

    animationFrameRef.current = requestAnimationFrame(animatePan);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPanning]);

  const handlePrev = useCallback(() => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : images.length - 1;
    setSelectedIndex(newIndex);
    onImageChange?.(newIndex);
  }, [selectedIndex, images.length, onImageChange]);

  const handleNext = useCallback(() => {
    const newIndex = selectedIndex < images.length - 1 ? selectedIndex + 1 : 0;
    setSelectedIndex(newIndex);
    onImageChange?.(newIndex);
  }, [selectedIndex, images.length, onImageChange]); // FIXED HERE

  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedIndex(index);
    onImageChange?.(index);
  }, [onImageChange]);

  // Advanced mouse tracking for smooth zoom
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageContainerRef.current) return;

    const container = imageContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Calculate normalized position (0 to 1)
    const x = (e.clientX - containerRect.left) / containerRect.width;
    const y = (e.clientY - containerRect.top) / containerRect.height;
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    
    // Update zoom position if not panning
    if (!isPanning) {
      setZoomPosition({ x: x * 100, y: y * 100 });
      
      // Calculate pan offset based on zoom position and level
      const effectiveWidth = containerRect.width * currentZoom;
      const effectiveHeight = containerRect.height * currentZoom;
      const offsetX = (effectiveWidth - containerRect.width) * x;
      const offsetY = (effectiveHeight - containerRect.height) * y;
      
      setPanOffset({
        x: -offsetX + containerRect.width * 0.5,
        y: -offsetY + containerRect.height * 0.5
      });
    }
  }, [isZoomed, isPanning, currentZoom]);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setTouchZoomStart(distance);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isZoomed) return;
    
    if (e.touches.length === 1 && touchStart) {
      const deltaX = e.touches[0].clientX - touchStart.x;
      const deltaY = e.touches[0].clientY - touchStart.y;
      
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2 && touchZoomStart) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const zoomDelta = (distance - touchZoomStart) * 0.01;
      setCurrentZoom(prev => Math.max(1, Math.min(prev + zoomDelta, 5)));
      setTouchZoomStart(distance);
    }
  }, [isZoomed, touchStart, touchZoomStart]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isZoomed && e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [isZoomed, panOffset]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setCurrentZoom(prev => Math.min(prev + 0.5, 5));
    if (!isZoomed) setIsZoomed(true);
  }, []);

  const handleZoomOut = useCallback(() => {
    setCurrentZoom(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setIsZoomed(false);
      return newZoom;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setCurrentZoom(zoomLevel);
    setPanOffset({ x: 0, y: 0 });
    setIsZoomed(false);
  }, [zoomLevel]);

  const handleResetView = useCallback(() => {
    handleResetZoom();
    setRotation(0);
  }, [handleResetZoom]);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handleOpenFullscreen = useCallback(async () => {
    if (!fullscreenRef.current) return;
    
    try {
      if (fullscreenRef.current.requestFullscreen) {
        await fullscreenRef.current.requestFullscreen();
      } else if ((fullscreenRef.current as any).webkitRequestFullscreen) {
        await (fullscreenRef.current as any).webkitRequestFullscreen();
      }
      document.body.style.overflow = 'hidden';
    } catch (err) {
      console.error('Fullscreen error:', err);
      // Fallback to modal
      setIsFullscreen(true);
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleCloseFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
    } catch (err) {
      console.error('Exit fullscreen error:', err);
    }
    
    setIsFullscreen(false);
    setIsZoomed(false);
    document.body.style.overflow = 'auto';
  }, []);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = images[selectedIndex];
    link.download = `${productName.replace(/\s+/g, '-')}-${selectedIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [images, selectedIndex, productName]);

  // Calculate image transform for zoom and pan
  const imageTransform = useMemo(() => {
    const transform = [];
    
    if (rotation !== 0) {
      transform.push(`rotate(${rotation}deg)`);
    }
    
    if (isZoomed && currentZoom > 1) {
      transform.push(`scale(${currentZoom})`);
    }
    
    return transform.join(' ');
  }, [rotation, isZoomed, currentZoom]);

  // Calculate image position for panning
  const imagePosition = useMemo(() => {
    if (!isZoomed || currentZoom <= 1) {
      return { transform: imageTransform };
    }
    
    return {
      transform: imageTransform,
      left: `${panOffset.x}px`,
      top: `${panOffset.y}px`,
      position: 'relative' as const
    };
  }, [isZoomed, currentZoom, panOffset, imageTransform]);

  // Render main image with all controls
  const renderMainImage = useCallback((isFullscreenMode: boolean = false) => {
    const containerClasses = isFullscreenMode 
      ? 'w-full h-full'
      : 'h-64 md:h-80';
    
    return (
      <div
        ref={imageContainerRef}
        className={`relative overflow-hidden bg-gray-50 ${containerClasses}`}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {
          setTouchStart(null);
          setTouchZoomStart(null);
        }}
      >
        {/* Zoom overlay indicator */}
        {isZoomed && !isPanning && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div 
              className="absolute border-2 border-primary-500/50 bg-primary-500/10 rounded-lg"
              style={{
                width: '100px',
                height: '100px',
                left: `${zoomPosition.x - 50}%`,
                top: `${zoomPosition.y - 50}%`,
                transition: 'all 0.1s ease-out'
              }}
            />
          </div>
        )}
        
        {/* Panning cursor */}
        <div 
          className={`absolute inset-0 z-0 transition-all duration-200 ${
            isPanning ? 'cursor-grabbing' : isZoomed ? 'cursor-zoom-in' : 'cursor-default'
          }`}
        >
          {/* Main image */}
          <div className="relative w-full h-full">
            <img
              ref={mainImageRef}
              src={images[selectedIndex]}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              className={`absolute inset-0 w-full h-full object-contain transition-transform duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={imagePosition}
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder.png';
                setImageLoaded(true);
              }}
              onLoad={() => {
                setImageLoaded(true);
                // Reset pan offset when new image loads
                setPanOffset({ x: 0, y: 0 });
              }}
              draggable="false"
            />
            
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all z-20 backdrop-blur-sm shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all z-20 backdrop-blur-sm shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    );
  }, [
    images, selectedIndex, productName, isZoomed, isPanning, zoomPosition,
    imageLoaded, imagePosition, handleMouseMove, handleMouseDown, handleMouseUp,
    handleTouchStart, handleTouchMove, handlePrev, handleNext
  ]);

  // Zoom controls panel
  const renderZoomControls = useCallback((isFullscreenMode: boolean = false) => (
    <div className={`flex items-center gap-2 ${isFullscreenMode ? 'bg-black/80' : 'bg-white/90'} p-2 rounded-full shadow-lg backdrop-blur-sm z-30`}>
      <button
        onClick={handleZoomOut}
        className="p-2 hover:bg-gray-200/50 rounded-full transition-colors"
        aria-label="Zoom out"
        title="Zoom Out (Ctrl + -)"
      >
        <ZoomOut className="h-5 w-5" />
      </button>
      
      <div className="px-2 text-sm font-medium min-w-[60px] text-center">
        {Math.round(currentZoom * 100)}%
      </div>
      
      <button
        onClick={handleZoomIn}
        className="p-2 hover:bg-gray-200/50 rounded-full transition-colors"
        aria-label="Zoom in"
        title="Zoom In (Ctrl + +)"
      >
        <ZoomIn className="h-5 w-5" />
      </button>
      
      <div className="h-6 w-px bg-gray-300" />
      
      <button
        onClick={handleRotate}
        className="p-2 hover:bg-gray-200/50 rounded-full transition-colors"
        aria-label="Rotate image"
        title="Rotate (R)"
      >
        <RotateCw className="h-5 w-5" />
      </button>
      
      {showDownload && (
        <button
          onClick={handleDownload}
          className="p-2 hover:bg-gray-200/50 rounded-full transition-colors"
          aria-label="Download image"
          title="Download Image"
        >
          <Download className="h-5 w-5" />
        </button>
      )}
      
      {!isFullscreenMode && (
        <button
          onClick={handleOpenFullscreen}
          className="p-2 hover:bg-gray-200/50 rounded-full transition-colors"
          aria-label="Enter fullscreen"
          title="Fullscreen (F)"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      )}
      
      {isFullscreenMode && (
        <button
          onClick={handleCloseFullscreen}
          className="p-2 hover:bg-gray-200/50 rounded-full transition-colors"
          aria-label="Exit fullscreen"
          title="Exit Fullscreen (ESC)"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  ), [
    currentZoom, showDownload, isFullscreen,
    handleZoomIn, handleZoomOut, handleRotate,
    handleDownload, handleOpenFullscreen, handleCloseFullscreen
  ]);

  return (
    <div ref={fullscreenRef} className="relative">
      <div className="space-y-4">
        {/* Main Image Container */}
        <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {renderMainImage()}
          
          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4">
            {renderZoomControls()}
          </div>
          
          {/* Status Indicators */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {isZoomed && (
              <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                <span className="font-medium">{Math.round(currentZoom * 100)}%</span>
                <span className="mx-2">•</span>
                {isPanning ? 'Drag to pan (Space to exit)' : 'Space to pan'}
              </div>
            )}
          </div>
          
          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin">
              {images.map((image, index) => (
                <button
                  key={`thumb-${index}`}
                  onClick={() => handleThumbnailClick(index)}
                  className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-3 transition-all duration-200 ${
                    selectedIndex === index
                      ? 'border-primary-500 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  aria-label={`View image ${index + 1}`}
                  aria-current={selectedIndex === index}
                >
                  <div className="relative w-full h-full">
                    <img
                      src={image}
                      alt={`${productName} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder-small.png';
                      }}
                    />
                    {selectedIndex === index && (
                      <div className="absolute inset-0 bg-primary-500/20" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Scroll indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 text-white border-b border-white/10">
            <div>
              <h2 className="text-xl font-semibold">{productName}</h2>
              <p className="text-gray-300 mt-1">
                {selectedIndex + 1} of {images.length}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {renderZoomControls(true)}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 relative min-h-0">
            {renderMainImage(true)}
          </div>

          {/* Fullscreen Thumbnails */}
          {images.length > 1 && (
            <div className="p-6 border-t border-white/10">
              <div className="flex justify-center gap-3">
                {images.map((image, index) => (
                  <button
                    key={`fs-thumb-${index}`}
                    onClick={() => handleThumbnailClick(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedIndex === index
                        ? 'border-white scale-110'
                        : 'border-white/30 hover:border-white/60 hover:scale-105'
                    }`}
                    aria-label={`Select image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="w-full h-full object-cover"
                      draggable="false"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Helper */}
          <div className="px-6 py-4 border-t border-white/10 text-sm text-gray-400">
            <div className="flex flex-wrap gap-4 justify-center">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">← →</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Z</kbd>
                <span>Toggle Zoom</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Ctrl + Scroll</kbd>
                <span>Zoom Level</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Space</kbd>
                <span>Pan Mode</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">R</kbd>
                <span>Rotate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">F</kbd>
                <span>Fullscreen</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">ESC</kbd>
                <span>Exit</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;