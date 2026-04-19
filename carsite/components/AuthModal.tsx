"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Phone, MapPin, Car, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, signup } = useAuth();
  const [view, setView] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [carModel, setCarModel] = useState("");
  const [year, setYear] = useState("");

  const resetForm = () => {
    setError("");
    setEmail("");
    setPassword("");
    setMobile("");
    setCity("");
    setCarModel("");
    setYear("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      resetForm();
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await signup({ email, password, mobile, city, carModel, yearOfManufacture: year });
      resetForm();
    } catch (err) {
      setError("Signup failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/60 p-4 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a0a0a]/80 p-8 shadow-2xl backdrop-blur-2xl md:p-10"
        >
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute right-6 top-6 text-white/40 transition-colors hover:text-white"
          >
            <X size={24} />
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">
              {view === "login" ? "Welcome Back" : "Create Profile"}
            </h2>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/40">
              {view === "login" ? "Project Zenith Access" : "Join the Elite configurator"}
            </p>
          </div>

          <form onSubmit={view === "login" ? handleLogin : handleSignup} className="space-y-4">
            <div className="space-y-4">
              {/* Common Fields */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm text-white outline-none transition-colors focus:border-red-500/50 focus:bg-white/[0.08]"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm text-white outline-none transition-colors focus:border-red-500/50 focus:bg-white/[0.08]"
                />
              </div>

              {/* Signup Specific Fields */}
              {view === "signup" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm text-white outline-none transition-colors focus:border-red-500/50 focus:bg-white/[0.08]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input
                        type="text"
                        placeholder="City"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm text-white outline-none transition-colors focus:border-red-500/50 focus:bg-white/[0.08]"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input
                        type="number"
                        placeholder="Year"
                        required
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm text-white outline-none transition-colors focus:border-red-500/50 focus:bg-white/[0.08]"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      type="text"
                      placeholder="Car Model (e.g., Honda Civic)"
                      required
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm text-white outline-none transition-colors focus:border-red-500/50 focus:bg-white/[0.08]"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-red-600 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : view === "login" ? (
                "Login"
              ) : (
                "Complete Profile & Start Build"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setView(view === "login" ? "signup" : "login");
                setError("");
              }}
              className="text-[10px] uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white"
            >
              {view === "login" ? (
                <>
                  New to Zenith? <span className="font-bold text-white">Create a Profile</span>
                </>
              ) : (
                <>
                  Already have access? <span className="font-bold text-white">Login</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
