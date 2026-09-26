'use client';

import React from 'react';
import { PlayerStats, VehicleData } from '../types';
import { Minimap } from './Minimap';
import { Star, Shield, Zap, DollarSign, Compass, Gauge, AlertCircle } from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  vehicle: VehicleData | null;
  nearestVehicleName?: string | null;
  objectiveText?: string | null;
  policePositions: { x: number; y: number; z: number }[];
  vehiclePositions: { x: number; y: number; z: number }[];
  waypointPos?: { x: number; y: number; z: number } | null;
  fps?: number;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  vehicle,
  nearestVehicleName,
  objectiveText,
  policePositions,
  vehiclePositions,
  waypointPos,
  fps,
}) => {
  return (
    <div className="fixed inset-0 z-30 pointer-events-none p-4 sm:p-6 flex flex-col justify-between font-sans select-none">
      {/* Top Bar Header */}
      <div className="flex items-start justify-between">
        {/* Top-Left: Health & Stamina Bars */}
        <div className="w-56 sm:w-64 space-y-2 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 backdrop-blur pointer-events-auto">
          {/* Health Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1 text-red-400">
                <Shield className="w-3.5 h-3.5 fill-current" /> HEALTH
              </span>
              <span>{Math.round(stats.health)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-red-500/30 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-200"
                style={{ width: `${Math.max(0, Math.min(100, stats.health))}%` }}
              />
            </div>
          </div>

          {/* Stamina Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1 text-cyan-400">
                <Zap className="w-3.5 h-3.5 fill-current" /> STAMINA
              </span>
              <span>{Math.round(stats.stamina)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, stats.stamina))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top-Right: Money & Wanted Level */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Money Display */}
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-950/80 border border-emerald-500/40 text-emerald-400 font-extrabold text-lg sm:text-xl shadow-xl backdrop-blur">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>{stats.money.toLocaleString()}</span>
          </div>

          {/* 5-Star Wanted Level */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/40 backdrop-blur">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  star <= stats.wantedLevel
                    ? 'text-amber-400 fill-amber-400 animate-pulse'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          {fps !== undefined && (
            <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-cyan-400 border border-slate-800">
              {fps} FPS
            </div>
          )}
        </div>
      </div>

      {/* Center Interactive Toast (e.g. Enter Vehicle Hint) */}
      {nearestVehicleName && !stats.isDriving && (
        <div className="self-center bg-cyan-950/80 border border-cyan-400/50 text-cyan-200 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur animate-bounce pointer-events-auto">
          Press <kbd className="px-1.5 py-0.5 bg-cyan-900 rounded border border-cyan-400 text-white font-mono">F</kbd> to enter {nearestVehicleName}
        </div>
      )}

      {/* Bottom Row Footer */}
      <div className="flex items-end justify-between gap-4">
        {/* Bottom-Left: Minimap */}
        <div className="pointer-events-auto">
          <Minimap
            playerPos={stats.position}
            playerRotation={stats.rotation}
            policePositions={policePositions}
            vehiclePositions={vehiclePositions}
            waypointPos={waypointPos}
          />
        </div>

        {/* Bottom-Center: Objective Banner */}
        {objectiveText && (
          <div className="max-w-md w-full bg-slate-950/85 border border-amber-500/50 p-3 rounded-2xl text-center shadow-2xl backdrop-blur pointer-events-auto">
            <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-bold text-amber-400 tracking-wider mb-0.5">
              <Compass className="w-4 h-4" /> Current Mission Objective
            </div>
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-snug">
              {objectiveText}
            </p>
          </div>
        )}

        {/* Bottom-Right: Speedometer (when driving) */}
        {vehicle && stats.isDriving ? (
          <div className="w-40 sm:w-48 p-3.5 bg-slate-950/80 border border-cyan-500/40 rounded-2xl backdrop-blur space-y-1 text-right pointer-events-auto">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1 text-cyan-400">
                <Gauge className="w-4 h-4" /> SPEED
              </span>
              <span className="text-base font-extrabold text-white">
                {Math.round(Math.abs(vehicle.speed) * 3.6)} <span className="text-xs text-slate-400">KM/H</span>
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 truncate">
              {vehicle.name}
            </div>
          </div>
        ) : (
          <div className="w-36" />
        )}
      </div>
    </div>
  );
};
