"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";
import { getVirtualCardNumber, getVirtualCardExpiry, getVirtualCardCvc } from "@/lib/virtual-card-utils";

interface VistaVirtualCardProps {
  userName: string | null;
  userEmail: string;
  className?: string;
}

export function VistaVirtualCard({ userName, userEmail, className = "" }: VistaVirtualCardProps) {
  const [cvcRevealed, setCvcRevealed] = useState(false);
  const seed = userEmail || "vista-user";
  const cardNumber = getVirtualCardNumber(seed);
  const expiry = getVirtualCardExpiry(seed);
  const cvc = getVirtualCardCvc(seed);
  const displayName = userName?.toUpperCase() ?? "VISTA MEMBER";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-[1.25rem] aspect-[1.586/1] max-w-[440px] w-full ${className}`}
      style={{
        background: "linear-gradient(145deg, #1e1b4b 0%, #312e81 28%, #4338ca 50%, #3730a3 72%, #4c1d95 100%)",
        boxShadow:
          "0 32px 64px -16px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 80px -20px rgba(99, 102, 241, 0.25)",
      }}
    >
      {/* Diagonal shine overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          background: "linear-gradient(125deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)",
        }}
      />
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />
      {/* Top glow — violet to blue */}
      <div
        className="absolute top-0 left-0 right-0 h-28 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.08) 40%, transparent 100%)",
        }}
      />

      <div className="relative p-6 sm:p-8 flex flex-col h-full justify-between">
        {/* Header: V logo + chip */}
        <div className="flex items-start justify-between">
          <VistaProductVLogo product="virtual-card" size={38} />
          <div
            className="w-14 h-10 rounded-lg border border-amber-400/35"
            style={{
              background: "linear-gradient(145deg, rgba(251,191,36,0.4) 0%, rgba(245,158,11,0.2) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.2)",
            }}
          />
        </div>

        {/* Card number — premium tracking */}
        <div className="tracking-[0.3em] text-white font-mono text-[1.05rem] sm:text-xl font-medium select-all drop-shadow-sm">
          {cardNumber}
        </div>

        {/* Bottom row: name + expiry + CVC */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-violet-300/70 mb-1">Cardholder</p>
            <p className="text-sm sm:text-base font-semibold text-white truncate tracking-widest drop-shadow-sm">
              {displayName}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-violet-300/70 mb-1">Expires</p>
            <p className="text-sm font-mono text-white/95 tracking-wide">{expiry}</p>
          </div>
          {/* CVC with reveal animation */}
          <div className="shrink-0 flex flex-col items-end">
            <p className="text-[10px] uppercase tracking-[0.2em] text-violet-300/70 mb-1">CVC</p>
            <div className="flex items-center gap-1.5">
              <AnimatePresence mode="wait">
                {!cvcRevealed ? (
                  <motion.button
                    key="masked"
                    type="button"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setCvcRevealed(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 transition-colors font-mono text-sm text-white/90"
                  >
                    <span className="tracking-widest">•••</span>
                    <Eye size={14} className="text-violet-300/80" />
                  </motion.button>
                ) : (
                  <motion.div
                    key="revealed"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/15 border border-white/25 font-mono text-sm text-white"
                  >
                    <span className="tracking-widest">{cvc}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCvcRevealed(false); }}
                      className="p-0.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Hide CVC"
                    >
                      <EyeOff size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* VISTA wordmark */}
      <div className="absolute bottom-5 right-6 text-[10px] font-bold tracking-[0.25em] text-white/25 uppercase">
        VISTA
      </div>
    </motion.div>
  );
}
