"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// ─── Social icons ─────────────────────────────────────────────────────────────
function InstagramIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Footer links ─────────────────────────────────────────────────────────────
const navLinks = [
  { label: "Home", href: "#" },
  { label: "The Garage", href: "#" },
  { label: "Our Process", href: "#brand-story" },
  { label: "Contact Us", href: "#" },
];

const socials = [
  { icon: <InstagramIcon />, href: "#", label: "Instagram" },
  { icon: <YouTubeIcon />,   href: "#", label: "YouTube" },
  { icon: <WhatsAppIcon />,  href: "#", label: "WhatsApp" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.3 });

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="relative w-full bg-[#0a0a0a]"
    >
      {/* Top border separator */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row justify-between gap-12"
        >
          {/* ── Left: Brand + location ──────────────────────────────────── */}
          <div className="flex flex-col gap-5 md:max-w-xs">
            <span
              className="text-white font-black text-2xl tracking-[-0.04em]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              AUTO<span className="text-red-500">X</span>
            </span>

            <p className="text-white/30 text-[13px] leading-relaxed font-light">
              Premium car customization studio serving Delhi NCR — Gurugram,
              Noida &amp; South Delhi. Transforming rides since 2020.
            </p>

            {/* Location pin */}
            <div className="flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5 text-red-500/70"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-white/25 text-[11px] uppercase tracking-[0.2em]">
                Delhi NCR — Gurugram &bull; Noida
              </span>
            </div>
          </div>

          {/* ── Center: Nav links ───────────────────────────────────────── */}
          <div>
            <p className="text-white/20 text-[10px] uppercase tracking-[0.35em] font-medium mb-5">
              Navigation
            </p>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="
                      text-white/45 text-sm font-light
                      hover:text-white transition-colors duration-300
                      relative group
                    "
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-red-500/50 group-hover:w-full transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right: Social + CTA ────────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            <p className="text-white/20 text-[10px] uppercase tracking-[0.35em] font-medium">
              Connect
            </p>

            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="
                    w-10 h-10 rounded-xl
                    border border-white/[0.08]
                    bg-white/[0.02]
                    flex items-center justify-center
                    text-white/40
                    hover:text-white hover:border-white/20 hover:bg-white/[0.06]
                    transition-all duration-300
                  "
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Get a Quote CTA */}
            <a
              href="#"
              className="
                inline-flex items-center gap-2
                px-6 py-3 rounded-full
                border border-red-500/20
                bg-red-500/[0.06]
                text-red-400 text-xs font-medium uppercase tracking-[0.2em]
                hover:bg-red-500/[0.12] hover:border-red-500/30
                transition-all duration-300
              "
            >
              Get a Quote
              <span className="text-[10px]">→</span>
            </a>
          </div>
        </motion.div>

        {/* ── Bottom bar ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 pt-6 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-white/15 text-[11px] tracking-wide">
            © 2026 Project Zenith. All rights reserved.
          </p>
          <p className="text-white/10 text-[11px] tracking-wide">
            Crafted with precision in India 🇮🇳
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
