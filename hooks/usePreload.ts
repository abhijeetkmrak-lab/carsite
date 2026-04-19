"use client";

import { useEffect, useRef, useState } from "react";

// ─── Configuration ────────────────────────────────────────────────────────────
// Matches your actual files: frame_000_delay-0.041s.webp … frame_191_delay-0.041s.webp
export const FRAME_COUNT = 192;
const DELAY_STRING = "0.041s";
const SEQUENCE_PATH = "/Carsequence";

// ─── Utility ──────────────────────────────────────────────────────────────────
export function getFrameSrc(index: number): string {
  const padded = String(index).padStart(3, "0");
  return `${SEQUENCE_PATH}/frame_${padded}_delay-${DELAY_STRING}.webp`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export interface UsePreloadResult {
  /** Memoized, stable array of fully-loaded HTMLImageElement objects. */
  images: HTMLImageElement[];
  /** True once every frame has finished loading. */
  isLoaded: boolean;
  /** 0 → 1 loading progress for a progress bar. */
  progress: number;
}

export function usePreload(): UsePreloadResult {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let loaded = 0;
    const total = FRAME_COUNT;
    const imgs: HTMLImageElement[] = new Array(total);

    const onLoad = () => {
      loaded += 1;
      setProgress(loaded / total);
      if (loaded === total) {
        setImages(imgs);
        setIsLoaded(true);
      }
    };

    for (let i = 0; i < total; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);
      img.onload = onLoad;
      img.onerror = onLoad;
      imgs[i] = img;
    }

    return () => {
      for (const img of imgs) {
        img.src = "";
      }
    };
  }, []);

  return {
    images,
    isLoaded,
    progress,
  };
}
