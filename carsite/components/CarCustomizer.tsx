"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FRAME_COUNT } from "@/hooks/usePreload";

// ─── Data ─────────────────────────────────────────────────────────────────────
const PAINT_COLORS = [
  { id: "phantom-black",  label: "Phantom Black",   hex: "#0d0d0d",  mixHex: "rgba(13,13,13,0.35)"     },
  { id: "arctic-white",   label: "Arctic White",    hex: "#f5f5f5",  mixHex: "rgba(245,245,245,0.25)"  },
  { id: "inferno-red",    label: "Inferno Red",     hex: "#c0392b",  mixHex: "rgba(192,57,43,0.40)"    },
  { id: "cobalt-blue",    label: "Cobalt Blue",     hex: "#1a4fba",  mixHex: "rgba(26,79,186,0.40)"    },
  { id: "racing-green",   label: "Racing Green",    hex: "#1a6b3a",  mixHex: "rgba(26,107,58,0.38)"    },
  { id: "solar-gold",     label: "Solar Gold",      hex: "#d4a017",  mixHex: "rgba(212,160,23,0.38)"   },
];

const RIM_OPTIONS = [
  { id: "gloss-black",  label: "Gloss Black" },
  { id: "brushed-alu",  label: "Brushed Alu" },
  { id: "chrome",       label: "Chrome"       },
  { id: "matte-gun",    label: "Matte Gun"    },
];

// ─── Component ────────────────────────────────────────────────────────────────
interface CarCustomizerProps {
  images: HTMLImageElement[];
}

export default function CarCustomizer({ images }: CarCustomizerProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const [paintId, setPaintId] = useState("phantom-black");
  const [rimId,   setRimId]   = useState("gloss-black");
  const lastFrame = images[FRAME_COUNT - 1];

  // ── Draw final frame with colour overlay ──────────────────────────────────
  const draw = useCallback((mixHex: string) => {
    const canvas = canvasRef.current;
    if (!canvas || !lastFrame || !lastFrame.complete) return;

    const dpr = window.devicePixelRatio || 1;
    const w   = canvas.width  / dpr;
    const h   = canvas.height / dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Object-Fit: Cover
    const imgAspect    = lastFrame.naturalWidth / lastFrame.naturalHeight;
    const canvasAspect = w / h;
    let sx = 0, sy = 0, sw = lastFrame.naturalWidth, sh = lastFrame.naturalHeight;
    if (imgAspect > canvasAspect) {
      sw = lastFrame.naturalHeight * canvasAspect;
      sx = (lastFrame.naturalWidth - sw) / 2;
    } else {
      sh = lastFrame.naturalWidth / canvasAspect;
      sy = (lastFrame.naturalHeight - sh) / 2;
    }
    ctx.drawImage(lastFrame, sx, sy, sw, sh, 0, 0, w, h);

    // Colour tint overlay — multiply-ish blend
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = mixHex;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
  }, [lastFrame]);

  // ── Canvas setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  // Re-draw on colour change
  useEffect(() => {
    const paint = PAINT_COLORS.find((p) => p.id === paintId)!;
    // Small delay so the canvas is ready after mount
    const raf = requestAnimationFrame(() => draw(paint.mixHex));
    return () => cancelAnimationFrame(raf);
  }, [paintId, draw]);

  const activePaint = PAINT_COLORS.find((p) => p.id === paintId)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-0 overflow-hidden"
    >
      {/* ── Background canvas (final frame + tint) ────────────────────────── */}
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-20"
      >
        <span
          className="text-white font-black text-2xl tracking-[-0.04em]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          AUTO<span className="text-red-500">X</span>
        </span>
        <span className="text-white/40 text-sm tracking-widest uppercase">
          Configurator
        </span>
      </motion.header>

      {/* ── Glassmorphism Sidebar ─────────────────────────────────────────── */}
      <motion.aside
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0,  opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="
          absolute right-6 top-1/2 -translate-y-1/2
          w-72 rounded-3xl z-20
          border border-white/10
          bg-white/5 backdrop-blur-2xl
          shadow-[0_8px_60px_rgba(0,0,0,0.5)]
          p-6 flex flex-col gap-6
        "
      >
        {/* ── Car name ────────────────────────────────────────────────────── */}
        <div>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mb-1">
            Current Build
          </p>
          <h2
            className="text-white font-black text-xl leading-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            GT-X Series
          </h2>
          <p className="text-white/40 text-xs mt-0.5">{activePaint.label}</p>
        </div>

        <hr className="border-white/10" />

        {/* ── Paint colours ───────────────────────────────────────────────── */}
        <div>
          <p className="text-white/50 text-[10px] uppercase tracking-[0.25em] mb-3">
            Exterior Paint
          </p>
          <div className="flex flex-wrap gap-2.5">
            {PAINT_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setPaintId(c.id)}
                title={c.label}
                className="group relative w-9 h-9 rounded-full transition-transform duration-200 hover:scale-110 focus:outline-none"
                style={{ background: c.hex, border: "2px solid transparent" }}
              >
                <AnimatePresence>
                  {paintId === c.id && (
                    <motion.span
                      key="ring"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1,   opacity: 1 }}
                      exit={{    scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -inset-1.5 rounded-full border-2 border-white/70 pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>
        </div>

        <hr className="border-white/10" />

        {/* ── Rim options ─────────────────────────────────────────────────── */}
        <div>
          <p className="text-white/50 text-[10px] uppercase tracking-[0.25em] mb-3">
            Rim Finish
          </p>
          <div className="flex flex-col gap-1.5">
            {RIM_OPTIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRimId(r.id)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200 text-left
                  ${rimId === r.id
                    ? "bg-white/15 text-white border border-white/20"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent"
                  }
                `}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                  style={{
                    background:
                      r.id === "gloss-black" ? "#111" :
                      r.id === "brushed-alu" ? "linear-gradient(135deg,#aaa,#ddd,#aaa)" :
                      r.id === "chrome"       ? "linear-gradient(135deg,#e8e8e8,#fff,#bbb)" :
                      "#4a4a5a",
                  }}
                />
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-white/10" />

        {/* ── Price & CTA ─────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest">
                Starting at
              </p>
              <p
                className="text-white text-2xl font-black"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                $124,900
              </p>
            </div>
            <span className="text-red-400 text-xs font-semibold tracking-wide">
              Est. delivery Q3 2025
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="
              w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide
              bg-gradient-to-r from-red-600 to-red-500
              text-white shadow-[0_4px_24px_rgba(192,57,43,0.45)]
              hover:shadow-[0_6px_32px_rgba(192,57,43,0.65)]
              transition-shadow duration-300
            "
          >
            Build Yours →
          </motion.button>

          <p className="text-center text-white/25 text-[10px] mt-2">
            No obligation. Cancel anytime.
          </p>
        </div>
      </motion.aside>

      {/* ── Bottom stats bar ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="
          absolute bottom-6 left-1/2 -translate-x-1/2
          flex items-center gap-8 px-8 py-4 rounded-2xl z-20
          border border-white/10
          bg-white/5 backdrop-blur-2xl
        "
      >
        {[
          { label: "Engine",   value: "4.0L Twin-Turbo V8" },
          { label: "Output",   value: "650 bhp"            },
          { label: "0–60 mph", value: "2.9 s"              },
          { label: "Top Speed",value: "211 mph"            },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-white/40 text-[9px] uppercase tracking-[0.2em]">{stat.label}</p>
            <p className="text-white font-semibold text-sm mt-0.5">{stat.value}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
