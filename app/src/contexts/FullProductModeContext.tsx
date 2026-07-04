import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';

export type FullProductModeState = 'closed' | 'opening' | 'open' | 'closing';

interface FullProductModeContextType {
  state: FullProductModeState;
  open: (productId: string) => void;
  close: () => void;
  closeImmediately: () => void;
  isFullProductMode: boolean;
  currentProductId: string | null;
  setFullscreenImage: (images: string[], initialIndex: number) => void;
  isFullscreenImageOpen: boolean;
}

const FullProductModeCtx = createContext<FullProductModeContextType | null>(null);

export function FullProductModeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FullProductModeState>('closed');
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [isFullscreenImageOpen, setIsFullscreenImageOpen] = useState(false);
  const [fullscreenImages, setFullscreenImages] = useState<string[]>([]);
  const [fullscreenInitialIndex, setFullscreenInitialIndex] = useState(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = useCallback((productId: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setCurrentProductId(productId);
    setState('opening');
    setTimeout(() => setState('open'), 50);
  }, []);

  const close = useCallback(() => {
    if (state === 'open' || state === 'opening') {
      setState('closing');
      closeTimerRef.current = setTimeout(() => {
        setState('closed');
        setCurrentProductId(null);
        setFullscreenImages([]);
        setFullscreenInitialIndex(0);
      }, 400);
    }
  }, [state]);

  const closeImmediately = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setState('closed');
    setCurrentProductId(null);
    setFullscreenImages([]);
    setFullscreenInitialIndex(0);
  }, []);

  const setFullscreenImage = useCallback((images: string[], initialIndex: number) => {
    setFullscreenImages(images);
    setFullscreenInitialIndex(initialIndex);
    setIsFullscreenImageOpen(true);
  }, []);

  return (
    <FullProductModeCtx.Provider
      value={{
        state,
        open,
        close,
        closeImmediately,
        isFullProductMode: state === 'open' || state === 'closing',
        currentProductId,
        setFullscreenImage,
        isFullscreenImageOpen,
      }}
    >
      {children}
    </FullProductModeCtx.Provider>
  );
}

export function useFullProductMode() {
  const ctx = useContext(FullProductModeCtx);
  if (!ctx) throw new Error('useFullProductMode must be used within FullProductModeProvider');
  return ctx;
}
