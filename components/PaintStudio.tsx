"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lightbulb, Paintbrush2, RefreshCcw, Sparkles, X } from "lucide-react";
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

  const { user, openAuthModal, incrementRenderCount, trackPhotoSave } = useAuth();
  const [selectedColor, setSelectedColor] = useState(COLORS[2].hex);
  const [selectedFinish, setSelectedFinish] = useState<Finish>("glossy");
  const [lightMode, setLightMode] = useState<LightMode | "sunlight">("white");
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
      const response = await fetch("/api/customize", {
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
        // Track the successful render in Firestore
        await incrementRenderCount();
      } else {
        throw new Error(data.error || "Failed to get image from AI");
      }
    } catch (error: any) {
      console.error("AI Paint Error:", error);
      alert(`AI Painting Failed: ${error.message}. Please check your GEMINI_API_KEY.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAiProcessedImage(null);
    setIsPainting(false);
    setSelectedColor(COLORS[2].hex);
    setSelectedFinish("glossy");
    setLightMode("white");
  };

  const totalPrice = BASE_QUOTE_PRICE + FINISH_SURCHARGE[selectedFinish];
  const selectedFinishMeta = FINISHES.find((finish) => finish.id === selectedFinish) || FINISHES[0];
  const selectedColorMeta = COLORS.find((entry) => entry.hex === selectedColor) || COLORS[0];
  
  const platformGlow = useMemo(() => {
    if (lightMode === "yellow") return "rgba(251,191,36,0.35)";
    if (lightMode === "sunlight") return "rgba(255,245,200,0.4)";
    return "rgba(255,255,255,0.15)";
  }, [lightMode]);

  const showroomFilter = useMemo(() => {
    if (lightMode === "yellow") return "sepia(0.2) contrast(1.1)";
    if (lightMode === "sunlight") return "brightness(1.1) saturate(1.1)";
    return "none";
  }, [lightMode]);

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
            className="relative z-10 flex h-full flex-col items-center justify-start px-5 pb-20 pt-16 md:px-10 overflow-y-auto"
          >
            <motion.div layoutId="paint-stage" className="relative aspect-[16/10] w-full max-w-5xl shrink-0">
              <div
                className="absolute inset-x-[9%] bottom-[8%] h-[18%] rounded-full blur-2xl"
                style={{ background: `radial-gradient(ellipse at center, ${platformGlow} 0%, rgba(0,0,0,0) 76%)` }}
              />
              <div className="absolute inset-x-[12%] bottom-[10%] h-[14%] rounded-full border border-white/20 bg-[radial-gradient(ellipse_at_center,#1a1a1a_0%,#0d0d0d_54%,#000_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.75)]" />
              
              <div 
                className="absolute inset-x-[14%] bottom-[15%] h-[58%] rounded-[2rem] border border-white/10 bg-black/20 overflow-hidden backdrop-blur-sm transition-all duration-700"
                style={{ filter: showroomFilter }}
              >
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
                      <motion.div 
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ef4444]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Showroom Lighting Menu - Placed directly below the image */}
            {aiProcessedImage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex flex-col items-center gap-3 shrink-0"
              >
                <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-black">Showroom Lighting</p>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-3xl">
                  <button
                    onClick={() => setLightMode("white")}
                    className={
                      "flex items-center gap-2 rounded-xl px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all " +
                      (lightMode === "white" ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.2)]" : "text-white/40 hover:text-white/80")
                    }
                  >
                    <Lightbulb size={12} />
                    White Light
                  </button>
                  <button
                    onClick={() => setLightMode("yellow")}
                    className={
                      "flex items-center gap-2 rounded-xl px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all " +
                      (lightMode === "yellow" ? "bg-yellow-400 text-black shadow-[0_10px_30px_rgba(250,204,21,0.2)]" : "text-white/40 hover:text-white/80")
                    }
                  >
                    <Sparkles size={12} />
                    Warm Light
                  </button>
                  <button
                    onClick={() => setLightMode("sunlight")}
                    className={
                      "flex items-center gap-2 rounded-xl px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all " +
                      (lightMode === "sunlight" ? "bg-orange-500 text-black shadow-[0_10px_30px_rgba(249,115,22,0.2)]" : "text-white/40 hover:text-white/80")
                    }
                  >
                    <Sparkles size={12} />
                    Sunlight
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

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
                        className={
                          "relative h-10 w-10 rounded-full border transition " +
                          (selectedColor === entry.hex ? "scale-110 border-white/70" : "border-white/10 opacity-70 hover:opacity-100")
                        }
                        style={{ background: entry.hex }}
                      >
                        {selectedColor === entry.hex && <Check size={15} className="absolute inset-0 m-auto text-white" />}
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
                          (selectedFinish === finish.id ? "border-white/30 bg-white/10" : "border-white/10 bg-white/[0.03] hover:border-white/20")
                        }
                      >
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-white">{finish.label}</p>
                        <p className="mt-1 text-xs text-white/45">{finish.description}</p>
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
              <DotLottieReact src="/Loading animation/Loading 49 _ Car Types.lottie" loop autoplay />
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

      <section className="h-[18vh] shrink-0 border-t border-white/10 bg-[#0c0c0c] px-6 py-4 md:px-10">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 h-full">
          <div className="shrink-0">
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">Base Vehicle</p>
            <p className="mt-1 text-lg font-bold text-white">₹{BASE_QUOTE_PRICE.toLocaleString()}</p>
          </div>
          
          <div className="shrink-0">
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">Finish Selected</p>
            <div className="flex items-baseline gap-2">
              <p className="mt-1 text-lg font-bold text-white">{selectedFinishMeta.label}</p>
              <p className="text-[10px] text-white/40">+₹{FINISH_SURCHARGE[selectedFinish].toLocaleString()}</p>
            </div>
          </div>
          
          <div className="rounded-xl border border-red-500/20 bg-red-950/15 px-6 py-3 min-w-[200px]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-red-300/70">Total Estimate</p>
            <p className="mt-1 text-2xl font-black text-white">₹{totalPrice.toLocaleString()}</p>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={handleReset}
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 transition-all hover:border-white/30 hover:bg-white/10"
            >
              <RefreshCcw size={14} className="text-white/60 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Reset</span>
            </button>
            <button
              onClick={handlePaint}
              disabled={isLoading}
              className="group flex items-center gap-3 rounded-xl bg-red-600 px-7 py-3 transition-all hover:bg-red-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.3)] disabled:opacity-50"
            >
              <Paintbrush2 size={16} className="text-white" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">
                {isLoading ? "Painting..." : aiProcessedImage ? "New Paint" : "Paint My Car"}
              </span>
            </button>
          </div>
        </div>
      </section>
    </motion.section>
  );
}
