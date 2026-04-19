"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─── Testimonial data ─────────────────────────────────────────────────────────
const testimonials = [
  {
    name: "Arnav Sharma",
    location: "Gurugram",
    review:
      "The customizer allowed me to see exactly what my Thar would look like in Matte Black—the result was jaw-dropping!",
  },
  {
    name: "Priyanka Nair",
    location: "Noida",
    review:
      "From the online preview to the final reveal, every step felt premium. My i20 looks brand new.",
  },
  {
    name: "Rohan Malhotra",
    location: "South Delhi",
    review:
      "Got a Midnight Blue wrap on my Creta. The attention to detail is unmatched in the entire NCR.",
  },
  {
    name: "Sneha Iyer",
    location: "Dwarka",
    review:
      "I was skeptical about custom paint, but Project Zenith turned my Baleno into a showstopper. 10/10.",
  },
  {
    name: "Vikram Chauhan",
    location: "Faridabad",
    review:
      "The satin finish on my Fortuner is absolutely insane. People stop me at every traffic light!",
  },
  {
    name: "Ananya Kapoor",
    location: "Gurgaon Sec-56",
    review:
      "Their process is transparent and the quality rivals international studios. Worth every rupee.",
  },
  {
    name: "Kabir Mehta",
    location: "Greater Noida",
    review:
      "Booked through the site, visualized it in the garage tool, and the delivery matched pixel-for-pixel.",
  },
  {
    name: "Diya Rajput",
    location: "Vasant Kunj",
    review:
      "The ceramic coating and PPF combo they did for my Seltos is flawless. Best investment for my car.",
  },
];

// ─── Star icon ────────────────────────────────────────────────────────────────
function StarIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-amber-400"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// ─── Single card ──────────────────────────────────────────────────────────────
function TestimonialCard({
  t,
  index,
}: {
  t: (typeof testimonials)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        group relative flex-shrink-0
        w-[320px] md:w-[360px]
        p-6 rounded-2xl
        border border-white/[0.08]
        bg-white/[0.02] backdrop-blur-xl
        hover:border-white/[0.16]
        hover:bg-white/[0.04]
        transition-all duration-500
        cursor-default
      "
    >
      {/* Hover glow */}
      <div
        className="
          absolute -inset-px rounded-2xl opacity-0
          group-hover:opacity-100 transition-opacity duration-500
          pointer-events-none
        "
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(192,57,43,0.08), transparent)",
        }}
      />

      {/* Stars */}
      <div className="relative flex gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} />
        ))}
      </div>

      {/* Review text */}
      <p className="relative text-white/55 text-[13.5px] leading-relaxed font-light mb-6">
        &ldquo;{t.review}&rdquo;
      </p>

      {/* Author */}
      <div className="relative flex items-center gap-3">
        {/* Avatar initial */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600/30 to-orange-500/20 border border-white/[0.08] flex items-center justify-center">
          <span className="text-xs font-semibold text-white/70">
            {t.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-white/80 tracking-tight">
            {t.name}
          </p>
          <p className="text-[11px] text-white/25 tracking-wide">
            {t.location}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Marquee row (duplicated for seamless loop) ──────────────────────────────
function MarqueeRow({
  items,
  direction,
}: {
  items: typeof testimonials;
  direction: "left" | "right";
}) {
  return (
    <div className="relative w-full overflow-hidden">
      <motion.div
        className="flex gap-5 w-max"
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          x: {
            duration: 45,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        {/* Duplicate the items for seamless loop */}
        {[...items, ...items].map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} t={t} index={i % items.length} />
        ))}
      </motion.div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  const row1 = testimonials.slice(0, 4);
  const row2 = testimonials.slice(4, 8);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative w-full bg-[#0a0a0a] py-28 md:py-40 overflow-hidden"
    >
      {/* ── Section header ──────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-white/25 text-[10px] uppercase tracking-[0.45em] font-medium">
            Social Proof
          </span>
          <div className="mt-3 w-12 h-[1px] bg-gradient-to-r from-red-600 to-transparent" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.7,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-8 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          What Our{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
            Clients
          </span>{" "}
          Say
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.7,
            delay: 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-4 text-white/35 text-sm md:text-[15px] max-w-md font-light"
        >
          Trusted by 500+ car enthusiasts across Delhi NCR.
        </motion.p>
      </div>

      {/* ── Marquee rows ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        <MarqueeRow items={row1} direction="left" />
        <MarqueeRow items={row2} direction="right" />
      </div>

      {/* Side fade gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
    </section>
  );
}
