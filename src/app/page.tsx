import React from 'react';
import { Shield, Zap, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AuthButtons } from '@/components/auth-buttons';
import { NavAuth } from '@/components/nav-auth';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080809] text-white selection:bg-indigo-500/30 font-sans">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="text-2xl font-black tracking-tighter text-indigo-500 italic">VISTA</div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">How it works</a>
          <NavAuth />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center relative overflow-hidden">
        {/* Arka plan parlaması */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full -z-10" />
        
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-10 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span>Autonomous Financial Guardian 2026</span>
        </div>
        
        <h1 className="text-7xl md:text-[100px] font-black tracking-tight leading-[0.9] mb-10 bg-gradient-to-b from-white via-white to-zinc-600 bg-clip-text text-transparent">
          Your Invisible <br /> Money Manager.
        </h1>
        
        <p className="text-zinc-400 text-lg md:text-2xl max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
          VISTA AI scans your digital life to find hidden subscriptions, price drops, and trial endings. It saves you money while you sleep.
        </p>

        <AuthButtons />

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-48">
          {[
            { 
              icon: <Shield className="w-6 h-6 text-indigo-500" />, 
              title: "Daily AI Scans", 
              desc: "Deep-scans your inbox every 24h to find every cent you're losing to forgotten trials." 
            },
            { 
              icon: <Zap className="w-6 h-6 text-indigo-500" />, 
              title: "Price Matching", 
              desc: "Automatically detects price drops on your recent orders and drafts refund emails." 
            },
            { 
              icon: <Globe className="w-6 h-6 text-indigo-500" />, 
              title: "Global Support", 
              desc: "Multi-currency support for Amazon, Trendyol, Walmart, and 500+ global retailers." 
            }
          ].map((f, i) => (
            <div key={i} className="p-10 rounded-[32px] bg-[#111113] border border-white/5 text-left hover:border-white/10 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-indigo-500/10 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">{f.title}</h3>
              <p className="text-zinc-500 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-zinc-600 text-sm font-medium">
        © 2026 VISTA AI. Built for the modern economy.
      </footer>
    </div>
  );
}