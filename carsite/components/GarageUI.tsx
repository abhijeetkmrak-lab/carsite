"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Configuration data ───────────────────────────────────────────────────────
const PAINT_COLORS = [
  { id: "obsidian",  label: "Obsidian Black", hex: "#0d0d0d" },
  { id: "arctic",   label: "Arctic White",    hex: "#f0f0f0" },
  { id: "inferno",  label: "Inferno Red",     hex: "#b91c1c" },
  { id: "cobalt",   label: "Cobalt Blue",     hex: "#1d4ed8" },
  { id: "racing",   label: "Racing Green",    hex: "#14532d" },
  { id: "gold",     label: "Solar Gold",      hex: "#b45309" },
  { id: "graphite", label: "Graphite Grey",   hex: "#374151" },
  { id: "pearl",    label: "Dragon Pearl",    hex: "#d1d5db" },
];

const FINISH_OPTIONS = [
  { id: "gloss",  label: "Gloss",        cost: 0      },
  { id: "satin",  label: "Satin",        cost: 3000   },
  { id: "matte",  label: "Matte",        cost: 4500   },
  { id: "carbon", label: "Carbon Fibre", cost: 12000  },
];

const INTERIOR_COLORS = [
  { id: "noir",  label: "Noir Black",  hex: "#111111" },
  { id: "tan",   label: "Cognac Tan",  hex: "#92400e" },
  { id: "red",   label: "Racing Red",  hex: "#991b1b" },
  { id: "cream", label: "Ivory Cream", hex: "#fef9e7" },
];

const WHEEL_OPTIONS = [
  { id: "gloss-black", label: "Gloss Black",  cost: 0    },
  { id: "brushed",     label: "Brushed Alu",  cost: 3500 },
  { id: "chrome",      label: "Chrome",       cost: 5500 },
  { id: "gunmetal",    label: "Gunmetal",     cost: 3000 },
];

const PERFORMANCE_PACKAGES = [
  { id: "standard", label: "Standard",  cost: 0,     bhp: "650",  topSpeed: "211 mph", time: "2.9 s" },
  { id: "sport",    label: "Sport+",    cost: 18500, bhp: "720",  topSpeed: "224 mph", time: "2.6 s" },
  { id: "track",    label: "Track",     cost: 35000, bhp: "820",  topSpeed: "235 mph", time: "2.3 s" },
];

const BASE_PRICE = 124900;

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-white/35 text-[9px] uppercase tracking-[0.3em]">{title}</p>
        {subtitle && <p className="text-white/55 text-xs">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-white/[0.055]" />;
}

function Swatch({
  color,
  selected,
  onClick,
  title,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="relative w-8 h-8 rounded-full transition-transform duration-200 hover:scale-110 focus:outline-none"
      style={{ background: color, border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <AnimatePresence>
        {selected && (
          <motion.span
            key="ring"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute -inset-[5px] rounded-full border border-white/55 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </button>
  );
}

function OptionRow({
  label,
  badge,
  selected,
  onClick,
}: {
  label: string;
  badge: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-between
        px-3.5 py-2.5 rounded-xl text-sm
        transition-all duration-200
        ${
          selected
            ? "bg-white/[0.07] text-white border border-white/[0.11]"
            : "text-white/35 hover:text-white/60 hover:bg-white/[0.04] border border-transparent"
        }
      `}
    >
      <span>{label}</span>
      <span className={`text-[11px] ${selected ? "text-white/55" : "text-white/22"}`}>
        {badge}
      </span>
    </button>
  );
}

function PerfCard({
  pkg,
  selected,
  onClick,
}: {
  pkg: (typeof PERFORMANCE_PACKAGES)[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-full text-left px-4 py-3.5 rounded-2xl
        border transition-all duration-300
        ${
          selected
            ? "border-red-500/35 bg-red-950/15"
            : "border-white/[0.07] bg-transparent hover:border-white/[0.12] hover:bg-white/[0.03]"
        }
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`font-semibold text-sm ${selected ? "text-white" : "text-white/50"}`}>
          {pkg.label}
        </span>
        <span className={`text-xs ${selected ? "text-red-400" : "text-white/25"}`}>
          {pkg.cost ? `+$${pkg.cost.toLocaleString()}` : "Included"}
        </span>
      </div>
      <div className="flex gap-5">
        {[
          { k: "Power",   v: `${pkg.bhp} bhp` },
          { k: "0–60",    v: pkg.time          },
          { k: "Top Spd", v: pkg.topSpeed      },
        ].map((s) => (
          <div key={s.k}>
            <p className={`text-[8px] uppercase tracking-wider ${selected ? "text-white/28" : "text-white/18"}`}>
              {s.k}
            </p>
            <p className={`text-xs font-semibold ${selected ? "text-white/75" : "text-white/30"}`}>
              {s.v}
            </p>
          </div>
        ))}
      </div>
      {selected && (
        <motion.span
          layoutId="perf-dot"
          className="absolute right-3.5 top-3.5 w-1.5 h-1.5 rounded-full bg-red-500"
        />
      )}
    </button>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface GarageUIProps {
  onColorChange: (hex: string) => void;
  onClose: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GarageUI({ onColorChange, onClose }: GarageUIProps) {
  const [paintId,  setPaintId]  = useState("obsidian");
  const [finishId, setFinishId] = useState("gloss");
  const [interiorId, setInteriorId] = useState("noir");
  const [wheelId,  setWheelId]  = useState("gloss-black");
  const [perfId,   setPerfId]   = useState("standard");

  const activePaint   = PAINT_COLORS.find((c) => c.id === paintId)!;
  const activeFinish  = FINISH_OPTIONS.find((f) => f.id === finishId)!;
  const activeInterior = INTERIOR_COLORS.find((i) => i.id === interiorId)!;
  const activeWheel   = WHEEL_OPTIONS.find((w) => w.id === wheelId)!;
  const activePerf    = PERFORMANCE_PACKAGES.find((p) => p.id === perfId)!;

  const paintCost    = paintId === "obsidian" ? 0 : 2500;
  const interiorCost = ({ noir: 0, cream: 2500, tan: 3500, red: 4500 } as Record<string, number>)[interiorId] ?? 0;
  const totalPrice   = BASE_PRICE + paintCost + activeFinish.cost + interiorCost + activeWheel.cost + activePerf.cost;

  // Propagate paint colour to parent for canvas tint overlay
  useEffect(() => {
    onColorChange(activePaint.hex);
  }, [activePaint.hex, onColorChange]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      transition={{ duration: 0.45 }}
      className="fixed inset-0 z-20 flex"
    >
      {/* ── Left — transparent, shows canvas + header/title ─────────────── */}
      <div className="flex-1 flex flex-col justify-between p-8">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span
            className="text-white font-black text-2xl tracking-[-0.04em]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            AUTO<span className="text-red-500">X</span>
          </span>

          <button
            onClick={onClose}
            className="
              flex items-center gap-2 text-white/35 text-[11px]
              uppercase tracking-[0.28em] font-medium
              hover:text-white/65 transition-colors duration-250
            "
          >
            <span>←</span> Exit Garage
          </button>
        </div>

        {/* Car title block */}
        <motion.div
          initial={{ x: -28, opacity: 0 }}
          animate={{ x: 0,   opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="pb-14"
        >
          <p className="text-white/22 text-[10px] uppercase tracking-[0.42em] mb-2">
            GT-X Series · 2025
          </p>
          <h1
            className="text-white font-black leading-[0.92]"
            style={{
              fontSize: "clamp(2.4rem, 5.5vw, 5rem)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Configure
            <br />
            <span className="text-red-500">Your Build</span>
          </h1>
          <p className="text-white/28 text-sm mt-4 max-w-[22ch] leading-relaxed">
            Every detail, your choice.
            <br />Handcrafted to order.
          </p>

          {/* Live performance specs (animate on package change) */}
          <div className="flex gap-6 mt-8">
            {[
              { label: "Output",   value: `${activePerf.bhp} bhp` },
              { label: "0–60 mph", value: activePerf.time          },
              { label: "Top Speed",value: activePerf.topSpeed      },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white/25 text-[9px] uppercase tracking-widest">{s.label}</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={s.value}
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -6, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="text-white font-bold text-lg"
                  >
                    {s.value}
                  </motion.p>
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Paint + finish summary pill */}
          <div className="flex items-center gap-2 mt-6">
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/15 shrink-0"
              style={{ background: activePaint.hex }}
            />
            <span className="text-white/40 text-xs">
              {activePaint.label} · {activeFinish.label} · {activeInterior.label} Interior
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Right — glassmorphism config panel ──────────────────────────── */}
      <motion.aside
        initial={{ x: 70, opacity: 0 }}
        animate={{ x: 0,  opacity: 1 }}
        transition={{ delay: 0.22, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="
          w-[370px] m-4 rounded-3xl
          border border-white/[0.075]
          bg-[#0a0a0a]/88 backdrop-blur-[48px]
          flex flex-col overflow-y-auto hide-scrollbar
          shadow-[0_8px_60px_rgba(0,0,0,0.7)]
        "
      >
        <div className="p-5 flex flex-col gap-5">

          {/* ── Paint ─────────────────────────────────────────────────── */}
          <Section title="Exterior Paint" subtitle={activePaint.label}>
            <div className="flex flex-wrap gap-2">
              {PAINT_COLORS.map((c) => (
                <Swatch
                  key={c.id}
                  color={c.hex}
                  selected={paintId === c.id}
                  onClick={() => setPaintId(c.id)}
                  title={c.label}
                />
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── Finish ────────────────────────────────────────────────── */}
          <Section title="Paint Finish" subtitle={activeFinish.label}>
            <div className="flex flex-col gap-1.5">
              {FINISH_OPTIONS.map((f) => (
                <OptionRow
                  key={f.id}
                  label={f.label}
                  badge={f.cost ? `+$${f.cost.toLocaleString()}` : "Included"}
                  selected={finishId === f.id}
                  onClick={() => setFinishId(f.id)}
                />
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── Interior ──────────────────────────────────────────────── */}
          <Section title="Interior" subtitle={activeInterior.label}>
            <div className="flex gap-2">
              {INTERIOR_COLORS.map((c) => (
                <Swatch
                  key={c.id}
                  color={c.hex}
                  selected={interiorId === c.id}
                  onClick={() => setInteriorId(c.id)}
                  title={c.label}
                />
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── Wheels ────────────────────────────────────────────────── */}
          <Section title="Wheel Finish" subtitle={activeWheel.label}>
            <div className="flex flex-col gap-1.5">
              {WHEEL_OPTIONS.map((w) => (
                <OptionRow
                  key={w.id}
                  label={w.label}
                  badge={w.cost ? `+$${w.cost.toLocaleString()}` : "Included"}
                  selected={wheelId === w.id}
                  onClick={() => setWheelId(w.id)}
                />
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── Performance ───────────────────────────────────────────── */}
          <Section title="Performance Package">
            <div className="flex flex-col gap-2">
              {PERFORMANCE_PACKAGES.map((p) => (
                <PerfCard
                  key={p.id}
                  pkg={p}
                  selected={perfId === p.id}
                  onClick={() => setPerfId(p.id)}
                />
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── Price + CTA ───────────────────────────────────────────── */}
          <div className="pb-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-white/28 text-[9px] uppercase tracking-widest">
                Total Estimate
              </p>
              <span className="text-white/22 text-[9px]">excl. taxes &amp; delivery</span>
            </div>

            <div className="flex items-end justify-between mb-5">
              <AnimatePresence mode="wait">
                <motion.p
                  key={totalPrice}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0,  opacity: 1 }}
                  exit={{ y: -10,   opacity: 0 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="text-white font-black text-[2rem] tracking-tight"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  ${totalPrice.toLocaleString()}
                </motion.p>
              </AnimatePresence>
              <span className="text-red-400/75 text-xs font-medium mb-1">Est. Q3 2025</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="
                w-full py-4 rounded-2xl
                font-bold text-sm tracking-[0.14em] uppercase
                bg-gradient-to-r from-red-700 to-red-500
                text-white
                shadow-[0_4px_24px_rgba(185,28,28,0.38)]
                hover:shadow-[0_6px_40px_rgba(185,28,28,0.58)]
                transition-shadow duration-300
              "
            >
              Reserve This Build
            </motion.button>

            <p className="text-center text-white/18 text-[10px] mt-2.5 leading-relaxed">
              Fully refundable deposit · No obligation
            </p>
          </div>

        </div>
      </motion.aside>
    </motion.div>
  );
}
