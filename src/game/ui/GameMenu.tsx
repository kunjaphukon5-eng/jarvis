'use client';

import React, { useState } from 'react';
import { Mission, VehicleData, SaveData } from '../types';
import {
  Play,
  Crosshair,
  Car,
  Sliders,
  HelpCircle,
  Save,
  LogOut,
  X,
  Check,
  DollarSign,
  Shield,
  Volume2,
  VolumeX,
  Cpu
} from 'lucide-react';

interface GameMenuProps {
  isOpen: boolean;
  onClose: () => void;
  missions: Mission[];
  onStartMission: (id: string) => void;
  vehicles: VehicleData[];
  playerMoney: number;
  onBuyVehicle: (id: string, price: number) => void;
  graphicsQuality: 'LOW' | 'MEDIUM' | 'HIGH';
  onChangeGraphics: (quality: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onSaveGame: () => void;
  onLoadGame: () => void;
  onExitToLanding: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  isOpen,
  onClose,
  missions,
  onStartMission,
  vehicles,
  playerMoney,
  onBuyVehicle,
  graphicsQuality,
  onChangeGraphics,
  isMuted,
  onToggleMute,
  onSaveGame,
  onLoadGame,
  onExitToLanding,
}) => {
  const [activeTab, setActiveTab] = useState<'MISSIONS' | 'GARAGE' | 'SETTINGS' | 'CONTROLS'>('MISSIONS');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-4xl h-[85vh] rounded-3xl bg-[#090d16] border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Navigation Sidebar */}
        <div className="w-full md:w-64 bg-slate-950/80 p-4 border-r border-slate-800/80 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* Branding Header */}
            <div>
              <h2 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 bg-clip-text text-transparent">
                NEON CITY
              </h2>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-mono">
                Pause Menu
              </p>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1">
              <button
                onClick={onClose}
                className="w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-2.5 shadow-lg shadow-cyan-500/20"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Game</span>
              </button>

              <button
                onClick={() => setActiveTab('MISSIONS')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'MISSIONS'
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Crosshair className="w-4 h-4" />
                <span>Story Missions</span>
              </button>

              <button
                onClick={() => setActiveTab('GARAGE')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'GARAGE'
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Garage & Showroom</span>
              </button>

              <button
                onClick={() => setActiveTab('SETTINGS')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'SETTINGS'
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Graphics & Sound</span>
              </button>

              <button
                onClick={() => setActiveTab('CONTROLS')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'CONTROLS'
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Controls Guide</span>
              </button>
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <div className="flex gap-2">
              <button
                onClick={onSaveGame}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save</span>
              </button>
              <button
                onClick={onLoadGame}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 flex items-center justify-center gap-1.5"
              >
                <span>Load</span>
              </button>
            </div>

            <button
              onClick={onExitToLanding}
              className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold border border-red-500/30 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit to Main Menu</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
          {activeTab === 'MISSIONS' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-cyan-400" /> Neon City Story Missions
              </h3>
              <div className="space-y-3">
                {missions.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      m.status === 'IN_PROGRESS'
                        ? 'bg-cyan-950/40 border-cyan-500/50'
                        : m.status === 'COMPLETED'
                        ? 'bg-emerald-950/30 border-emerald-500/30'
                        : m.status === 'AVAILABLE'
                        ? 'bg-slate-900/80 border-slate-700/80'
                        : 'bg-slate-950/50 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-100 text-sm">{m.title}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-mono uppercase font-semibold ${
                              m.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : m.status === 'IN_PROGRESS'
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : m.status === 'AVAILABLE'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2">
                          {m.description}
                        </p>
                        <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" /> Reward: ${m.reward.toLocaleString()}
                        </div>
                      </div>

                      {m.status === 'AVAILABLE' && (
                        <button
                          onClick={() => {
                            onStartMission(m.id);
                            onClose();
                          }}
                          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shrink-0"
                        >
                          Start Mission
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'GARAGE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Car className="w-5 h-5 text-cyan-400" /> Vehicle Showroom
                </h3>
                <div className="text-xs font-bold text-emerald-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  Your Balance: ${playerMoney.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 text-sm">{v.name}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {v.type}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div>Top Speed: {v.topSpeed * 3.6} KM/H</div>
                      <div>Handling: {v.handling}</div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="font-bold text-emerald-400 text-xs">
                        ${v.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => onBuyVehicle(v.id, v.price)}
                        disabled={playerMoney < v.price}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold"
                      >
                        Purchase
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'SETTINGS' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" /> Graphics & Performance
              </h3>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Graphics Quality Preset
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => onChangeGraphics(q)}
                      className={`py-3 rounded-2xl font-bold text-xs border transition-all ${
                        graphicsQuality === q
                          ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Audio Engine
                </label>
                <button
                  onClick={onToggleMute}
                  className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 hover:bg-slate-800"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-4 h-4 text-red-400" />
                      <span>Sound Muted</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>Audio Active</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'CONTROLS' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" /> Controls Guide
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-cyan-400">WASD / Arrow Keys</div>
                  <div className="text-slate-400">Move Player / Steer Vehicle</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-cyan-400">Shift Key</div>
                  <div className="text-slate-400">Sprint / High Speed Accelerate</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-cyan-400">Space Key</div>
                  <div className="text-slate-400">Jump / Handbrake</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-cyan-400">F Key</div>
                  <div className="text-slate-400">Enter or Exit Nearest Vehicle</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-cyan-400">Mouse Drag</div>
                  <div className="text-slate-400">Orbit Camera Angle</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-cyan-400">Esc Key</div>
                  <div className="text-slate-400">Open / Close Game Menu</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
