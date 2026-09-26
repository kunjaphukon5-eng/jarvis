'use client';

import React, { useState } from 'react';
import { ArrowUp, Zap, Car, Swords, Hand } from 'lucide-react';

interface MobileControlsProps {
  onVirtualKey: (key: string, pressed: boolean) => void;
  isDriving: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onVirtualKey, isDriving }) => {
  return (
    <div className="md:hidden fixed inset-0 z-40 pointer-events-none p-4 flex flex-col justify-between select-none">
      {/* Top spacer */}
      <div />

      {/* Bottom Touch Control Dock */}
      <div className="flex items-end justify-between gap-4">
        {/* Left Side: Virtual D-Pad Joystick Buttons */}
        <div className="pointer-events-auto grid grid-cols-3 gap-1.5 w-36 h-36 p-2 rounded-3xl bg-slate-950/60 border border-slate-800/80 backdrop-blur">
          <div />
          <button
            onTouchStart={() => onVirtualKey('KeyW', true)}
            onTouchEnd={() => onVirtualKey('KeyW', false)}
            className="flex items-center justify-center rounded-xl bg-slate-800/80 active:bg-cyan-500 text-white"
          >
            ▲
          </button>
          <div />

          <button
            onTouchStart={() => onVirtualKey('KeyA', true)}
            onTouchEnd={() => onVirtualKey('KeyA', false)}
            className="flex items-center justify-center rounded-xl bg-slate-800/80 active:bg-cyan-500 text-white"
          >
            ◀
          </button>
          <div className="flex items-center justify-center text-[9px] text-slate-500 font-bold uppercase">
            MOVE
          </div>
          <button
            onTouchStart={() => onVirtualKey('KeyD', true)}
            onTouchEnd={() => onVirtualKey('KeyD', false)}
            className="flex items-center justify-center rounded-xl bg-slate-800/80 active:bg-cyan-500 text-white"
          >
            ▶
          </button>

          <div />
          <button
            onTouchStart={() => onVirtualKey('KeyS', true)}
            onTouchEnd={() => onVirtualKey('KeyS', false)}
            className="flex items-center justify-center rounded-xl bg-slate-800/80 active:bg-cyan-500 text-white"
          >
            ▼
          </button>
          <div />
        </div>

        {/* Right Side: Action Touch Buttons */}
        <div className="pointer-events-auto flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onTouchStart={() => onVirtualKey('ShiftLeft', true)}
              onTouchEnd={() => onVirtualKey('ShiftLeft', false)}
              className="w-12 h-12 rounded-full bg-cyan-600/80 active:bg-cyan-400 text-white flex items-center justify-center shadow-lg border border-cyan-400/40"
              title="Sprint"
            >
              <Zap className="w-5 h-5" />
            </button>

            <button
              onTouchStart={() => onVirtualKey('Space', true)}
              onTouchEnd={() => onVirtualKey('Space', false)}
              className="w-12 h-12 rounded-full bg-indigo-600/80 active:bg-indigo-400 text-white flex items-center justify-center shadow-lg border border-indigo-400/40"
              title="Jump"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onTouchStart={() => onVirtualKey('KeyF', true)}
              onTouchEnd={() => onVirtualKey('KeyF', false)}
              className="w-12 h-12 rounded-full bg-amber-600/80 active:bg-amber-400 text-white flex items-center justify-center shadow-lg border border-amber-400/40"
              title="Enter/Exit Vehicle"
            >
              <Car className="w-5 h-5" />
            </button>

            <button
              onTouchStart={() => onVirtualKey('KeyE', true)}
              onTouchEnd={() => onVirtualKey('KeyE', false)}
              className="w-12 h-12 rounded-full bg-emerald-600/80 active:bg-emerald-400 text-white flex items-center justify-center shadow-lg border border-emerald-400/40"
              title="Interact / Attack"
            >
              <Hand className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
