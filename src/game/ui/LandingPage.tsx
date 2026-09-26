'use client';

import React from 'react';
import { Play, Sparkles, ShieldAlert, Car, Compass, Bot, Flame, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onPlayNow: () => void;
  onSwitchToJarvis: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onPlayNow, onSwitchToJarvis }) => {
  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-white">
      {/* Dynamic Background Neon Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg border border-cyan-400/40 bg-slate-900">
            <img src="/logo.png" alt="Neon City Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
              NEON CITY
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              3D Open World Action Game
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToJarvis}
            className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/60 flex items-center gap-2 transition-all"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Switch to Jarvis AI</span>
          </button>
          <button
            onClick={onPlayNow}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>PLAY NOW</span>
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-6 py-16 md:py-24 text-center space-y-8 my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" /> 100% Original 3D WebGL Game Engine
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-none">
            ENTER THE <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 bg-clip-text text-transparent">
              OPEN WORLD
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-sm md:text-base leading-relaxed">
            Explore <strong className="text-slate-200">Neon City</strong>—a high-performance, 3D open-world browser action game featuring high-speed fictional vehicles, police pursuit AI, story missions, and dynamic city districts.
          </p>
        </div>

        {/* Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onPlayNow}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-sm md:text-base shadow-2xl shadow-cyan-500/30 flex items-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>LAUNCH GAME NOW</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Game Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-12 text-left">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 backdrop-blur">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit border border-cyan-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">Vast 3D City</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Downtown skyscrapers, airport, residential zones, harbor docks & highway overpasses.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 backdrop-blur">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit border border-indigo-500/20">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">Original Vehicles</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drive Hyperion GT, Viper V8, Titan 4x4, motorcycles, and trucks with real driving physics.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 backdrop-blur">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 w-fit border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">Police Pursuit AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              5-Star wanted level system with siren cruiser chases, escape zones, and tactical AI.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 backdrop-blur">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 w-fit border border-purple-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">5 Story Missions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete delivery runs, harbor getaways, and airport heists to earn cash rewards.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 border-t border-slate-900">
        Neon City 3D Engine • 100% Original Artwork & Codebase
      </footer>
    </div>
  );
};
