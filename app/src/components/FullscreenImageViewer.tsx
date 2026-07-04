import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface FullscreenImageViewerProps {
  isOpen: boolean;
  images: string[];
  title?: string;
  onClose: () => void;
}

export default function FullscreenImageViewer({
  isOpen,
  images,
  title,
  onClose,
}: FullscreenImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentIndex(0);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, currentIndex, images.length, onClose]);

  const goPrev = () => setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () => setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ background: 'rgba(20, 15, 10, 0.95)' }}
        >
          {/* Close button */}
          <motion.button
            className="absolute top-6 right-6 z-[110] p-3 rounded-full"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}
            whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            <X size={24} color="white" />
          </motion.button>

          {/* Title */}
          {title && (
            <motion.div
              className="absolute top-6 left-6 z-[110] px-4 py-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-white text-sm tracking-wider font-medium">{title}</span>
            </motion.div>
          )}

          {/* Previous button */}
          {images.length > 1 && (
            <motion.button
              className="absolute left-4 z-[110] p-3 rounded-full"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}
              whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
            >
              <ChevronLeft size={28} color="white" />
            </motion.button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <motion.button
              className="absolute right-4 z-[110] p-3 rounded-full"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}
              whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); goNext(); }}
            >
              <ChevronRight size={28} color="white" />
            </motion.button>
          )}

          {/* Main image */}
          <motion.div
            className="relative w-full h-full flex items-center justify-center px-20"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`${title || 'Image'} - ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />

            {/* Image counter */}
            {images.length > 1 && (
              <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-white text-sm font-medium">
                  {currentIndex + 1} / {images.length}
                </span>
              </motion.div>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    className={`rounded-lg overflow-hidden transition-all ${idx === currentIndex ? 'ring-2 ring-white ring-offset-2 ring-offset-black/50' : 'opacity-40 hover:opacity-70'}`}
                    style={{ width: 60, height: 40 }}
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
