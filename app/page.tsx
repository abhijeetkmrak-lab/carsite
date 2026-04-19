"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePreload } from "@/hooks/usePreload";
import dynamic from "next/dynamic";

// SSR off — these components use window/canvas APIs
const ScrollyCanvas = dynamic(() => import("@/components/ScrollyCanvas"), { ssr: false });
const GarageUI      = dynamic(() => import("@/components/GarageUI"),      { ssr: false });

// These are safe for SSR but we lazy-load to keep initial bundle small
import BrandStory    from "@/components/BrandStory";
import Testimonials  from "@/components/Testimonials";
import Footer        from "@/components/Footer";

export default function HomePage() {
  const { images, isLoaded, progress } = usePreload();

  // ── Global state ──────────────────────────────────────────────────────────
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [tintColor,    setTintColor]    = useState<string | null>(null);

  // Lock / unlock body scroll
  useEffect(() => {
    document.body.style.overflow = isGarageOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isGarageOpen]);

  return (
    <main className="bg-[#0a0a0a] min-h-screen">

      {/* ── Loading screen ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } }}
            className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center gap-6"
          >
            <span
              className="text-white font-black text-4xl tracking-[-0.05em]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              AUTO<span className="text-red-500">X</span>
            </span>

            <p className="text-white/25 text-[10px] uppercase tracking-[0.42em]">
              Loading Experience
            </p>

            {/* 1 px glassmorphism progress track */}
            <div className="w-52 h-[1px] bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-700 to-red-400 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress }}
                style={{ transformOrigin: "left" }}
                transition={{ ease: "linear" }}
              />
            </div>

            <p className="text-white/18 text-xs tabular-nums">{Math.round(progress * 100)}%</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase 1: ScrollyCanvas — 500 vh sticky scroller ────────────────── */}
      {isLoaded && (
        <ScrollyCanvas
          images={images}
          onGarageEnter={() => setIsGarageOpen(true)}
          isGarageOpen={isGarageOpen}
        />
      )}

      {/* ── Paint-colour tint overlay (CSS multiply between canvas & UI) ───── */}
      <AnimatePresence>
        {isGarageOpen && tintColor && (
          <motion.div
            key="tint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.26 }}
            exit={{   opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="fixed inset-0 pointer-events-none z-[5]"
            style={{ background: tintColor, mixBlendMode: "multiply" }}
          />
        )}
      </AnimatePresence>

      {/* ── Phase 2: Garage UI — slides in after "Enter Garage" ────────────── */}
      <AnimatePresence>
        {isGarageOpen && (
          <GarageUI
            onColorChange={setTintColor}
            onClose={() => setIsGarageOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Phase 3: Below-the-fold content (normal document flow) ─────────── */}
      {isLoaded && (
        <>
          <BrandStory />
          <Testimonials />
          <Footer />
        </>
      )}

    </main>
  );
}
