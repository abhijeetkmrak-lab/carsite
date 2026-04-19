"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lightbulb, Paintbrush2, Sparkles, X } from "lucide-react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  BASE_QUOTE_PRICE,
  FINISH_SURCHARGE,
  getImageFilter,
} from "@/utils/imageProcessor";
import type { Finish, LightMode } from "@/utils/imageProcessor";
import { isolateCarFromPhoto } from "@/utils/carSegmentation";
import { useAuth } from "@/context/AuthContext";

interface PaintStudioProps {
  userImage: string;
  onClose: () => void;
  isGarageOpen: boolean;
  onColorChange?: (hex: string) => void;
}

const COLORS = [
  { name: "Blue", hex: "#1D4ED8" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Green", hex: "#15803D" },
  { name: "Red", hex: "#B91C1C" },
  { name: "Orange", hex: "#EA580C" },
  { name: "Yellow", hex: "#FACC15" },
  { name: "Grey", hex: "#4B5563" },
];

const FINISHES: { id: Finish; label: string; description: string }[] = [
  { id: "glossy", label: "Glossy", description: "Deep reflections and sharp highlights" },
  { id: "matte", label: "Matte", description: "Low-glare stealth texture" },
  { id: "satin", label: "Satin", description: "Soft sheen with smooth diffusion" },
];

export default function PaintStudio({ userImage, onClose, isGarageOpen, onColorChange }: PaintStudioProps) {
  void onColorChange;

  const { user, openAuthModal } = useAuth();
  const [selectedColor, setSelectedColor] = useState(COLORS[2].hex);
  const [selectedFinish, setSelectedFinish] = useState<Finish>("glossy");
  const [lightMode, setLightMode] = useState<LightMode>("white");
  const [isPainting, setIsPainting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiProcessedImage, setAiProcessedImage] = useState<string | null>(null);

  const handlePaint = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/customise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: userImage,
          color: selectedColor,
          finish: selectedFinish,
        }),
      });
      
    const data = await response.json();
      if (data.image) {
        setAiProcessedImage(data.image);
        setIsPainting(true);
      } else {
        throw new Error(data.error || "Failed to get image from AI");
      }
    } catch (error: any) {
      console.error("AI Paint Error:", error);
      alert(`AI Painting Failed: ${error.message}. Please check your GEMINI_API_KEY in .env.local and ensure the image size is not too large.`);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = BASE_QUOTE_PRICE + FINISH_SURCHARGE[selectedFinish];

  const selectedFinishMeta = FINISHES.find((finish) => finish.id === selectedFinish) || FINISHES[0];
  const selectedColorMeta = COLORS.find((entry) => entry.hex === selectedColor) || COLORS[0];

  const showroomFilter = lightMode === "yellow" ? "sepia(0.2)" : "none";
  const platformGlow = lightMode === "yellow" ? "rgba(251,191,36,0.35)" : "rgba(255,255,255,0.15)";

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={
        "fixed inset-0 z-[120] flex flex-col overflow-hidden bg-[#0a0a0a] " +
        (isGarageOpen ? "pointer-events-auto" : "pointer-events-none")
      }
    >
      <div className="min-h-0 flex-1 md:flex">
        <motion.div
          layout
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[430px] flex-1 overflow-hidden bg-[#060606]"
          animate={{ flexBasis: isPainting ? "100%" : "70%" }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[18%] top-0 h-[55%] w-[36%] -rotate-6 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.06)_38%,transparent_75%)] blur-xl" />
            <div className="absolute right-[18%] top-0 h-[55%] w-[36%] rotate-6 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.05)_35%,transparent_74%)] blur-xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex h-full flex-col items-center justify-center px-5 pb-20 pt-20 md:px-10"
          >
            <motion.div layoutId="paint-stage" className="relative aspect-[16/10] w-full max-w-6xl">
              <div
                className="absolute inset-x-[9%] bottom-[8%] h-[18%] rounded-full blur-2xl"
                style={{ background: `radial-gradient(ellipse at center, ${platformGlow} 0%, rgba(0,0,0,0) 76%)` }}
              />
              <div className="absolute inset-x-[12%] bottom-[10%] h-[14%] rounded-full border border-white/20 bg-[radial-gradient(ellipse_at_center,#1a1a1a_0%,#0d0d0d_54%,#000_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.75)]" />
              
              <div className="absolute inset-x-[14%] bottom-[15%] h-[58%] rounded-[2rem] border border-white/10 bg-black/20 overflow-hidden backdrop-blur-sm">
                <AnimatePresence mode="wait">
                  {aiProcessedImage ? (
                    <motion.img
                      key="ai-image"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={aiProcessedImage}
                      alt="Customized Car"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <motion.div 
                      key="original"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative h-full w-full group"
                    >
                      <img src={userImage} className="h-full w-full object-contain opacity-80" alt="Original Car" />
                      
                      {/* Laser Scan Effect */}
                      <motion.div 
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ef4444]"
                      />
                      <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Lighting Toggles - Re-positioned under the car */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex items-center gap-3 rounded-full border border-white/10 bg-black/40 p-1.5 backdrop-blur-xl"
            >
              <button
                onClick={() => setLightMode("white")}
                className={
                  "rounded-full px-5 py-2 text-[10px] uppercase tracking-[0.2em] transition-all " +
                  (lightMode === "white" ? "bg-white text-black font-bold" : "text-white/50 hover:text-white/80")
                }
              >
                White Studio
              </button>
              <button
                onClick={() => setLightMode("yellow")}
                className={
                  "rounded-full px-5 py-2 text-[10px] uppercase tracking-[0.2em] transition-all " +
                  (lightMode === "yellow" ? "bg-yellow-300 text-black font-bold" : "text-white/50 hover:text-white/80")
                }
              >
                Warm Glow
              </button>
              <div className="mx-2 h-4 w-px bg-white/10" />
              <div className="pr-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/30">
                <Lightbulb size={12} />
                Atmosphere
              </div>
            </motion.div>
          </motion.div>

          {lightMode === "yellow" && (
            <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_45%,rgba(251,191,36,0.05)_0%,rgba(251,191,36,0.01)_32%,transparent_74%)]" />
          )}

          <div className="absolute left-6 top-6 z-30 md:left-8 md:top-8">
            <button
              onClick={onClose}
              className="rounded-full border border-white/20 bg-black/40 px-5 py-2 text-[10px] uppercase tracking-[0.28em] text-white/75 transition-colors hover:text-white"
            >
              Exit Garage
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {!isPainting && (
            <motion.aside
              initial={{ x: 44, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 44, opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="w-full border-l border-white/10 bg-[#101010] px-6 py-7 md:w-[30%]"
            >
              <div className="h-full overflow-y-auto pr-1">
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">Paint Booth</h2>
                <p className="mt-1 text-xs uppercase tracking-[0.26em] text-white/35">Premium Color Spectrum</p>

                <section className="mt-9">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Color Spectrum</p>
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {COLORS.map((entry) => (
                      <button
                        key={entry.hex}
                        onClick={() => setSelectedColor(entry.hex)}
                        title={entry.name}
                        className={
                          "relative h-10 w-10 rounded-full border transition " +
                          (selectedColor === entry.hex
                            ? "scale-110 border-white/70"
                            : "border-white/10 opacity-70 hover:opacity-100")
                        }
                        style={{ background: entry.hex }}
                      >
                        {selectedColor === entry.hex && (
                          <span className="absolute inset-0 grid place-items-center text-white">
                            <Check size={15} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="mt-9">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Finish Type</p>
                  <div className="mt-4 space-y-3">
                    {FINISHES.map((finish) => (
                      <button
                        key={finish.id}
                        onClick={() => setSelectedFinish(finish.id)}
                        className={
                          "w-full rounded-2xl border px-4 py-3 text-left transition " +
                          (selectedFinish === finish.id
                            ? "border-white/30 bg-white/10"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20")
                        }
                      >
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-white">{finish.label}</p>
                        <p className="mt-1 text-xs text-white/45">{finish.description}</p>
                        <p className="mt-2 text-[11px] text-white/70">
                          {FINISH_SURCHARGE[finish.id]
                            ? `+$${FINISH_SURCHARGE[finish.id].toLocaleString()}`
                            : "Included"}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>


              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl"
          >
            <div className="h-64 w-64">
              <DotLottieReact
                src="/Loading animation/Loading 49 _ Car Types.lottie"
                loop
                autoplay
              />
            </div>
            <motion.p 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-8 text-xs font-bold uppercase tracking-[0.5em] text-white"
            >
              Generating AI Masterpiece
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="h-[34vh] shrink-0 overflow-y-auto border-t border-white/10 bg-[#0c0c0c] px-6 py-6 md:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">Final Quotation</p>
          <div className="mt-4 grid grid-cols-1 gap-5 text-sm text-white/80 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Base Vehicle</p>
              <p className="mt-2 text-xl font-bold text-white">₹{BASE_QUOTE_PRICE.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Finish Selected</p>
              <p className="mt-2 text-xl font-bold text-white">{selectedFinishMeta.label}</p>
              <p className="mt-1 text-sm text-white/60">+₹{FINISH_SURCHARGE[selectedFinish].toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-red-500/30 bg-red-950/25 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-red-300/70">Total Estimate</p>
              <motion.p
                key={totalPrice}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-3xl font-black text-white"
              >
                ₹{totalPrice.toLocaleString()}
              </motion.p>
              <p className="mt-1 text-xs text-white/60">{selectedColorMeta.name} / {selectedFinishMeta.label} configuration.</p>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  if (aiProcessedImage) {
                    setAiProcessedImage(null);
                    setIsPainting(false);
                  } else {
                    handlePaint();
                  }
                }}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 py-5 text-sm font-black uppercase tracking-[0.22em] text-white transition-all hover:bg-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : aiProcessedImage ? (
                  <X size={18} />
                ) : (
                  <Paintbrush2 size={18} />
                )}
                {isLoading ? "Painting..." : aiProcessedImage ? "Choose Another Color" : "Paint My Car"}
              </button>
            </div>
          </div>
          <div className="mt-4 text-xs uppercase tracking-[0.24em] text-white/45">
            <span className="inline-flex items-center gap-2">
              <Sparkles size={12} /> Precision paint mode active on isolated car body
            </span>
          </div>
        </div>
      </section>
    </motion.section>
  );
}


