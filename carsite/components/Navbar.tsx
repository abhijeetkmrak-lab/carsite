"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, Save } from "lucide-react";

interface NavbarProps {
  isGarageOpen?: boolean;
  onGarageClick?: () => void;
}

const navLinks = [
  { name: "Home", href: "#" },
  { name: "About Us", href: "#" },
  { name: "Pricing", href: "#" },
  { name: "Login", href: "#" },
];

export default function Navbar({ isGarageOpen = false, onGarageClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled || isGarageOpen
          ? "bg-black/40 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-white font-black text-2xl tracking-tighter cursor-pointer flex items-center gap-2"
        >
          AUTO<span className="text-red-600">X</span>
        </motion.div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.slice(0, 3).map((link) => (
            <NavLink
              key={link.name}
              link={link}
              isHovered={hoveredLink === link.name}
              onHover={() => setHoveredLink(link.name)}
              onLeave={() => setHoveredLink(null)}
            />
          ))}
          
          {/* Garage CTA */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGarageClick}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 border ${
              isGarageOpen 
                ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                : "bg-red-600 text-white border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
            } flex items-center gap-2`}
          >
            {isGarageOpen ? (
              <>
                <Save className="w-3 h-3" />
                Save Build
              </>
            ) : (
              <>
                Garage
                <ChevronRight className="w-3 h-3" />
              </>
            )}
          </motion.button>

          {navLinks.slice(3).map((link) => (
            <NavLink
              key={link.name}
              link={link}
              isHovered={hoveredLink === link.name}
              onHover={() => setHoveredLink(link.name)}
              onLeave={() => setHoveredLink(null)}
            />
          ))}
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white p-2"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black z-[101] md:hidden flex flex-col p-10 justify-center gap-8"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 text-white p-2"
            >
              <X size={32} />
            </button>
            {navLinks.map((link, i) => (
              <motion.a
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                href={link.href}
                className="text-4xl font-black text-white uppercase tracking-tighter"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </motion.a>
            ))}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => {
                onGarageClick?.();
                setIsOpen(false);
              }}
              className="w-full py-6 bg-red-600 text-white text-xl font-black uppercase tracking-tighter rounded-2xl"
            >
              The Garage
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function NavLink({ 
  link, 
  isHovered, 
  onHover, 
  onLeave 
}: { 
  link: { name: string; href: string }; 
  isHovered: boolean; 
  onHover: () => void; 
  onLeave: () => void;
}) {
  return (
    <a
      href={link.href}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors py-2"
    >
      {link.name}
      {isHovered && (
        <motion.div
          layoutId="nav-underline"
          className="absolute -bottom-1 left-0 right-0 h-[1px] bg-red-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </a>
  );
}
