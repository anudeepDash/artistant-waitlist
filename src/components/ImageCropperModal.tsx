'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  aspectRatio: number; // e.g. 3/4 (0.75) for profile, 1 for gallery
  targetWidth: number;
  targetHeight: number;
  onCrop: (croppedBase64: string) => void;
  onClose: () => void;
}

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  aspectRatio,
  targetWidth,
  targetHeight,
  onCrop,
  onClose,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({
    naturalWidth: 0,
    naturalHeight: 0,
    frameWidth: 300,
    frameHeight: 300 / aspectRatio,
    minScale: 1,
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const startPosition = useRef({ x: 0, y: 0 });

  // Calculate dimensions and minScale to cover crop frame
  const handleImageLoad = () => {
    if (!imgRef.current || !frameRef.current) return;

    const img = imgRef.current;
    const frame = frameRef.current;

    const fW = frame.clientWidth || 300;
    const fH = frame.clientHeight || (300 / aspectRatio);

    const nW = img.naturalWidth;
    const nH = img.naturalHeight;

    const sX = fW / nW;
    const sY = fH / nH;
    const minS = Math.max(sX, sY);

    setDimensions({
      naturalWidth: nW,
      naturalHeight: nH,
      frameWidth: fW,
      frameHeight: fH,
      minScale: minS,
    });

    // Center the image initially
    const initX = (fW - nW * minS) / 2;
    const initY = (fH - nH * minS) / 2;
    setPosition({ x: initX, y: initY });
    setZoom(1);
    setImgLoaded(true);
  };

  // Recalculate dimensions on window resize
  useEffect(() => {
    if (!isOpen || !imageSrc) {
      setImgLoaded(false);
      return;
    }

    const handleResize = () => {
      if (imgLoaded) {
        handleImageLoad();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, imageSrc, imgLoaded]);

  // Reset states when modal is opened with new image
  useEffect(() => {
    if (isOpen) {
      setImgLoaded(false);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  // Recalculate dimensions after the modal open transition settles
  useEffect(() => {
    if (isOpen && imgLoaded) {
      const timer = setTimeout(() => {
        handleImageLoad();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, imgLoaded]);

  // Adjust position when zoom changes, zooming relative to the frame center
  const handleZoomChange = (newZoom: number) => {
    const prevZoom = zoom;
    setZoom(newZoom);

    const fW = dimensions.frameWidth;
    const fH = dimensions.frameHeight;
    const nW = dimensions.naturalWidth;
    const nH = dimensions.naturalHeight;

    const prevScale = dimensions.minScale * prevZoom;
    const nextScale = dimensions.minScale * newZoom;

    const dWNext = nW * nextScale;
    const dHNext = nH * nextScale;

    // Crop frame center
    const cX = fW / 2;
    const cY = fH / 2;

    // Center point in image coordinates before zoom
    const imgX = (cX - position.x) / prevScale;
    const imgY = (cY - position.y) / prevScale;

    // New position to keep the image point centered
    let nextX = cX - imgX * nextScale;
    let nextY = cY - imgY * nextScale;

    // Constrain new position to prevent borders showing
    nextX = Math.min(0, Math.max(fW - dWNext, nextX));
    nextY = Math.min(0, Math.max(fH - dHNext, nextY));

    setPosition({ x: nextX, y: nextY });
  };

  // Pointer drag event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!imgLoaded) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY };
    startPosition.current = { ...position };
    isDragging.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    const fW = dimensions.frameWidth;
    const fH = dimensions.frameHeight;
    const nW = dimensions.naturalWidth;
    const nH = dimensions.naturalHeight;

    const currentScale = dimensions.minScale * zoom;
    const dW = nW * currentScale;
    const dH = nH * currentScale;

    let nextX = startPosition.current.x + dx;
    let nextY = startPosition.current.y + dy;

    // Constrain position so image covers the frame
    nextX = Math.min(0, Math.max(fW - dW, nextX));
    nextY = Math.min(0, Math.max(fH - dH, nextY));

    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      isDragging.current = false;
    }
  };

  // Canvas Crop & Save
  const handleCropClick = () => {
    if (!imgRef.current) return;

    const img = imgRef.current;
    const canvas = document.createElement('canvas');

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onClose();
      return;
    }

    const fW = dimensions.frameWidth;
    const fH = dimensions.frameHeight;
    const nW = dimensions.naturalWidth;
    const nH = dimensions.naturalHeight;

    const currentScale = dimensions.minScale * zoom;

    // Scale factor between target canvas and display frame
    const scaleX = targetWidth / fW;
    const scaleY = targetHeight / fH;

    // Draw the image at its scaled position relative to the crop frame
    ctx.drawImage(
      img,
      position.x * scaleX,
      position.y * scaleY,
      nW * currentScale * scaleX,
      nH * currentScale * scaleY
    );

    // Get compressed base64 JPEG data URL
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onCrop(croppedDataUrl);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-2xl relative text-left flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.05] mb-5">
              <div>
                <h3 className="text-lg font-bold text-white font-display uppercase tracking-tight">Crop Photo</h3>
                <p className="text-[10px] text-white/50 mt-0.5">Drag to position & slide to zoom</p>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="p-1.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:text-white transition-all text-white/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cropping Workspace */}
            <div className="flex flex-col items-center gap-6 my-2 w-full">
              <div
                ref={frameRef}
                className="relative overflow-hidden bg-black/50 border border-white/10 rounded-2xl shadow-inner cursor-move select-none touch-none flex items-center justify-center"
                style={{
                  width: '300px',
                  maxWidth: '100%',
                  aspectRatio: `${aspectRatio}`,
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {imageSrc && (
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Source"
                    className="absolute max-w-none origin-top-left pointer-events-none select-none"
                    style={{
                      left: `${position.x}px`,
                      top: `${position.y}px`,
                      width: dimensions.naturalWidth ? `${dimensions.naturalWidth * dimensions.minScale * zoom}px` : 'auto',
                      height: dimensions.naturalHeight ? `${dimensions.naturalHeight * dimensions.minScale * zoom}px` : 'auto',
                    }}
                    onLoad={handleImageLoad}
                  />
                )}

                {/* Crop overlay / guides */}
                <div className="absolute inset-0 pointer-events-none border-2 border-white/20 rounded-2xl">
                  {/* Grid lines */}
                  <div className="absolute top-0 bottom-0 left-1/3 w-[1px] bg-white/15 border-dashed shadow-[0_0_1px_rgba(0,0,0,0.5)]" />
                  <div className="absolute top-0 bottom-0 left-2/3 w-[1px] bg-white/15 border-dashed shadow-[0_0_1px_rgba(0,0,0,0.5)]" />
                  <div className="absolute left-0 right-0 top-1/3 h-[1px] bg-white/15 border-dashed shadow-[0_0_1px_rgba(0,0,0,0.5)]" />
                  <div className="absolute left-0 right-0 top-2/3 h-[1px] bg-white/15 border-dashed shadow-[0_0_1px_rgba(0,0,0,0.5)]" />
                </div>

                {/* Move Hint */}
                {!isDragging.current && imgLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10 transition-opacity duration-300">
                    <div className="p-2 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 flex items-center gap-1.5 text-[10px] text-white/80 font-medium">
                      <Move className="w-3.5 h-3.5" />
                      <span>Drag to adjust</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="w-full space-y-4">
                {/* Zoom Control */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleZoomChange(Math.max(1, zoom - 0.15))}
                    className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/70 transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={zoom}
                    onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7C5CFF]"
                  />
                  <button
                    type="button"
                    onClick={() => handleZoomChange(Math.min(3, zoom + 0.15))}
                    className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/70 transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-white/[0.05]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-2xl text-xs font-bold bg-white/5 border border-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropClick}
                disabled={!imgLoaded}
                className="flex-1 px-4 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] shadow-[0_4px_20px_rgba(242,90,43,0.25)] hover:shadow-[0_4px_25px_rgba(242,90,43,0.4)] hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Apply Crop
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
