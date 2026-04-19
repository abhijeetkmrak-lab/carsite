"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useMotionValue,
  useSpring,
  MotionValue,
} from "framer-motion";
import { FRAME_COUNT } from "@/hooks/usePreload";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScrollyCanvasProps {
  images: HTMLImageElement[];
  onGarageEnter: () => void;
  isGarageOpen: boolean;
}

// ─── Overlay text — defined outside to avoid hook-rules issues ───────────────
interface OverlayTextProps {
  scrollYProgress: MotionValue<number>;
  start: number;
  end: number;
  text: string;
}

function OverlayText({ scrollYProgress, start, end, text }: OverlayTextProps) {
  const mid  = (start + end) / 2;
  const fade = Math.min(0.055, (end - start) / 4);
  const opacity = useTransform(
    scrollYProgress,
    [start, start + fade, mid, end - fade, end],
    [0, 1, 1, 1, 0]
  );
  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
    >
      <span
        className="
          text-center font-black tracking-tight leading-none
          text-transparent bg-clip-text
          bg-gradient-to-r from-white via-white/90 to-white/60
          drop-shadow-[0_2px_48px_rgba(255,255,255,0.18)]
          px-8
        "
        style={{
          fontSize: "clamp(2rem, 6.5vw, 6rem)",
          fontFamily: "'Inter', sans-serif",
          WebkitTextStroke: "0.5px rgba(255,255,255,0.12)",
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

// ─── Overlay text configuration ───────────────────────────────────────────────
const OVERLAYS = [
  { start: 0.0,  end: 0.22, text: "Custom Cars. Live the Life." },
  { start: 0.38, end: 0.62, text: "Beat the Ambiguity."         },
  { start: 0.72, end: 0.88, text: "Boring to Sexy."             },
];

// ─── Object-Fit: Cover ────────────────────────────────────────────────────────
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const imgAspect    = img.naturalWidth  / img.naturalHeight;
  const canvasAspect = w / h;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

  if (imgAspect > canvasAspect) {
    sw = img.naturalHeight * canvasAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / canvasAspect;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

// ─── Magnetic Garage CTA ─────────────────────────────────────────────────────
function MagneticGarageCTA({ onClick }: { onClick: () => void }) {
  const btnRef  = useRef<HTMLButtonElement>(null);
  const x       = useMotionValue(0);
  const y       = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 18 });
  const springY = useSpring(y, { stiffness: 180, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn  = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width  / 2)) * 0.38);
    y.set((e.clientY - (rect.top  + rect.height / 2)) * 0.38);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14, transition: { duration: 0.25 } }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-5"
    >
      {/* Label */}
      <span className="text-white/30 text-[10px] uppercase tracking-[0.45em] font-medium">
        The Garage Awaits
      </span>

      {/* Magnetic button */}
      <motion.button
        ref={btnRef}
        style={{ x: springX, y: springY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
        className="
          relative group
          px-12 py-5 rounded-full
          border border-white/[0.13]
          bg-white/[0.03] backdrop-blur-2xl
          text-white font-semibold text-sm tracking-[0.18em] uppercase
          cursor-pointer overflow-hidden
          shadow-[0_0_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]
          transition-all duration-500
          hover:border-red-500/30
          hover:shadow-[0_0_70px_rgba(192,57,43,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]
        "
      >
        {/* Hover halo */}
        <span
          className="
            absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
            transition-opacity duration-400
          "
          style={{
            background:
              "radial-gradient(ellipse 85% 50% at 50% 50%, rgba(192,57,43,0.10), transparent)",
          }}
        />
        <span className="relative flex items-center gap-3">
          Click to Enter the Garage
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          >
            →
          </motion.span>
        </span>
      </motion.button>

      {/* Pulsing dot */}
      <div className="relative flex items-center justify-center w-2 h-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border border-white/25"
            animate={{ scale: [1, 3], opacity: [0.5, 0] }}
            transition={{ duration: 2.2, delay: i * 0.7, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
        <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ScrollyCanvas({ images, onGarageEnter, isGarageOpen }: ScrollyCanvasProps) {
  const containerRef    = useRef<HTMLDivElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const rafRef          = useRef<number>(0);
  const frameIdxRef     = useRef<number>(0);
  const isGarageOpenRef = useRef(false);
  const [showGarageCTA, setShowGarageCTA] = useState(false);

  // Keep ref in sync for RAf loop (avoids stale closure)
  useEffect(() => { isGarageOpenRef.current = isGarageOpen; }, [isGarageOpen]);

  // ── Scroll tracking ──────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({ target: containerRef });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

  useMotionValueEvent(frameIndex, "change", (v) => {
    frameIdxRef.current = Math.round(v);
  });

  // Show garage CTA when 93 %+ scrolled and hide it while garage is already open
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setShowGarageCTA(v >= 0.93);
  });

  // ── Canvas / Retina DPI setup ────────────────────────────────────────────
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w   = window.innerWidth;
    const h   = window.innerHeight;
    canvas.width        = w * dpr;
    canvas.height       = h * dpr;
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  // ── RAF draw loop ────────────────────────────────────────────────────────
  const startLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tick = () => {
      // Lock to the final frame when the garage is open
      const idx = isGarageOpenRef.current
        ? FRAME_COUNT - 1
        : Math.max(0, Math.min(frameIdxRef.current, images.length - 1));

      const img = images[idx];
      if (img?.complete && img.naturalWidth > 0) {
        const dpr = window.devicePixelRatio || 1;
        const w   = canvas.width  / dpr;
        const h   = canvas.height / dpr;
        ctx.clearRect(0, 0, w, h);
        drawCover(ctx, img, w, h);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [images]);

  useEffect(() => {
    if (images.length === 0) return;
    setupCanvas();
    const stop = startLoop();
    const onResize = () => setupCanvas();
    window.addEventListener("resize", onResize);
    return () => { stop?.(); window.removeEventListener("resize", onResize); };
  }, [images, setupCanvas, startLoop]);

  // ── Scroll hint opacity ──────────────────────────────────────────────────
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  return (
    /* 500 vh scroll container */
    <div ref={containerRef} className="relative" style={{ height: "500vh" }}>
      {/* Sticky viewport layer */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">

        {/* Canvas — zoom-toward-car when garage opens */}
        <motion.div
          className="absolute inset-0"
          animate={
            isGarageOpen
              ? { scale: 1.20, y: "-4%"  }
              : { scale: 1,    y: "0%"   }
          }
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />
        </motion.div>

        {/* Radial vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 85% 65% at 50% 50%, transparent 38%, rgba(0,0,0,0.65) 100%)",
          }}
        />

        {/* Overlay text — hidden once garage opens */}
        <AnimatePresence>
          {!isGarageOpen && OVERLAYS.map((o) => (
            <OverlayText
              key={o.text}
              scrollYProgress={scrollYProgress}
              {...o}
            />
          ))}
        </AnimatePresence>

        {/* 1 px progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-red-700 via-orange-400 to-red-700"
          style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
        />

        {/* Scroll hint — fades as soon as user starts scrolling */}
        <motion.div
          style={{ opacity: scrollHintOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="text-white/35 text-[10px] uppercase tracking-[0.32em]">
            Scroll to Explore
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-white/15 flex justify-center pt-1"
          >
            <div className="w-1 h-2 bg-white/45 rounded-full" />
          </motion.div>
        </motion.div>

        {/* ── Garage CTA — 95 %–100 % scroll ─────────────────────────────── */}
        <AnimatePresence>
          {showGarageCTA && !isGarageOpen && (
            <motion.div
              key="garage-cta"
              className="absolute bottom-14 left-1/2 -translate-x-1/2"
            >
              <MagneticGarageCTA onClick={onGarageEnter} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
