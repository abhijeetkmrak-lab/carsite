"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.15,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const videoReveal = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function BrandStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      id="brand-story"
      className="relative w-full bg-[#0a0a0a] overflow-hidden"
    >
      {/* Top fade-in separator */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-28 md:py-40">
        {/* ── Section label ─────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          custom={0}
          className="mb-16"
        >
          <span className="text-white/25 text-[10px] uppercase tracking-[0.45em] font-medium">
            Our Craft
          </span>
          <div className="mt-3 w-12 h-[1px] bg-gradient-to-r from-red-600 to-transparent" />
        </motion.div>

        {/* ── 30 / 70 Grid ──────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-stretch">
          {/* ── Text column (30 %) ─────────────────────────────────────── */}
          <div className="lg:w-[30%] flex flex-col justify-center gap-8">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={1}
              className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08] tracking-tight text-white"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Bring Your
              <br />
              Car to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                Life
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={2}
              className="text-white/50 text-sm md:text-[15px] leading-relaxed font-light"
            >
              Turn your car from ordinary to extraordinary. We specialize in
              transforming dull, faded finishes into vibrant, head-turning
              masterpieces. Using best-in-industry paints, precision tools, and
              highly skilled professionals, we ensure every detail is flawless.
            </motion.p>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={3}
              className="text-white/35 text-sm md:text-[15px] leading-relaxed font-light"
            >
              Our process follows strict industry standards—so your car doesn&apos;t
              just look better, it&apos;s protected for the long run. From subtle
              elegance to bold transformations, we deliver results that speak for
              themselves. Because your car deserves more than just a paint
              job—it deserves a personality.
            </motion.p>

            {/* Stats row */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={4}
              className="flex gap-10 mt-4"
            >
              {[
                { value: "500+", label: "Cars Transformed" },
                { value: "99%", label: "Client Satisfaction" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Video column (70 %) ────────────────────────────────────── */}
          <motion.div
            variants={videoReveal}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="lg:w-[70%] relative group"
          >
            {/* Ambient glow behind the video */}
            <div
              className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(192,57,43,0.12), transparent 70%)",
              }}
            />

            {/* Video container */}
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-[0_8px_80px_rgba(0,0,0,0.65)]">
              <video
                src="/video/car_video.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover aspect-video"
              />

              {/* Corner badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/[0.08]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-white/60 uppercase tracking-[0.2em] font-medium">
                  Live Process
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
