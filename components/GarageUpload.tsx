"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, CheckCircle2, AlertCircle } from "lucide-react";

interface GarageUploadProps {
  onUploadSuccess: (image: string) => void;
  onClose: () => void;
}

export default function GarageUpload({ onUploadSuccess, onClose }: GarageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image format (WebP, JPEG, PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Max size is 5MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
    >
      {/* Background Dimming / Close Overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        layout
        className="relative w-full max-w-2xl bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_32px_80px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

        <div className="flex flex-col items-center text-center gap-8">
          <div className="space-y-3">
            <motion.h2 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-white font-black text-3xl md:text-4xl tracking-tighter uppercase"
            >
              Step into the <span className="text-red-600">Studio</span>
            </motion.h2>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white/40 text-sm md:text-base font-light"
            >
              Upload your car to begin the transformation.
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onDragEnter={onDrag}
                onDragLeave={onDrag}
                onDragOver={onDrag}
                onDrop={onDrop}
                className={`
                  relative w-full aspect-video rounded-3xl border-2 border-dashed
                  flex flex-col items-center justify-center gap-4 transition-all duration-500
                  ${dragActive ? "border-red-500 bg-red-500/5 shadow-[0_0_40px_rgba(220,38,38,0.15)]" : "border-white/10 bg-white/[0.02]"}
                `}
              >
                <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center text-white/20">
                  <Camera size={32} />
                </div>
                <div className="space-y-1">
                  <p className="text-white/60 font-medium">Drag & Drop your car photo here</p>
                  <p className="text-white/20 text-xs">or <span className="text-red-500/80 underline cursor-pointer">Browse Files</span></p>
                </div>
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  accept="image/*"
                />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Car Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => setPreview(null)}
                    className="flex items-center gap-2 px-6 py-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
                  >
                    <X size={14} /> Remove Image
                  </button>
                </div>
                <div className="absolute bottom-4 right-4 bg-green-500 text-white p-2 rounded-full">
                  <CheckCircle2 size={16} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20"
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={preview ? { scale: 1.02 } : {}}
            whileTap={preview ? { scale: 0.98 } : {}}
            disabled={!preview}
            onClick={() => preview && onUploadSuccess(preview)}
            className={`
              w-full py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-sm transition-all duration-500
              ${preview 
                ? "bg-red-600 text-white shadow-[0_12px_40px_rgba(220,38,38,0.4)]" 
                : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"}
            `}
          >
            Start Customizing
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
