"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

export function MouseAuraBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPos({ x, y });
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 overflow-hidden -z-10"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos({ x: 50, y: 50 })}
    >
      <motion.div
        className="absolute inset-0 transition-[background] duration-300"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at ${pos.x}% ${pos.y}%, rgba(88, 28, 135, 0.35), transparent 50%),
            radial-gradient(ellipse 70% 90% at ${100 - pos.x * 0.5}% ${pos.y * 0.5}%, rgba(139, 92, 246, 0.22), transparent 55%),
            radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99, 102, 241, 0.12), transparent 65%)
          `,
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(139 92 246) 1px, transparent 1px), linear-gradient(to bottom, rgb(139 92 246) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
        animate={{ opacity: [0.02, 0.07, 0.02] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-[140px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
